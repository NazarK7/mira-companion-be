#!/bin/bash

# Colori
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Spegnimento MiRa Companion System ===${NC}"

# 1. Entriamo nella cartella backend dove si trova il file docker-compose.yml
cd /home/comau/Projects/mira-companion-ws/backend

# 2. Spegnimento del Database Docker
echo -e "${RED}Spegnimento del database PostgreSQL...${NC}"
docker compose down

echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${RED}Ambiente spento e risorse liberate.${NC}"
