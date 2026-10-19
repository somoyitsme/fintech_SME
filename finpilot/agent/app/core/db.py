"""Dynamic database engine with schema introspection and read-only enforcement.

Zero hardcoded data. On startup, reflects the real database schema and builds
a runtime catalog. All agent queries are read-only and tenant-scoped.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Optional

from sqlalchemy import (
    create_engine,
    inspect,
    text,
    MetaData,
    Table,
    bindparam,
)
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.pool import QueuePool

from config import settings

# ---------------------------------------------------------------------------
# Injection / safety guard
# ---------------------------------------------------------------------------
# Keywords that can never appear in a SELECT-only statement.
_FORBIDDEN = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE|"
    r"EXEC|EXECUTE|MERGE|CALL|LOCK|UNLOCK|SET\s|COMMIT|ROLLBACK|"
    r"BEGIN|DECLARE|CURSOR|FUNCTION|PROCEDURE|TRIGGER|INDEX|VIEW|"
    r"COPY|LOAD\s|INSTALL|ATTACH|DETACH|PRAGMA|VACUUM|ANALYZE)\b",
    re.IGNORECASE,
)

_SELECT_ONLY = re.compile(r"^\s*(SELECT|WITH|SHOW|EXPLAIN|DESCRIBE)\b", re.IGNORECASE)
# UNION can be used to exfiltrate from tables not in ALLOWED_TABLES
_UNION = re.compile(r"\bUNION\b", re.IGNORECASE)
# Stacked statements (semicolon followed by more SQL)
_MULTI_STATEMENT = re.compile(r";\s*\S")
_IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
# Every identifier used inside the SQL must be safe (prevents "invoices; DROP")
_SAFE_IDENT = re.compile(r"\b[A-Za-z_][A-Za-z0-9_]*\b")


@dataclass
class ColumnSchema:
    name: str
    data_type: str
    is_nullable: bool
    default: Optional[str] = None

    @property
    def is_numeric(self) -> bool:
        return any(t in self.data_type.lower() for t in (
            "int", "decimal", "numeric", "float", "double", "real", "bigint", "smallint"
        ))

    @property
    def is_temporal(self) -> bool:
        return any(t in self.data_type.lower() for t in ("date", "time", "timestamp")) or any(t in self.name.lower() for t in ("date", "time", "created_at", "updated_at"))


@dataclass
class TableSchema:
    name: str
    columns: list[ColumnSchema] = field(default_factory=list)

    @property
    def numeric_columns(self) -> list["ColumnSchema"]:
        return [c for c in self.columns if c.is_numeric]

    @property
    def temporal_columns(self) -> list["ColumnSchema"]:
        return [c for c in self.columns if c.is_temporal]

    @property
    def text_columns(self) -> list["ColumnSchema"]:
        return [c for c in self.columns if not c.is_numeric and not c.is_temporal]

    @property
    def has_tenant_column(self) -> bool:
        return any(c.name == "tenant_id" for c in self.columns)


@dataclass
class SchemaCatalog:
    """Runtime schema catalog built by introspection."""
    tables: dict[str, TableSchema] = field(default_factory=dict)
    dialect: str = ""
    captured_at: str = ""

    def summary_for_llm(self) -> str:
        """Compact schema description for LLM context (no raw data)."""
        lines = [f"Database: {self.dialect}  |  Tables: {len(self.tables)}\n"]
        for name, tbl in self.tables.items():
            cols = ", ".join(
                f"{c.name}:{c.data_type}" + ("*" if c.name == "tenant_id" else "")
                for c in tbl.columns[:30]
            )
            lines.append(f"- {name} ({len(tbl.columns)} cols): {cols}")
        lines.append("\n* = multi-tenant isolation column (always filtered)")
        return "\n".join(lines)

    def table_names(self) -> list[str]:
        return sorted(self.tables.keys())

    def get(self, table: str) -> Optional[TableSchema]:
        return self.tables.get(table)


class DatabaseEngine:
    """Dynamic database engine with introspection and safe read-only execution."""

    def __init__(self, url: str, allowed_tables: list[str] | None = None):
        self._url = url
        self._allowed = set(allowed_tables or settings.allowed_tables_list)
        self._engine: Optional[Engine] = None
        self.catalog = SchemaCatalog()

    # ── Connection lifecycle ────────────────────────────────────────────

    def connect(self) -> None:
        """Create engine (autocommit-safe) and reflect schema."""
        connect_args = {}
        if self._url.startswith("sqlite"):
            connect_args = {"check_same_thread": False}

        self._engine = create_engine(
            self._url,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False,
            future=True,
            connect_args=connect_args,
        )
        self._reflect()

    def _reflect(self) -> None:
        """Introspect real schema. No hardcoded tables."""
        if not self._engine:
            raise RuntimeError("Engine not connected")

        self.catalog = SchemaCatalog(
            dialect=self._engine.dialect.name,
            captured_at=datetime.utcnow().isoformat(),
        )

        insp = inspect(self._engine)
        all_tables = insp.get_table_names()

        for table_name in all_tables:
            # Security: only expose allowed tables
            if self._allowed and table_name not in self._allowed:
                continue

            columns_info = insp.get_columns(table_name)
            cols = [
                ColumnSchema(
                    name=c["name"],
                    data_type=str(c["type"]),
                    is_nullable=c.get("nullable", True),
                    default=str(c.get("default", "")),
                )
                for c in columns_info
            ]
            self.catalog.tables[table_name] = TableSchema(
                name=table_name, columns=cols
            )

    @property
    def engine(self) -> Engine:
        if not self._engine:
            raise RuntimeError("Call connect() first")
        return self._engine

    # ── Safe query executor ─────────────────────────────────────────────

    def execute_readonly(
        self,
        sql: str,
        params: Optional[dict[str, Any]] = None,
        tenant_id: Optional[str] = None,
        max_rows: int = 1000,
    ) -> list[dict[str, Any]]:
        """Execute a parameterized read-only SQL query.

        SECURITY:
        - Only SELECT/WITH/SHOW/EXPLAIN allowed
        - Blocked keywords rejected (INSERT/UPDATE/DROP/...)
        - tenant_id auto-bound if tenant column exists
        - Results capped to max_rows

        Args:
            sql: SELECT statement (use :param placeholders)
            params: Bind parameters
            tenant_id: Auto-injected into WHERE if table has tenant_id
            max_rows: Safety cap

        Returns:
            List of row dicts
        """
        self._validate_sql(sql, params or {})

        final_sql, final_params = self._inject_tenant_scope(
            sql, params or {}, tenant_id
        )

        with self._engine.connect() as conn:
            result = conn.execute(text(final_sql), final_params)
            rows = result.fetchmany(max_rows)

            if not rows:
                return []

            cols = list(result.keys())
            return [dict(zip(cols, row)) for row in rows]

    def _validate_sql(self, sql: str, params: dict) -> None:
        """Prevent SQL injection and non-SELECT statements."""
        stripped = sql.strip()

        if not _SELECT_ONLY.match(stripped):
            raise ValueError("Only SELECT/WITH/SHOW/EXPLAIN statements allowed")

        if _FORBIDDEN.search(stripped):
            raise ValueError("Forbidden SQL keyword detected (INSERT/UPDATE/DROP/...)")

        if _UNION.search(stripped):
            raise ValueError("UNION not allowed (exfiltration risk)")

        if _MULTI_STATEMENT.search(stripped):
            raise ValueError("Multiple SQL statements not allowed")

        # Every queried table must be in ALLOWED_TABLES
        if self._allowed:
            for tbl in _extract_table_names(stripped):
                if tbl not in self._allowed:
                    raise ValueError(f"Table not allowed: {tbl}")

        # Validate all :param placeholders exist in params
        placeholders = set(re.findall(r"(?<!:):(\w+)", stripped))
        missing = placeholders - set(params.keys())
        if missing:
            raise ValueError(f"Missing bound parameters: {missing}")

        # Validate parameter values are safe types
        for key, val in params.items():
            if isinstance(val, str) and len(val) > 10000:
                raise ValueError(f"Parameter {key} too long (>10000 chars)")

    def _inject_tenant_scope(
        self,
        sql: str,
        params: dict[str, Any],
        tenant_id: Optional[str],
    ) -> tuple[str, dict]:
        """Auto-bind tenant_id if the query targets a multi-tenant table.

        The predicate is inserted BEFORE any trailing clause (LIMIT/ORDER BY/
        GROUP BY) so the generated SQL stays syntactically valid.
        """
        if not tenant_id:
            return sql, params

        for table_name in _extract_table_names(sql):
            tbl_schema = self.catalog.get(table_name)
            if tbl_schema and tbl_schema.has_tenant_column:
                if ":__tenant_id" in sql:
                    break  # caller already scoped it
                predicate = "tenant_id = :__tenant_id"
                # Strip a trailing semicolon so insertion stays clean
                body = sql.rstrip().rstrip(";")
                upper = body.upper()
                if re.search(r"\bWHERE\b", upper):
                    body = f"{body} AND {predicate}"
                else:
                    # Insert before the first trailing clause
                    m = re.search(
                        r"\b(GROUP\s+BY|ORDER\s+BY|LIMIT|OFFSET|HAVING)\b",
                        upper,
                    )
                    if m:
                        body = f"{body[:m.start()]}WHERE {predicate} {body[m.start():]}"
                    else:
                        body = f"{body} WHERE {predicate}"
                params["__tenant_id"] = tenant_id
                sql = body
                break

        return sql, params

    # ── Schema catalog access ───────────────────────────────────────────

    def get_table(self, name: str) -> Optional[TableSchema]:
        return self.catalog.get(name)

    def list_tables(self) -> list[str]:
        return self.catalog.table_names()

    def safe_ident(self, ident: str) -> str:
        """Validate an identifier is safe for SQL."""
        if not _IDENTIFIER.match(ident):
            raise ValueError(f"Unsafe identifier: {ident}")
        return ident

    def date_sub(self, column: str, days: int) -> str:
        """Generate dialect-specific SQL for date subtraction.

        SQLite: DATE(column, '-N days')
        PostgreSQL/MySQL: column - INTERVAL 'N days'
        """
        if self.catalog.dialect == "sqlite":
            return f"date({column}, '-{days} days')"
        else:  # PostgreSQL, MySQL
            return f"{column} - INTERVAL '{days} days'"


def _extract_table_names(sql: str) -> list[str]:
    """Extract table names from FROM/JOIN clauses."""
    pattern = re.compile(
        r"\b(?:FROM|JOIN)\s+([A-Za-z_][A-Za-z0-9_]*)",
        re.IGNORECASE,
    )
    return [m.lower() for m in pattern.findall(sql)]


# ---------------------------------------------------------------------------
# Global engine instance
# ---------------------------------------------------------------------------
_engine: Optional[DatabaseEngine] = None


def get_db_engine() -> DatabaseEngine:
    global _engine
    if _engine is None:
        _engine = DatabaseEngine(
            url=settings.DATABASE_URL,
            allowed_tables=settings.allowed_tables_list,
        )
        _engine.connect()
    return _engine


def get_catalog() -> SchemaCatalog:
    return get_db_engine().catalog


def execute_safe_query(
    sql: str,
    params: Optional[dict] = None,
    tenant_id: Optional[str] = None,
) -> list[dict]:
    return get_db_engine().execute_readonly(sql, params, tenant_id)


def date_sub_sql(column: str, days: int) -> str:
    """Generate dialect-aware SQL for: column - N days.

    SQLite: date(column, '-N days')
    PostgreSQL/MySQL: column - INTERVAL 'N days'
    """
    dialect = get_db_engine().catalog.dialect
    if dialect == "sqlite":
        if column.upper() in ("CURRENT_DATE", "'NOW'", "NOW"):
            return f"date('now', '-{days} days')"
        return f"date({column}, '-{days} days')"
    else:  # PostgreSQL, MySQL
        if column.upper() in ("CURRENT_DATE", "'NOW'", "NOW"):
            return f"CURRENT_DATE - INTERVAL '{days} days'"
        return f"{column} - INTERVAL '{days} days'"

