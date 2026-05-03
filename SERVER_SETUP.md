# Hatirlat.io — Ubuntu Sunucu Kurulum Rehberi

## Gereksinimler
- Ubuntu 22.04 LTS VPS (min. 2 GB RAM, 20 GB disk)
- Alan adı DNS → A kaydı sunucu IP'sine yönlendirilmiş olmalı
- Termius veya herhangi bir SSH istemcisi

---

## BÖLÜM 1 — Sunucu Hazırlığı (Bir Kere Yapılır)

### 1.1 Bağlan ve Güncelle
```bash
# Termius'tan bağlan: root@SUNUCU_IP
apt update && apt upgrade -y
```

### 1.2 Temel Araçlar
```bash
apt install -y git curl nano ufw
```

### 1.3 Güvenlik Duvarı (UFW)
```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

### 1.4 Docker Kur
```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Docker'ın çalıştığını doğrula
docker --version
docker compose version
```

### 1.5 Swap Ekle (2 GB RAM için gerekli — ilk build sırasında bellek biter)
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Kalıcı hale getir
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Kontrol
free -h
```

---

## BÖLÜM 2 — Projeyi Kur

### 2.1 Projeyi Çek
```bash
git clone https://github.com/Intotheteam/hatirlat-io.git /opt/hatirlat
cd /opt/hatirlat
```

### 2.2 Gizli Anahtarlar Üret
Aşağıdaki komutları çalıştır, çıktıları not al:
```bash
# JWT Secret (64 hex karakter)
openssl rand -hex 32

# Encryption Key (tam 32 karakter)
openssl rand -base64 24 | tr -d '\n' | head -c 32 && echo
```

### 2.3 .env Dosyası Oluştur
```bash
cp .env.production .env
nano .env
```

Nano içinde şunları doldur (`Ctrl+X → Y → Enter` ile kaydet):
```
FRONTEND_URL=https://hatirlat.io
CORS_ALLOWED_ORIGINS=https://hatirlat.io,https://www.hatirlat.io

DB_PASSWORD=buraya_guclu_bir_sifre_yaz
DB_USERNAME=hatirlat
DB_NAME=hatirlat

JWT_SECRET_KEY=<openssl rand -hex 32 çıktısı>
ENCRYPTION_SECRET_KEY=<tam 32 karakter çıktısı>
```

Doğrulama:
```bash
# ENCRYPTION_SECRET_KEY 32 karakter mi kontrol et
grep ENCRYPTION_SECRET_KEY .env | awk -F= '{print length($2), $2}'
# Çıktı "32 ..." olmalı
```

---

## BÖLÜM 3 — İlk Deploy (HTTP ile başla)

### 3.1 Deploy Script'i Çalıştır
```bash
chmod +x deploy.sh
./deploy.sh --first-run
```

Bu komut:
- .env değerlerini doğrular
- HTTP-only nginx config'i aktif eder
- Docker image'larını build eder (~5-10 dk)
- Tüm servisleri başlatır

### 3.2 Servislerin Durumunu Kontrol Et
```bash
docker compose ps
```
Beklenen çıktı — tüm servisler `Up` olmalı:
```
NAME                 STATUS
hatirlat-postgres    Up (healthy)
hatirlat-backend     Up
hatirlat-frontend    Up
hatirlat-nginx       Up
```

### 3.3 HTTP Erişimi Test Et
```bash
curl -I http://hatirlat.io
# HTTP/1.1 200 OK görmeli
```

---

## BÖLÜM 4 — SSL Sertifikası (Let's Encrypt)

### 4.1 Sertifika Al
```bash
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@hatirlat.io \
  --agree-tos \
  --no-eff-email \
  -d hatirlat.io \
  -d www.hatirlat.io
```

Başarılı çıktı:
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/hatirlat.io/fullchain.pem
```

### 4.2 HTTPS Config'e Geç
```bash
# Tam HTTPS config'i aktif et (domain zaten değiştirilmiş olacak)
cp nginx/conf.d/hatirlat.conf.http-only nginx/conf.d/hatirlat.conf.backup

# Orijinal HTTPS config'i geri yükle (git'ten)
git checkout nginx/conf.d/hatirlat.conf

# Domain adını güncelle
DOMAIN="hatirlat.io"
sed -i "s/YOUR_DOMAIN/$DOMAIN/g" nginx/conf.d/hatirlat.conf

# Nginx'i yeniden başlat
docker compose restart nginx
```

### 4.3 HTTPS Test Et
```bash
curl -I https://hatirlat.io
# HTTP/2 200 görmeli
```

### 4.4 Otomatik SSL Yenileme (Cron)
```bash
crontab -e
```
En alta şunu ekle (`Ctrl+X → Y → Enter`):
```
0 3 * * 1 cd /opt/hatirlat && docker compose run --rm certbot renew --quiet && docker compose restart nginx
```

---

## BÖLÜM 5 — Admin Kullanıcı Oluştur

Kayıt olduktan sonra kullanıcıyı admin yap:
```bash
docker compose exec postgres psql -U hatirlat -d hatirlat \
  -c "UPDATE users SET role='ADMIN' WHERE username='kullanici_adi';"
```

Kontrol:
```bash
docker compose exec postgres psql -U hatirlat -d hatirlat \
  -c "SELECT username, role, email FROM users;"
```

---

## BÖLÜM 6 — Güncelleme Yayınlama

Yerel bilgisayardan değişiklikler GitHub'a push edildikten sonra sunucuda:
```bash
cd /opt/hatirlat
./deploy.sh
```

---

## Günlük Yönetim Komutları

```bash
# Tüm loglar (canlı)
docker compose logs -f

# Sadece backend
docker compose logs -f backend

# Sadece nginx
docker compose logs -f nginx

# Servis durumları
docker compose ps

# Tüm servisleri yeniden başlat
docker compose restart

# Sadece backend'i yeniden başlat
docker compose restart backend

# Tüm servisleri durdur
docker compose down

# Servisleri durdur + volume'ları sil (VERİ KAYBI!)
docker compose down -v

# PostgreSQL'e bağlan
docker compose exec postgres psql -U hatirlat -d hatirlat

# Backend health check
curl http://localhost:8080/actuator/health

# Disk kullanımı
df -h
docker system df

# Disk temizliği (kullanılmayan image'lar)
docker image prune -f

# Tam temizlik (dikkat: tüm cache silinir)
docker system prune -af
```

---

## Sorun Giderme

### Backend başlamıyor
```bash
docker compose logs backend --tail=50
```

### Nginx 502 Bad Gateway veriyor
```bash
# Backend ayakta mı?
docker compose ps backend
# Nginx config test
docker compose exec nginx nginx -t
```

### SSL sertifikası alınamıyor
```bash
# 80 portunun açık olduğunu doğrula
ufw status
curl -I http://hatirlat.io/.well-known/acme-challenge/test
```

### PostgreSQL bağlantı hatası
```bash
docker compose logs postgres --tail=20
docker compose exec postgres pg_isready -U hatirlat
```

### Bellek yetersiz (OOM)
```bash
free -h
# Swap kontrolü
swapon --show
```
