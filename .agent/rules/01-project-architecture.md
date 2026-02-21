# Proje Mimarisi - Hatirlat.io

## Genel Yapi

Bu proje bir **hatirlatici (reminder) yonetim uygulamasidir**. Iki ana modulu vardir:

- **Backend:** Spring Boot 3.3.4, Java 17, Maven, port 8080
- **Frontend:** Next.js 15, React 19, TypeScript, port 3000

## Dizin Yapisi

```
hatirlat-io/
├── backend/                         # Spring Boot uygulamasi
│   └── src/main/java/com/hatirlat/backend/
│       ├── config/                  # Security, CORS, JWT, AOP config
│       ├── controller/              # REST controller'lar
│       ├── dto/                     # Request/Response DTO'lari
│       ├── entity/                  # JPA Entity'leri
│       ├── exception/               # Ozel exception siniflar
│       ├── mapper/                  # Entity <-> DTO donusturuculer
│       ├── repository/              # JPA Repository interface'leri
│       ├── service/                 # Business logic katmani
│       ├── aop/                     # @LimitedForFree, @PremiumOnly AOP
│       └── util/                    # Yardimci siniflar
├── frontend/                        # Next.js uygulamasi
│   ├── app/                         # App Router sayfalari
│   │   ├── (authenticated)/         # Oturum gerektiren sayfalar
│   │   ├── login/                   # Giris sayfasi
│   │   └── register/                # Kayit sayfasi
│   ├── components/                  # React bilesenler
│   ├── services/                    # API servisleri (Repository pattern)
│   │   └── api/                     # apiService, apiManager
│   ├── core/domain/                 # Entity ve repository interface'leri
│   └── types/                       # TypeScript type tanimlari
└── .agent/                          # Antigravity workspace config
```

## Katmanli Mimari (Backend)

1. **Controller** -> `@RestController` + `@RequestMapping("/api/...")`
2. **Service** -> Business logic, validation, entity donusum
3. **Repository** -> `JpaRepository<Entity, Long>` interface'leri
4. **Mapper** -> `BaseMapper<Entity, ResponseDto>` implementasyonlari
5. **Entity** -> JPA `@Entity` siniflar, `@Table` annotation

## Frontend Pattern'leri

- **Repository Pattern:** `IMemberRepository` (interface) + `MemberRepository` (implementasyon)
- **API Manager:** `apiManager` singleton uzerinden tum API cagrilari
- **apiService.ts:** Axios wrapper, JWT token yonetimi, 401 auto-redirect
- **API_BASE_URL = "":** Istekler Next.js proxy rewrites uzerinden gider (`localhost:3000/api/*` -> `localhost:8080/api/*`)

## Veritabani

- **Gelistirme:** H2 in-memory database
- **Uretim:** PostgreSQL hazir (application.yml profil degisikligi ile)
- **ORM:** Spring Data JPA / Hibernate

## Kimlik Dogrulama

- JWT (HS256) token tabanli
- Token localStorage'da saklanir
- `@AuthenticationPrincipal User currentUser` ile controller'da erisim
- Tum CRUD operasyonlari kullanici bazinda filtrelenir (user ownership)
