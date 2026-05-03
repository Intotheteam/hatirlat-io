#!/bin/bash
# Hatirlat.io - Tek komutla tüm proje başlatma
# Kullanım: ./start-dev.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}   Hatirlat.io Gelistirme Ortami${NC}"
echo -e "${BLUE}==========================================${NC}"

# ── mvn komutunu bul ──────────────────────────────────────────────────────────
find_mvn() {
  # 1. PATH'te varsa kullan
  if command -v mvn &>/dev/null; then
    echo "mvn"
    return
  fi
  # 2. Windows'ta yaygın Maven wrapper konumu
  local WRAPPER_BASE="$HOME/.m2/wrapper/dists"
  if [ -d "$WRAPPER_BASE" ]; then
    local FOUND
    FOUND=$(find "$WRAPPER_BASE" -name "mvn" -not -name "*.cmd" 2>/dev/null | sort | tail -1)
    if [ -n "$FOUND" ]; then
      echo "$FOUND"
      return
    fi
  fi
  # 3. Yaygın Windows kurulum yerleri
  for candidate in \
    "/c/Program Files/Maven/bin/mvn" \
    "/c/Program Files/apache-maven/bin/mvn" \
    "/c/tools/maven/bin/mvn"; do
    if [ -f "$candidate" ]; then
      echo "$candidate"
      return
    fi
  done
  echo ""
}

MVN=$(find_mvn)
if [ -z "$MVN" ]; then
  echo -e "${RED}HATA: 'mvn' bulunamadi.${NC}"
  echo -e "  Cozum 1: Maven'i PATH'e ekle"
  echo -e "  Cozum 2: https://maven.apache.org/download.cgi adresinden indir"
  exit 1
fi
echo -e "${GREEN}Maven bulundu: $MVN${NC}"

cleanup() {
  echo -e "\n${YELLOW}Durduruluyor...${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  wait 2>/dev/null || true
  echo -e "${GREEN}Tum servisler kapatildi.${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Portlari Temizle ──────────────────────────────────────────────────────────
echo -e "\n${YELLOW}Assili kalan portlar temizleniyor (8080, 3000)...${NC}"
if command -v npx &> /dev/null; then
  npx --yes kill-port 8080 3000 > /dev/null 2>&1 || true
fi

# Backend
echo -e "\n${GREEN}[1/2] Backend baslatiliyor (port 8080)...${NC}"
cd "$BACKEND_DIR"
"$MVN" spring-boot:run -q &
BACKEND_PID=$!

# Backend ayağa kalkana kadar bekle
echo -e "${YELLOW}Backend hazir olana kadar bekleniyor...${NC}"
for i in $(seq 1 40); do
  if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo -e "${GREEN}Backend hazir!${NC}"
    break
  fi
  sleep 3
  if [ $i -eq 40 ]; then
    echo -e "${YELLOW}Backend henuz hazir degil, frontend yine de baslatiliyor...${NC}"
  fi
done

# Frontend logs and running process will stay in the foreground
echo -e "\n${BLUE}==========================================${NC}"
echo -e "${GREEN}Servisler calistirildi:${NC}"
echo -e "  Backend  : ${BLUE}http://localhost:8080${NC}"
echo -e "  Frontend : ${BLUE}http://localhost:3000${NC}"
echo -e "  Swagger  : ${BLUE}http://localhost:8080/swagger-ui.html${NC}"
echo -e "  Admin    : ${BLUE}http://localhost:3000/admin${NC}"
echo -e "  H2 DB    : ${BLUE}http://localhost:8080/h2-console${NC}"
echo -e "${YELLOW}Durdurmak icin: Ctrl+C${NC}"
echo -e "${BLUE}==========================================${NC}\n"

echo -e "${GREEN}[2/2] Frontend baslatiliyor (port 3000)...${NC}"
cd "$FRONTEND_DIR"
# Windows ortamlarinda loglarin tamponlanmasini (buffering) engellemek icin FORCE_COLOR kullaniyoruz
export FORCE_COLOR=1
npm run dev
