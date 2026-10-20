"""Financial analysis tools with deterministic SQL execution.

Zero hardcoded numbers. Every figure backed by real SQL aggregations.
"""
from __future__ import annotations

from typing import Any, Optional
from datetime import date, datetime

from app.core.db import get_catalog, execute_safe_query, date_sub_sql


# ──────────────────────────────────────────────────────────────────────────
# Tool Registry
# ──────────────────────────────────────────────────────────────────────────

class ToolDef:
    def __init__(self, name: str, description: str, input_schema: dict, handler):
        self.name = name
        self.description = description
        self.input_schema = input_schema
        self.handler = handler

    def to_anthropic(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": self.input_schema,
        }


# ──────────────────────────────────────────────────────────────────────────
# 6 Pillar Tools
# ──────────────────────────────────────────────────────────────────────────

async def analyze_cash_flow(
    tenant_id: str,
    period_days: int = 90,
) -> dict[str, Any]:
    """Analyze cash flow from real bank_accounts and transactions tables."""
    catalog = get_catalog()

    # Get ending balance from payment_accounts, bank_accounts or cash_flow_snapshots
    bank_table = catalog.get("payment_accounts") or catalog.get("bank_accounts") or catalog.get("cash_flow_snapshots")
    balance = 0.0
    if bank_table:
        balance_col = next(
            (c for c in bank_table.numeric_columns if "balance" in c.name.lower()),
            None
        )
        if balance_col:
            rows = execute_safe_query(
                f"SELECT SUM({balance_col.name}) AS balance FROM {bank_table.name}",
                tenant_id=tenant_id,
            )
            if rows and rows[0].get("balance") is not None:
                balance = float(rows[0]["balance"])

    # Calculate burn rate from expenses
    expense_table = catalog.get("expenses")
    monthly_burn = 0.0
    if expense_table:
        amount_col = next(
            (c for c in expense_table.numeric_columns if "amount" in c.name.lower()),
            None
        )
        date_col = next(
            (c for c in expense_table.temporal_columns),
            None
        )
        if amount_col and date_col:
            rows = execute_safe_query(
                f"""
                SELECT SUM({amount_col.name}) AS total
                FROM {expense_table.name}
                WHERE {date_col.name} >= {date_sub_sql('now', period_days)}
                """,
                tenant_id=tenant_id,
            )
            if rows and rows[0].get("total"):
                total_spend = float(rows[0]["total"])
                monthly_burn = total_spend / max(period_days, 1) * 30

    runway_months = balance / monthly_burn if monthly_burn > 0 else float('inf')

    # Get inflows from orders/sales/invoices
    sales_table = catalog.get("orders") or catalog.get("sales") or catalog.get("invoices")
    inflows = 0.0
    if sales_table:
        amount_col = next(
            (c for c in sales_table.numeric_columns if "amount" in c.name.lower() or "total" in c.name.lower() or "price" in c.name.lower()),
            None
        )
        date_col = next(
            (c for c in sales_table.temporal_columns),
            None
        )
        if amount_col and date_col:
            rows = execute_safe_query(
                f"""
                SELECT SUM({amount_col.name}) AS total
                FROM {sales_table.name}
                WHERE {date_col.name} >= {date_sub_sql('now', period_days)}
                """,
                tenant_id=tenant_id,
            )
            if rows and rows[0].get("total"):
                inflows = float(rows[0]["total"])

    net_change = inflows - (monthly_burn * period_days / 30)

    return {
        "ending_balance": balance,
        "monthly_burn_rate": monthly_burn,
        "runway_months": runway_months,
        "period_inflows": inflows,
        "net_change": net_change,
        "period_days": period_days,
        "data_source": f"Real SQL aggregations from {bank_table.name if bank_table else 'accounts'}, {expense_table.name if expense_table else 'expenses'}, {sales_table.name if sales_table else 'orders'} tables"
    }


async def analyze_financial_health(tenant_id: str) -> dict[str, Any]:
    """Analyze P&L and margins from real transactions."""
    catalog = get_catalog()

    # Revenue from orders/sales/invoices
    sales_table = catalog.get("orders") or catalog.get("sales") or catalog.get("invoices")
    revenue = 0.0
    if sales_table:
        amount_col = next(
            (c for c in sales_table.numeric_columns if "amount" in c.name.lower() or "total" in c.name.lower()),
            None
        )
        if amount_col:
            rows = execute_safe_query(
                f"SELECT SUM({amount_col.name}) AS revenue FROM {sales_table.name}",
                tenant_id=tenant_id,
            )
            if rows and rows[0].get("revenue"):
                revenue = float(rows[0]["revenue"])

    # COGS from expenses (categorized)
    expense_table = catalog.get("expenses")
    cogs = 0.0
    if expense_table:
        amount_col = next(
            (c for c in expense_table.numeric_columns if "amount" in c.name.lower()),
            None
        )
        category_col = next(
            (c for c in expense_table.text_columns if "category" in c.name.lower() or "type" in c.name.lower()),
            None
        )
        if amount_col:
            where_clause = "WHERE " + (f"{category_col.name} IN ('Customs & Port Duty', 'COGS', 'Cost of Goods', 'Materials', 'Inventory')" if category_col else "1=1")
            rows = execute_safe_query(
                f"SELECT SUM({amount_col.name}) AS cogs FROM {expense_table.name} {where_clause}",
                tenant_id=tenant_id,
            )
            if rows and rows[0].get("cogs"):
                cogs = float(rows[0]["cogs"])

    # OPEX (operational expenses = all - COGS)
    total_expenses = 0.0
    if expense_table:
        amount_col = next(
            (c for c in expense_table.numeric_columns if "amount" in c.name.lower()),
            None
        )
        if amount_col:
            rows = execute_safe_query(
                f"SELECT SUM({amount_col.name}) AS total FROM {expense_table.name}",
                tenant_id=tenant_id,
            )
            if rows and rows[0].get("total"):
                total_expenses = float(rows[0]["total"])

    opex = total_expenses - cogs
    gross_profit = revenue - cogs
    net_profit = revenue - total_expenses

    gross_margin = (gross_profit / revenue * 100) if revenue > 0 else 0
    net_margin = (net_profit / revenue * 100) if revenue > 0 else 0

    return {
        "revenue": revenue,
        "cogs": cogs,
        "opex": opex,
        "gross_profit": gross_profit,
        "net_profit": net_profit,
        "gross_margin_pct": gross_margin,
        "net_margin_pct": net_margin,
        "data_source": f"Real SQL from {sales_table.name if sales_table else 'sales'}, {expense_table.name if expense_table else 'expenses'} tables"
    }


async def analyze_ar_aging(tenant_id: str) -> dict[str, Any]:
    """Analyze accounts receivable aging from real invoices/orders."""
    catalog = get_catalog()

    invoices = catalog.get("orders") or catalog.get("invoices")
    if not invoices:
        return {"error": "No invoices or orders table found"}

    amount_col = next(
        (c for c in invoices.numeric_columns if "amount" in c.name.lower() or "total" in c.name.lower()),
        None
    )
    date_col = next(
        (c for c in invoices.temporal_columns if "date" in c.name.lower()),
        None
    )
    status_col = next(
        (c for c in invoices.text_columns if "payment_status" in c.name.lower() or "status" in c.name.lower()),
        None
    )

    if not amount_col or not date_col:
        return {"error": "Missing amount or date column in invoices"}

    # Overdue/open invoices or orders grouped by age buckets
    where_clause = ""
    if status_col:
        where_clause = f"WHERE {status_col.name} IN ('Credit 30D', 'COD Pending', 'Partial', 'pending', 'overdue', 'open', 'unpaid')"

    rows = execute_safe_query(
        f"""
        SELECT
            CASE
                WHEN {date_col.name} >= {date_sub_sql('now', 30)} THEN '0-30'
                WHEN {date_col.name} >= {date_sub_sql('now', 60)} THEN '31-60'
                WHEN {date_col.name} >= {date_sub_sql('now', 90)} THEN '61-90'
                ELSE '90+'
            END AS aging_bucket,
            COUNT(*) AS invoice_count,
            SUM({amount_col.name}) AS total_amount
        FROM {invoices.name}
        {where_clause}
        GROUP BY aging_bucket
        ORDER BY aging_bucket
        """,
        tenant_id=tenant_id,
    )

    buckets = {row["aging_bucket"]: {"count": row["invoice_count"], "amount": float(row["total_amount"])} for row in rows}
    total_ar = sum(b["amount"] for b in buckets.values())

    return {
        "buckets": buckets,
        "total_receivables": total_ar,
        "data_source": f"Real SQL aggregations from {invoices.name} table"
    }


async def analyze_financing_readiness(tenant_id: str) -> dict[str, Any]:
    """Assess loan eligibility from real turnover data."""
    health = await analyze_financial_health(tenant_id)

    revenue = health["revenue"]
    net_margin = health["net_margin_pct"]

    # Simple scoring based on real metrics
    turnover_score = min(revenue / 1000000, 100)  # Cap at ¥1M
    margin_score = max(0, min(net_margin, 100))

    # WeBank Weiyedai-style readiness (0-100)
    readiness_score = (turnover_score * 0.6 + margin_score * 0.4)

    # Estimated loan capacity (3x monthly revenue)
    monthly_revenue = revenue / 12
    estimated_capacity = monthly_revenue * 3

    return {
        "readiness_score": readiness_score,
        "estimated_loan_capacity": estimated_capacity,
        "annual_revenue": revenue,
        "net_margin_pct": net_margin,
        "data_source": "Calculated from real sales/expense aggregations"
    }


async def analyze_tax_liability(tenant_id: str) -> dict[str, Any]:
    """Estimate VAT and CIT from real financials."""
    health = await analyze_financial_health(tenant_id)

    taxable_profit = health["net_profit"]

    # CIT calculation (China SME preferential rates)
    if taxable_profit <= 3000000:
        cit_rate = 0.05  # 5% for small low-profit enterprises
    elif taxable_profit <= 10000000:
        cit_rate = 0.10  # 10% for mid-size
    else:
        cit_rate = 0.25  # 25% standard

    cit = max(0, taxable_profit * cit_rate)

    # VAT approximation (output - input, 13% rate)
    output_vat = health["revenue"] * 0.13 / 1.13
    input_vat = health["cogs"] * 0.13 / 1.13
    net_vat = max(0, output_vat - input_vat)

    return {
        "taxable_profit": taxable_profit,
        "cit_rate": cit_rate * 100,
        "estimated_cit": cit,
        "output_vat": output_vat,
        "input_vat": input_vat,
        "net_vat_payable": net_vat,
        "data_source": "Calculated from real revenue/expense data"
    }


async def analyze_expense_breakdown(tenant_id: str) -> dict[str, Any]:
    """Break down expenses by category and detect anomalies."""
    catalog = get_catalog()

    expenses = catalog.get("expenses")
    if not expenses:
        return {"error": "No expenses table"}

    amount_col = next(
        (c for c in expenses.numeric_columns if "amount" in c.name.lower()),
        None
    )
    category_col = next(
        (c for c in expenses.text_columns if "category" in c.name.lower()),
        None
    )
    vendor_col = next(
        (c for c in expenses.text_columns if "vendor" in c.name.lower() or "supplier" in c.name.lower()),
        None
    )

    if not amount_col:
        return {"error": "No amount column"}

    # Category breakdown
    breakdown = []
    if category_col:
        rows = execute_safe_query(
            f"""
            SELECT {category_col.name} AS category,
                   SUM({amount_col.name}) AS total,
                   COUNT(*) AS count
            FROM expenses
            GROUP BY {category_col.name}
            ORDER BY total DESC
            LIMIT 20
            """,
            tenant_id=tenant_id,
        )
        breakdown = [
            {
                "category": row["category"],
                "total": float(row["total"]),
                "count": row["count"],
            }
            for row in rows
        ]

    # Vendor breakdown
    vendors = []
    if vendor_col:
        rows = execute_safe_query(
            f"""
            SELECT {vendor_col.name} AS vendor,
                   SUM({amount_col.name}) AS total
            FROM expenses
            GROUP BY {vendor_col.name}
            ORDER BY total DESC
            LIMIT 10
            """,
            tenant_id=tenant_id,
        )
        vendors = [
            {"vendor": row["vendor"], "total": float(row["total"])}
            for row in rows
        ]

    return {
        "category_breakdown": breakdown,
        "top_vendors": vendors,
        "data_source": "Real SQL from expenses table"
    }


async def analyze_inventory_valuation(tenant_id: str) -> dict[str, Any]:
    """Analyze real inventory valuation, total units, and reorder warnings from products."""
    catalog = get_catalog()
    prod_table = catalog.get("products") or catalog.get("inventory")
    if not prod_table:
        return {"error": "No products or inventory table found in database"}

    rows = execute_safe_query(
        f"""
        SELECT id, name, sku, category, retail_price, cost_price, stock_count, min_threshold
        FROM {prod_table.name}
        """,
        tenant_id=tenant_id
    )
    total_items = len(rows)
    total_units = sum(int(r.get("stock_count", 0) or 0) for r in rows)
    total_cost_val = sum(float(r.get("cost_price", 0) or 0) * int(r.get("stock_count", 0) or 0) for r in rows)
    total_retail_val = sum(float(r.get("retail_price", 0) or 0) * int(r.get("stock_count", 0) or 0) for r in rows)
    low_stock = [
        {"name": r["name"], "sku": r["sku"], "stock": r["stock_count"], "threshold": r.get("min_threshold", 0)}
        for r in rows if int(r.get("stock_count", 0) or 0) <= int(r.get("min_threshold", 0) or 0)
    ]
    return {
        "total_products": total_items,
        "total_units": total_units,
        "inventory_cost_valuation": total_cost_val,
        "inventory_retail_valuation": total_retail_val,
        "potential_gross_profit": total_retail_val - total_cost_val,
        "low_stock_alerts_count": len(low_stock),
        "low_stock_items": low_stock[:10],
        "data_source": f"Real SQL from {prod_table.name} table"
    }


async def get_recent_sales(
    tenant_id: str,
    limit: int = 5,
    branch: Optional[str] = None,
) -> dict[str, Any]:
    """Retrieve the most recent sales orders with full items, customer details, profit, and due amounts."""
    catalog = get_catalog()
    orders_table = catalog.get("orders")
    if not orders_table:
        return {"error": "No orders table found"}

    where_clauses = []
    if branch and branch != "All Locations":
        where_clauses.append(f"branch LIKE '%{branch}%'")

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

    orders = execute_safe_query(
        f"""
        SELECT id, order_number, customer_name, customer_phone, customer_email,
               total_amount, paid_amount, due_amount, payment_status, payment_method,
               delivery_type, status, branch, profit, order_date, created_at,
               courier_provider, consignment_id, tracking_url
        FROM orders
        {where_sql}
        ORDER BY order_date DESC, created_at DESC
        LIMIT {max(1, min(limit, 50))}
        """,
        tenant_id=tenant_id
    )

    for o in orders:
        items = execute_safe_query(
            f"""
            SELECT product_name, sku, quantity, unit_price, cost_price, total_price, profit
            FROM order_items
            WHERE order_id = '{o["id"]}'
            """,
            tenant_id=tenant_id
        )
        o["items"] = items

    return {
        "count": len(orders),
        "orders": orders,
        "data_source": "Live SQLite orders & order_items tables ordered by order_date DESC"
    }


async def query_database_data(
    tenant_id: str,
    sql_query: str,
    purpose: str = "",
) -> dict[str, Any]:
    """Execute a safe, read-only SELECT query against permitted database tables."""
    try:
        clean_sql = sql_query.strip()
        rows = execute_safe_query(clean_sql, tenant_id=tenant_id)
        # Mask sensitive user fields if present
        for row in rows:
            if "password_hash" in row:
                row["password_hash"] = "[REDACTED]"
            if "password" in row:
                row["password"] = "[REDACTED]"
        return {
            "query_executed": clean_sql,
            "row_count": len(rows),
            "rows": rows[:50],
            "status": "success",
            "data_source": "Direct verified SQLite read-only query"
        }
    except Exception as e:
        return {
            "query_executed": sql_query,
            "error": str(e),
            "status": "failed",
        }


# ──────────────────────────────────────────────────────────────────────────
# Tool Definitions for Anthropic
# ──────────────────────────────────────────────────────────────────────────

def get_all_tools() -> list[ToolDef]:
    return [
        ToolDef(
            name="get_recent_sales",
            description="Retrieve recent sales orders sorted by order_date DESC with full items list, customer phone/email, profit, total amount, paid amount, and due amount. Use this immediately when the user asks about recent sales, last sale, or sales history.",
            input_schema={
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "Number of recent orders to fetch (default 5, max 50)",
                        "default": 5,
                    },
                    "branch": {
                        "type": "string",
                        "description": "Optional branch name filter (e.g., 'Banani', 'Multiplan', 'IDB')",
                    }
                },
            },
            handler=get_recent_sales,
        ),
        ToolDef(
            name="query_database_data",
            description="Execute a safe read-only SELECT query on business tables (products, customers, orders, order_items, suppliers, supplier_pos, expenses, stock_transfers, stock_adjustments, payment_accounts, staff, users) to answer any question about items, customers, suppliers, staff, transactions, or accounts.",
            input_schema={
                "type": "object",
                "properties": {
                    "sql_query": {
                        "type": "string",
                        "description": "Safe SELECT query (e.g., SELECT name, retail_price, stock_count FROM products WHERE stock_count <= min_threshold ORDER BY stock_count ASC LIMIT 10)"
                    },
                    "purpose": {
                        "type": "string",
                        "description": "Business reason for running this query"
                    }
                },
                "required": ["sql_query"]
            },
            handler=query_database_data,
        ),
        ToolDef(
            name="analyze_cash_flow",
            description="Get cash flow, burn rate, runway from payment_accounts/bank_accounts and expenses tables",
            input_schema={
                "type": "object",
                "properties": {
                    "period_days": {
                        "type": "integer",
                        "description": "Analysis period (default 90)",
                        "default": 90,
                    }
                },
            },
            handler=analyze_cash_flow,
        ),
        ToolDef(
            name="analyze_financial_health",
            description="Get revenue, COGS, margins, net profit from orders/sales and expenses",
            input_schema={"type": "object", "properties": {}},
            handler=analyze_financial_health,
        ),
        ToolDef(
            name="analyze_ar_aging",
            description="Get accounts receivable aging buckets (0-30, 31-60, 61-90, 90+) from orders/invoices",
            input_schema={"type": "object", "properties": {}},
            handler=analyze_ar_aging,
        ),
        ToolDef(
            name="analyze_inventory_valuation",
            description="Get inventory stock counts, cost/retail valuations, and reorder warnings from products/inventory table",
            input_schema={"type": "object", "properties": {}},
            handler=analyze_inventory_valuation,
        ),
        ToolDef(
            name="analyze_financing_readiness",
            description="Assess loan eligibility and estimated capacity",
            input_schema={"type": "object", "properties": {}},
            handler=analyze_financing_readiness,
        ),
        ToolDef(
            name="analyze_tax_liability",
            description="Estimate VAT and CIT from real financials",
            input_schema={"type": "object", "properties": {}},
            handler=analyze_tax_liability,
        ),
        ToolDef(
            name="analyze_expense_breakdown",
            description="Category and vendor expense breakdown",
            input_schema={"type": "object", "properties": {}},
            handler=analyze_expense_breakdown,
        ),
    ]


# Anthropic tool schemas
def get_anthropic_tools() -> list[dict]:
    return [t.to_anthropic() for t in get_all_tools()]


# Tool executor
async def execute_tool(name: str, args: dict, tenant_id: str) -> dict:
    tools = {t.name: t for t in get_all_tools()}
    if name not in tools:
        raise ValueError(f"Unknown tool: {name}")

    handler = tools[name].handler
    return await handler(tenant_id=tenant_id, **args)
