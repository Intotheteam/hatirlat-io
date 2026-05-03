#!/bin/bash
# ── Hatirlat.io Deploy Script ──────────────────────────────────────────────────
# Kullanım: ./deploy.sh [--first-run]
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[→]${NC} $1"; }

FIRST_RUN=false
[[ "$1" == "--first-run" ]] && FIRST_RUN=true

echo ""
echo "  ██╗  ██╗ █████╗ ████████╗██╗██████╗ ██╗      █████╗ ████████╗"
echo "  ██║  ██║██╔══██╗╚══██╔══╝██║██╔══██╗██║     ██╔══██╗╚══██╔══╝"
echo "  ███████║███████║   ██║   ██║██████╔╝██║     ███████║   ██║   "
echo "  ██╔══██║██╔══██║   ██║   ██║██╔══██╗██║     ██╔══██║   ██║   "
echo "  ██║  ██║██║  ██║   ██║   ██║██║  ██║███████╗██║  ██║   ██║   "
echo "  ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝"
echo ""

# ── 1. .env kontrol ───────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  err ".env dosyası bulunamadı! Önce: cp .env.production .env && nano .env"
fi

# Kritik env değerlerini kontrol et
source .env
[ -z "$DB_PASSWORD" ]          && err "DB_PASSWORD boş!"
[ -z "$JWT_SECRET_KEY" ]       && err "JWT_SECRET_KEY boş!"
[ -z "$ENCRYPTION_SECRET_KEY" ] && err "ENCRYPTION_SECRET_KEY boş!"
[ ${#ENCRYPTION_SECRET_KEY} -ne 32 ] && err "ENCRYPTION_SECRET_KEY tam 32 karakter olmalı! (şu an: ${#ENCRYPTION_SECRET_KEY})"
log ".env kontrol tamam"

# ── 2. Domain değiştir (ilk kurulumda) ───────────────────────────────────────
if [ "$FIRST_RUN" = true ]; then
  if [ -z "$FRONTEND_URL" ]; then
    err "FRONTEND_URL .env içinde tanımlı değil"
  fi
  DOMAIN=$(echo "$FRONTEND_URL" | sed 's|https\?://||' | sed 's|/.*||')
  info "Domain: $DOMAIN"
  sed -i "s/YOUR_DOMAIN/$DOMAIN/g" nginx/conf.d/hatirlat.conf
  log "Nginx domain güncellendi: $DOMAIN"
fi

# ── 3. Git pull ───────────────────────────────────────────────────────────────
info "Son değişiklikler çekiliyor..."
git pull origin main
log "Git pull tamam"

# ── 4. Docker build & up ─────────────────────────────────────────────────────
info "Docker image'lar build ediliyor (bu ilk seferde 5-10 dk sürebilir)..."
docker compose build --no-cache

info "Servisler başlatılıyor..."
docker compose up -d
log "Tüm servisler ayağa kalktı"

# ── 5. Health check ───────────────────────────────────────────────────────────
info "Backend health check bekleniyor..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
    log "Backend sağlıklı"
    break
  fi
  if [ $i -eq 30 ]; then
    warn "Backend 60sn içinde yanıt vermedi. Logları kontrol et: docker compose logs backend"
  fi
  sleep 2
done

# ── 6. Durum ─────────────────────────────────────────────────────────────────
echo ""
docker compose ps
echo ""
log "Deploy tamamlandı!"
echo ""
echo "  🌐 Site     : $FRONTEND_URL"
echo "  📊 API      : $FRONTEND_URL/api/actuator/health"
echo "  📋 Loglar   : docker compose logs -f"
echo "  🔄 Yeniden  : docker compose restart"
echo ""
