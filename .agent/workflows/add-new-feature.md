# Yeni Ozellik Ekleme Workflow'u

Bu workflow yeni bir ozellik (feature) eklerken izlenmesi gereken adimlari tanimlar.

## Adimlar

1. **Analiz:** Sequential Thinking MCP ile ozelligi planla
   - Hangi entity'ler etkileniyor?
   - Hangi endpoint'ler gerekli?
   - Frontend'de hangi bilesenler degisecek?

2. **Backend - Entity/DTO:**
   - Gerekiyorsa yeni entity veya mevcut entity'ye field ekle
   - Request ve Response DTO'larini olustur/guncelle
   - Mapper sinifini guncelle

3. **Backend - Repository:**
   - JpaRepository interface'ine yeni query metotlari ekle
   - User bazli filtreleme icin `findByUserId()` metodu ekle

4. **Backend - Service:**
   - Business logic'i service katmaninda yaz
   - `@AuthenticationPrincipal User` ile user ownership kontrolu yap
   - String id kabul et, `Long.parseLong()` ile donustur

5. **Backend - Controller:**
   - REST endpoint olustur (`@GetMapping`, `@PostMapping` vb.)
   - `@Valid @RequestBody` ile validation
   - `BaseResponse<T>` wrapper ile dondur
   - Swagger `@Operation` annotation ekle

6. **Backend - Test:**
   - Service testi yaz (Mockito ile)
   - Basarili ve basarisiz senaryolari kapsa
   - `ResourceNotFoundException` testleri ekle

7. **Frontend - Type:**
   - `types/index.ts` icinde TypeScript type tanimla
   - Backend DTO ile uyumlu olmali

8. **Frontend - Repository/Service:**
   - Repository interface ve implementasyonu olustur
   - `apiManager` uzerinden API cagrilari yap

9. **Frontend - Component:**
   - Shadcn/Radix UI bilesenleri kullan
   - Turkce UI metinleri yaz
   - Bos durum (empty state) ekle
   - Loading state (skeleton/spinner) ekle
   - Hata durumu toast bildirimi ekle

10. **Frontend - Sayfa:**
    - Next.js App Router icinde sayfa olustur
    - `(authenticated)/` altinda olmali (auth gerektiren sayfalar icin)

11. **Dogrulama:**
    - Backend testlerini calistir (`mvn test`)
    - Frontend build kontrolu (`npm run build`)
    - Manuel test (tarayicide kontrol)
