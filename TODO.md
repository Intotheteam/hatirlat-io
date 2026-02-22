# Hatirlat.io - Proje Ozellik Listesi

## A. Mevcut (Tamamlanmis) Ozellikler

- [x] Kullanici kayit ve giris (JWT token auth)
- [x] Kullanici oturumu yonetimi (localStorage token, auto-login)
- [x] Hatirlatici CRUD (olustur, listele, duzenle, sil)
- [x] Hatirlatici durum degistirme (scheduled/paused/sent/failed)
- [x] Hatirlatici filtreleme (durum, tip, kanal bazinda)
- [x] Hatirlatici arama (baslik/mesaj bazinda ?q= parametresi)
- [x] Kisi (Contact) CRUD
- [x] Grup CRUD (olustur, listele, duzenle, sil)
- [x] Grup uyesi ekleme/cikarma/guncelleme
- [x] Grup davet linki olusturma (frontend tarafli)
- [x] Dashboard istatistikleri (toplam, aktif, tamamlanan, grup sayisi)
- [x] Tamamlanma yuzdesi progress bar
- [x] Yaklasan hatirlaticilar listesi
- [x] Karanlik/aydinlik tema destegi (next-themes)
- [x] Mobil responsive tasarim (sidebar, hamburger menu)
- [x] Yukleniyor durumlari (skeleton loader, spinner)
- [x] API hata yonetimi (toast bildirimler, validation error parse)
- [x] 401 auto-redirect (oturum bitince login sayfasina yonlendirme)
- [x] CORS yapilandirmasi (backend WebConfig)
- [x] Next.js API proxy (rewrites)
- [x] Rate limiting altyapisi (@LimitedForFree AOP)
- [x] Premium erisim kontrolu (@PremiumOnly AOP)
- [x] Swagger/OpenAPI dokumantasyonu
- [x] BaseResponse tutarli response formati (tum endpoint'ler)
- [x] @Valid annotation'lari ile request body dogrulama

## B. Olmasi Gereken (Eksik/Kritik) Ozellikler

- [x] Kullaniciya ozel veri filtreleme (reminder ve group user bazinda filtrelenmeli)
- [x] Reminder entity'ye user/owner iliskisi eklenmesi
- [x] Group entity'ye owner/creator alani eklenmesi
- [ ] Gercek e-posta bildirimi entegrasyonu (SMTP/SendGrid/AWS SES)
- [ ] Gercek SMS bildirimi entegrasyonu (Twilio/AWS SNS)
- [ ] Gercek WhatsApp bildirimi entegrasyonu (WhatsApp Business API)
- [ ] ReminderScheduler method signature hatasinin duzeltilmesi (backend calisiyor, SMTP gerekmeli)
- [x] Tekrarlayan hatirlaticilarin sonraki calisma zamani uretimi
- [x] Kullanici profili sayfasi (bilgi goruntuleme/duzenleme)
- [x] Sifre degistirme ozelligi
- [ ] Sifremi unuttum akisi (email ile reset) - backend hazir, gercek SMTP gerekli
- [ ] Email dogrulama (kayit sonrasi)
- [x] Davet kodu dogrulama backend endpoint'i
- [x] Davet uzerinden gruba katilma akisi
- [x] Bildirim gecmisi / teslim kayitlari (NotificationLog tablosu)
- [ ] Sayfalama (pagination) - buyuk veri setleri icin
- [x] Zaman dilimi (timezone) destegi
- [x] Error boundary (React hata sinir bilesenleri)
- [x] Logout butonunun calisir hale getirilmesi
- [x] Bos durum (empty state) mesajlari iyilestirmesi

## C. Gelistirilmesi Gereken (Nice-to-Have) Ozellikler

- [x] Coklu dil destegi (i18n - Turkce/Ingilizce)
- [ ] Gercek zamanli guncellemeler (WebSocket veya polling)
- [ ] Toplu islemler (coklu secim ile sil/durum degistir)
- [ ] Bildirim tercihleri sayfasi (rahatsiz etmeyin saatleri vb.)
- [ ] Onboarding / ilk kullanim rehberi
- [x] Sifre guc gostergesi (kayit formunda)
- [ ] Hatirlatici sablon sistemi (sik kullanilan hatirlaticilar)
- [ ] Takvim gorunumu (hatirlaticilari takvimde gorme)
- [ ] Dosya eki destegi (hatirlaticilara dosya ekleme)
- [ ] Rol bazli erisim kontrol paneli (admin dashboard)
- [ ] Grup uyesi rol yonetimi UI (admin/uye atama)
- [ ] Bildirim kanali dogrulama (email/telefon dogrulama)
- [ ] Analytics / kullanim istatistikleri
- [ ] Offline destek (Service Worker)
- [ ] PWA (Progressive Web App) destegi
- [ ] Webhook entegrasyonu (3. parti sistemlerle)
- [ ] Disa aktarim (CSV/PDF export)
- [x] Premium abonelik ve odeme sistemi
- [ ] 2FA (iki faktorlu kimlik dogrulama)
- [ ] Aktivite loglari / audit trail
