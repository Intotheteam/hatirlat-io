# CLAUDE.md - Hatirlat.io Backend Proje Notları

## Proje Özeti

**Hatirlat.io Backend** - Spring Boot 3.3.4 REST API, JWT auth, H2 (dev) / PostgreSQL (prod).

Kişisel ve grup hatırlatıcı yönetimi. Email/SMS/WhatsApp bildirim kanalları. Ücretsiz/premium kullanıcı sınırlaması.

## Tespit Edilen ve Düzeltilmesi Gereken Hatalar

### Kaynak Kod Hataları (src/main/java)

**BUG-1 (KRİTİK) - MemberRepository.java:13**
JPQL `JOIN ... ON` sözdizimi geçersiz. Hibernate runtime'da `QuerySyntaxException` fırlatır.
```java
// HATALI:
@Query("SELECT m FROM Member m JOIN GroupMember gm ON m.id = gm.memberId WHERE gm.groupId = :groupId")
// DOĞRU:
@Query("SELECT m FROM Member m WHERE m.id IN (SELECT gm.memberId FROM GroupMember gm WHERE gm.groupId = :groupId)")
```

**BUG-2 - MemberService.java:50**
`MemberRole.valueOf(request.getRole().toUpperCase())` → geçersiz değerde yakalanmayan `IllegalArgumentException` → 500 döner.
Düzeltme: try/catch ekle, geçersizde `MemberRole.MEMBER` kullan.

**BUG-3 - AuthService.java:40**
`RuntimeException("User not found")` yerine `UsernameNotFoundException` kullan.
Not: `UsernameNotFoundException extends RuntimeException` olduğu için mevcut test geçmeye devam eder.

### Test Hataları (src/test/java)

**TEST-BUG-1 (KRİTİK - Derleme Hatası) - controller/AuthControllerTest.java:67**
Test, `authController.register(String, String, String, Role)` şeklinde 4 parametre geçiyor.
Gerçek controller imzası: `register(@RequestBody UserRequest userRequest)`.
Tüm test modülü derlenemiyor! `UserRequest` nesnesi oluşturularak düzeltilmeli.

**TEST-BUG-2 (Derleme Hatası) - controller/AuthControllerAdditionalTest.java:24**
`authController.getCurrentUser()` argümansız çağrılıyor. Gerçek imza: `getCurrentUser(@AuthenticationPrincipal User currentUser)`.
+ Hard-coded `assertEquals("currentuser", ...)` assertion'ları var, mock kurulumu yok.
Düzeltme: `User` nesnesi oluşturup controller'a parametre olarak geçir.

**TEST-BUG-3 - service/MemberServiceTest.java:103-112**
`addMemberToGroup_NonExistingGroup_ReturnsNull` → `assertNull(response)` bekliyor.
Gerçek davranış: `ResourceNotFoundException` fırlatır, null dönmez.
Düzeltme: `assertThrows(ResourceNotFoundException.class, ...)` kullan.

**TEST-BUG-4 - service/CustomUserDetailsServiceTest.java:42-46**
Test gövdesi boş - sadece mock kuruluyor, servis çağrılmıyor, assertion yok.
Düzeltme: `assertThrows(UsernameNotFoundException.class, () -> userDetailsService.loadUserByUsername(username))` ekle.

**TEST-BUG-5 - controller/ReminderControllerTest.java:90, 129, 181**
Not-found testleri, service'i `null`/`false` dönecek şekilde mock'luyor ve `assertFalse(isSuccess())` bekliyor.
Gerçek controller davranışı: `return ResponseEntity.ok(new BaseResponse<>(true, ...))` - her zaman success=true döner.
Gerçek servis davranışı: bulunamadığında `ResourceNotFoundException` fırlatır.
Düzeltme: `when(...).thenThrow(ResourceNotFoundException.class)` + `assertThrows(...)`.

**TEST-BUG-6 - controller/GroupControllerTest.java:78, 117, 143**
TEST-BUG-5 ile aynı pattern. Not-found testleri yanlış mock kullanıyor.

## Yapılacak İşler (Öncelik Sırası)

1. `MemberRepository.java` - JPQL subquery düzeltmesi
2. `MemberService.java` - Enum parsing try/catch
3. `AuthService.java` - UsernameNotFoundException
4. `AuthControllerTest.java` - Derleme hatasını düzelt
5. `AuthControllerAdditionalTest.java` - Derleme hatasını düzelt + assertion'ları düzelt
6. `MemberServiceTest.java` - assertThrows'a çevir
7. `CustomUserDetailsServiceTest.java` - Act + Assert ekle
8. `ReminderControllerTest.java` - Not-found testlerini exception pattern'e çevir
9. `GroupControllerTest.java` - Not-found testlerini exception pattern'e çevir
10. Yeni `integration/ApiIntegrationTest.java` oluştur
11. Yeni `src/test/resources/application-test.properties` oluştur

## Integration Test Planı

**Dosya:** `src/test/java/com/hatirlat/backend/integration/ApiIntegrationTest.java`
**Yaklaşım:** `@SpringBootTest(webEnvironment = RANDOM_PORT)` + `TestRestTemplate`
**Profile:** `@ActiveProfiles("test")`
**Sıralı testler:** `@TestMethodOrder(MethodOrderer.OrderAnnotation.class)`
**Statik state:** `authToken`, `createdReminderId`, `createdGroupId`, `createdContactId`, `createdMemberId`

Kapsam: Auth akışı (5), Unauthorized (2), Reminder CRUD (8), Group CRUD (6), Member CRUD (7), Contact CRUD (6), Validation (3) = ~37 test.

**application-test.properties:**
```
free-limit.default-max-requests=1000
spring.datasource.url=jdbc:h2:mem:integrationtestdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
```

## Mimari Notlar

- **ID Tipi:** Entity'lerde `Long`, DTO/controller'larda `String` - servis katmanında `Long.parseLong()` dönüşümü yapılıyor.
- **Controller Response Pattern:** Tüm controller metodları başarısız servis dönüşlerini kontrol etmiyor, her zaman `success=true` döndürüyor. Hata senaryoları `GlobalExceptionHandler` üzerinden 404/400/500 olarak ele alınıyor.
- **Security:** Unauthenticated isteklere 401 değil **403** dönüyor (Spring Security stateless policy, custom authenticationEntryPoint yok).
- **@LimitedForFree AOP:** `POST /api/reminders` üzerinde. Integration test'te `free-limit.default-max-requests=1000` ile bypass edilmeli.
- **H2 Console:** Varsayılan kapalı, `H2_CONSOLE_ENABLED=true` env var ile açılır.

## Komutlar

```bash
# Tüm testleri çalıştır
mvn clean test

# Sadece integration testlerini çalıştır
mvn test -Dtest=ApiIntegrationTest -Dspring.profiles.active=test

# Uygulamayı başlat
mvn spring-boot:run

# Swagger UI
# http://localhost:8080/swagger-ui.html
# http://localhost:8080/scalar
```
