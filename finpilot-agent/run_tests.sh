#!/bin/bash
set -e

echo "Running FinPilot Agent Test Suite..."
echo "===================================="

# Run all tests with coverage
pytest tests/ \
  --cov=app \
  --cov-report=term-missing \
  --cov-report=html \
  -v \
  "$@"

echo ""
echo "===================================="
echo "Test suite completed!"
echo "Coverage report: htmlcov/index.html"
