#!/bin/bash
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== MasTrade Deployment Script ===${NC}"

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}Creating .env.production from template...${NC}"
    cp .env.production.example .env.production
    echo -e "${YELLOW}Please edit .env.production and update configuration values${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are available${NC}"

# Create necessary directories
echo -e "${YELLOW}Creating data directories...${NC}"
mkdir -p backend/data
mkdir -p backend/logs
mkdir -p nginx/ssl
chmod 755 backend/data backend/logs

# Pull latest images
echo -e "${YELLOW}Pulling latest images...${NC}"
docker-compose -f docker-compose.prod.yml pull

# Build images
echo -e "${YELLOW}Building images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Start containers
echo -e "${YELLOW}Starting containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 5

# Check container status
echo -e "${YELLOW}Checking container status...${NC}"
docker-compose -f docker-compose.prod.yml ps

# Final status
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "${GREEN}=== Deployment Successful ===${NC}"
    echo -e "${GREEN}✓ All services are running${NC}"
    echo -e "${YELLOW}Access your application at: http://your_vps_ip${NC}"
else
    echo -e "${RED}=== Deployment Failed ===${NC}"
    echo -e "${RED}Some services failed to start. Check logs with:${NC}"
    echo "docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi
