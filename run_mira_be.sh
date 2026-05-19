#!/bin/bash

# Colori per i messaggi
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Avvio MiRa Companion System ===${NC}"

# 1. Entriamo subito nella cartella backend (che ora contiene sia Docker che NestJS)
cd /home/comau/Projects/mira-companion-ws/backend

# 2. Avvio del Database Docker
echo -e "${GREEN}[1/3] Avvio del database PostgreSQL (Docker)...${NC}"
docker compose up -d postgres

# 3. Attesa tecnica
echo -e "${BLUE}Attendere che il database sia pronto...${NC}"
sleep 3

# 4. Avvio di NestJS in modalità sviluppo
echo -e "${GREEN}[2/3] Avvio del server NestJS...${NC}"
echo -e "${GREEN}[3/3] Hot-Reload attivo!${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"
npm run start:dev
