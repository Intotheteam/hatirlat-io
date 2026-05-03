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
  err ".env dosyası bulunamadı!\nÇözüm: cp .env.production .env && nano .env"
fi

source .env
[ -z "$DB_PASSWORD" ]           && err "DB_PASSWORD boş! .env dosyasını düzenle."
[ -z "$JWT_SECRET_KEY" ]        && err "JWT_SECRET_KEY boş! Üret: openssl rand -hex 32"
[ -z "$ENCRYPTION_SECRET_KEY" ] && err "ENCRYPTION_SECRET_KEY boş!"
[ ${#ENCRYPTION_SECRET_KEY} -ne 32 ] && err "ENCRYPTION_SECRET_KEY tam 32 karakter olmalı! (şu an: ${#ENCRYPTION_SECRET_KEY} karakter)"
log ".env kontrol tamam"

# ── 2. İlk kurulum adımları ───────────────────────────────────────────────────
if [ "$FIRST_RUN" = true ]; then
  [ -z "$FRONTEND_URL" ] && err "FRONTEND_URL .env içinde tanımlı değil"

  DOMAIN=$(echo "$FRONTEND_URL" | sed 's|https\?://||' | sed 's|/.*||')
  info "Domain: $DOMAIN"

  # HTTP-only nginx config ile başla (SSL yokken)
  cp nginx/conf.d/hatirlat.conf.http-only nginx/conf.d/hatirlat.conf
  sed -i "s/YOUR_DOMAIN/$DOMAIN/g" nginx/conf.d/hatirlat.conf
  log "Nginx HTTP-only config aktif edildi: $DOMAIN"

  # deploy.sh için çalıştırma izni
  chmod +x deploy.sh
fi

# ── 3. Git pull ───────────────────────────────────────────────────────────────
info "Son değişiklikler çekiliyor..."
git pull origin main
log "Git pull tamam"

# ── 4. Build & up ─────────────────────────────────────────────────────────────
info "Docker image'lar build ediliyor..."
docker compose build --no-cache

info "Servisler başlatılıyor..."
docker compose up -d
log "Tüm servisler başlatıldı"

# ── 5. Health check ───────────────────────────────────────────────────────────
info "Backend hazır olana kadar bekleniyor (max 60sn)..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
    log "Backend sağlıklı"
    break
  fi
  [ $i -eq 30 ] && warn "Backend 60sn içinde yanıt vermedi.\nKontrol: docker compose logs backend"
  sleep 2
done

# ── 6. Özet ──────────────────────────────────────────────────────────────────
echo ""
docker compose ps
echo ""
log "Deploy tamamlandı!"
echo ""
echo "  Site     : ${FRONTEND_URL:-http://SUNUCU_IP}"
echo "  API      : ${FRONTEND_URL:-http://SUNUCU_IP}/api/actuator/health"
echo "  Loglar   : docker compose logs -f"
echo "  Yeniden  : docker compose restart"
echo ""

if [ "$FIRST_RUN" = true ]; then
  DOMAIN=$(echo "$FRONTEND_URL" | sed 's|https\?://||' | sed 's|/.*||')
  echo "  ─────────────────────────────────────────────────"
  echo "  Sonraki adım — SSL sertifikası al:"
  echo ""
  echo "  docker compose run --rm certbot certonly \\"
  echo "    --webroot --webroot-path=/var/www/certbot \\"
  echo "    --email admin@${DOMAIN} --agree-tos \\"
  echo "    -d ${DOMAIN} -d www.${DOMAIN}"
  echo ""
  echo "  Sonra HTTPS'e geç:"
  echo "  sed -i 's/YOUR_DOMAIN/${DOMAIN}/g' nginx/conf.d/hatirlat.conf.bak 2>/dev/null || true"
  echo "  cp nginx/conf.d/hatirlat.conf.http-only nginx/conf.d/hatirlat.conf"
  echo "  # nginx/conf.d/ içine tam HTTPS config'i koy, sonra:"
  echo "  docker compose restart nginx"
  echo "  ─────────────────────────────────────────────────"
  echo ""
fi
