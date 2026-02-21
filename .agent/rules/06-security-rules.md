# Guvenlik Kurallari - Hatirlat.io

## Kimlik Dogrulama (Authentication)

- JWT (HS256) token tabanli kimlik dogrulama
- Token suresi ve secret `application.yml` icinde tanimli
- Token her istekte `Authorization: Bearer <token>` header'i ile gonderilir
- `JwtAuthenticationFilter` her istegi kontrol eder

## Yetkilendirme (Authorization)

- Spring Security `SecurityFilterChain` ile yapilandirilmis
- Public endpoint'ler: `/api/auth/**`, `/api/public/**`, Swagger/Scalar UI
- Diger tum endpoint'ler authentication gerektirir
- `@AuthenticationPrincipal User currentUser` ile kullanici bilgisi alinir
- Rol bazli erisim: `EndpointSecurityProperties` ile konfigurasyondan gelir

## SecurityConfig Yapisi

```java
// Order(0) - Scalar/Swagger UI icin ayri filter chain
@Order(0)
SecurityFilterChain scalarFilterChain(HttpSecurity http)

// Order(1) - Ana uygulama filter chain
@Order(1)
SecurityFilterChain filterChain(HttpSecurity http)
```

## CORS Yapilandirmasi

- `CorsConfigurationSource` bean olarak tanimli (`WebConfig.java`)
- Izin verilen origin: `http://localhost:3000` (gelistirme)
- Tum HTTP metotlari izinli (GET, POST, PUT, DELETE, OPTIONS)
- `allowedHeaders("*")` - tum header'lar izinli
- `allowCredentials(true)` - cookie/auth header gonderimi icin
- **ONEMLI:** Frontend `API_BASE_URL = ""` kullanarak Next.js proxy uzerinden istek atar, CORS sorunu olmaz

## Dikkat Edilmesi Gerekenler

1. **CSRF devre disi:** Stateless JWT auth kullanildigi icin CSRF korunmasi kapali
2. **OPTIONS preflight:** Tum path'ler icin OPTIONS izinli (`requestMatchers(OPTIONS, "/**").permitAll()`)
3. **H2 Console:** Frame options `sameOrigin` olarak ayarli (gelistirme icin)
4. **Password encoding:** BCrypt kullanilir
5. **Token localStorage'da:** XSS ataklarina karsi dikkatli olunmali

## Yeni Endpoint Eklerken

1. Public endpoint ise `application.yml` -> `endpoint-security.permit-all` listesine ekle
2. Rol bazli erisim gerekiyorsa `endpoint-security.routes` listesine ekle
3. Diger tum endpoint'ler otomatik olarak authentication gerektirir
4. Controller'da `@AuthenticationPrincipal User currentUser` parametresi ekle
5. Service'de user ownership kontrolu yap

## Rate Limiting

- `@LimitedForFree` AOP annotation ile ucretsiz kullanicilar icin limit
- `@PremiumOnly` AOP annotation ile premium-only erisim
- Limitler `application.yml` icinde tanimlanir
