#!/bin/bash

# MasTrade - Update Application

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Updating MasTrade Application ===${NC}"

# Pull latest code
echo -e "${YELLOW}Pulling latest code from repository...${NC}"
git pull origin main

# Stop containers
echo -e "${YELLOW}Stopping containers...${NC}"
docker-compose -f docker-compose.prod.yml down

# Build and start
echo -e "${YELLOW}Building and starting containers...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for health checks
sleep 5

# Verify
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "${GREEN}=== Update Successful ===${NC}"
    echo -e "${GREEN}Application is running${NC}"
else
    echo -e "${RED}=== Update Failed ===${NC}"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi
