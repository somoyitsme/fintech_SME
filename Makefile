.PHONY: all dev backend frontend test docker

PORT ?= 8090

all: backend

backend:
	cd finpilot/backend && .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port $(PORT) --reload

frontend:
	cd finpilot/frontend && npm run dev

test:
	cd finpilot/backend && .venv/bin/pytest tests/ -v

docker:
	cd finpilot && docker compose up -d
