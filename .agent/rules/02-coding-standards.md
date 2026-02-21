# Kodlama Standartlari - Hatirlat.io

## Genel Kurallar

- Kod yorumlari ve degisken adlari **Ingilizce** yazilir
- Kullanici arayuzu metinleri (UI text, toast mesajlari, placeholder'lar) **Turkce** yazilir
- Her yeni ozellik icin hem backend hem frontend degisiklikleri birlikte yapilir
- Mevcut dosyalari duzenle, gereksiz yere yeni dosya olusturma

## Java / Spring Boot Standartlari

- Java 17 syntax kullan (records, sealed classes, pattern matching)
- Constructor injection tercih et (`@Autowired` field injection yerine)
- Tum controller `@RequestBody` parametrelerine `@Valid` annotation ekle
- Service metotlari String id kabul edip icerde `Long.parseLong()` ile donustur
- Entity'lerde `@GeneratedValue(strategy = GenerationType.IDENTITY)` kullan
- Logger olarak `LoggingUtil` sinifini kullan (`log` degil `logger` olarak adlandir)
- Enum degerleri UPPERCASE: `ReminderType.PERSONAL`, `ReminderStatus.SCHEDULED`

## TypeScript / React Standartlari

- TypeScript strict mode kullan, `any` tipinden kacin
- Fonksiyonel bilesenler + hooks kullan (class component kullanma, ErrorBoundary harici)
- UI bilesenleri icin Shadcn/Radix UI + Tailwind CSS kullan
- Tum API cagrilari `apiManager` veya `apiService` uzerinden yapilir
- Axios interceptor'lar ile 401 auto-redirect zaten mevcut
- `next.config.mjs` icindeki rewrites proxy'si uzerinden istek at (`API_BASE_URL = ""`)
- Enum degerleri backend ile uyumlu UPPERCASE olmali

## Import Sirasi

### Java
1. `com.hatirlat.backend.*` (proje import'lari)
2. `jakarta.*` / `javax.*`
3. `org.springframework.*`
4. `java.*`

### TypeScript
1. React / Next.js
2. 3rd party kutuphane
3. `@/components/*`
4. `@/services/*`
5. `@/types/*`
6. Relative imports

## Naming Convention

| Oge | Java | TypeScript |
|-----|------|------------|
| Sinif/Interface | PascalCase | PascalCase |
| Metot/Fonksiyon | camelCase | camelCase |
| Degisken | camelCase | camelCase |
| Sabit | UPPER_SNAKE_CASE | UPPER_SNAKE_CASE |
| Dosya (Java) | PascalCase.java | - |
| Dosya (TS/TSX) | - | kebab-case.tsx |
| API endpoint | kebab-case | kebab-case |
| DTO sinifi | XxxRequest / XxxResponse | XxxRequest / XxxResponse |
