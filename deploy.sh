#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== MasTrade Deployment Script ===${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed.${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose v2 not found. Run: sudo apt install docker-compose-plugin${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose v2 available${NC}"

# Create required local directories
echo -e "${YELLOW}Creating data directories...${NC}"
mkdir -p backend_data
mkdir -p openclaw-config

# openclaw-config must be owned by uid 1000 (node user inside the container)
sudo chown -R 1000:1000 openclaw-config

# Pull latest OpenClaw image
echo -e "${YELLOW}Pulling latest images...${NC}"
docker compose -f docker-compose.prod.yml pull

# Build mastrade images
echo -e "${YELLOW}Building images...${NC}"
docker compose -f docker-compose.prod.yml build --no-cache

# Stop existing containers gracefully
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Start everything
echo -e "${YELLOW}Starting containers...${NC}"
docker compose -f docker-compose.prod.yml up -d

sleep 5

echo -e "${YELLOW}Container status:${NC}"
docker compose -f docker-compose.prod.yml ps

if docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "${GREEN}=== Deployment Successful ===${NC}"
    echo -e "${GREEN}✓ App:      https://www.flowmarket.io${NC}"
    echo -e "${GREEN}✓ API:      https://www.flowmarket.io/api${NC}"
    echo -e "${GREEN}✓ OpenClaw: https://openclaw.flowmarket.io${NC}"
else
    echo -e "${RED}=== Deployment Failed ===${NC}"
    echo -e "${RED}Check logs:${NC} docker compose -f docker-compose.prod.yml logs"
    exit 1
fi