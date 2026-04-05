#!/bin/bash

# MasTrade - System Diagnostics

set -e

echo "=== MasTrade Diagnostics ==="
echo ""

echo "--- Docker Status ---"
docker --version
docker compose version
echo ""

echo "--- Container Status ---"
docker-compose -f docker-compose.prod.yml ps
echo ""

echo "--- Container Stats ---"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""

echo "--- Disk Usage ---"
df -h | grep -E "(Filesystem|/dev|mounted)"
echo ""

echo "--- Recent Logs (last 20 lines) ---"
docker-compose -f docker-compose.prod.yml logs --tail=20
echo ""

echo "--- Health Endpoints ---"
echo "Frontend Health:"
curl -s http://localhost/health | head -c 100
echo ""
echo "Backend Health:"
curl -s http://localhost/api/health 2>/dev/null | head -c 100 || echo "Not responding"
echo ""

echo "=== End Diagnostics ==="
