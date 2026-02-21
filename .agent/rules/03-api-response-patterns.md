# API ve Response Pattern'leri - Hatirlat.io

## BaseResponse Wrapper

Tum API endpoint'leri `BaseResponse<T>` wrapper kullanir:

```java
public class BaseResponse<T> {
    private boolean success;
    private T data;
    private String message;
}
```

**JSON formati:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

## Endpoint Kurallari

- Tum endpoint'ler `/api/` prefix'i ile baslar
- `@AuthenticationPrincipal User currentUser` parametresi tum authenticated endpoint'lerde olmali
- GET listelemelerde `BaseResponse<List<XxxResponse>>` dondur
- GET tekil kayitlarda `BaseResponse<XxxResponse>` dondur
- POST/PUT'da `BaseResponse<XxxResponse>` dondur
- DELETE'de `BaseResponse<Void>` dondur
- Sayfalamali endpoint'lerde `BaseResponse<PageResponse<XxxResponse>>` kullan

## DTO Kurallari

- **Request DTO:** Kullanicidan gelen veri, validation annotation'lari icin
- **Response DTO:** Kullaniciya donen veri, entity'den mapper ile donusturulur
- ID alanlari Response DTO'da `String` tipinde olmali (frontend uyumu icin)
- Entity'deki ID `Long` tipinde, donusum service/mapper katmaninda yapilir

## Mapper Pattern

```java
public interface BaseMapper<E, D> {
    D toDto(E entity);
    E toEntity(D dto);
}
```

- Her entity icin ayri mapper sinifi (`ReminderMapper`, `ContactMapper`, `GroupMapper`)
- `@Component` annotation ile Spring bean olarak tanimlanir
- Mapper'da ek donusum metotlari eklenebilir (ornegin `toEntity(XxxRequest)`)

## Hata Yonetimi

- `ResourceNotFoundException` -> 404 Not Found
- `IllegalArgumentException` -> 400 Bad Request
- Validation hatalari -> 400 Bad Request (field-level error mesajlari)
- `@ControllerAdvice` ile global exception handling

## Ornek Controller Endpoint

```java
@GetMapping
public ResponseEntity<BaseResponse<List<ReminderResponse>>> getAllReminders(
        @AuthenticationPrincipal User currentUser) {
    List<ReminderResponse> reminders = reminderService.getAllReminders(currentUser);
    return ResponseEntity.ok(new BaseResponse<>(true, reminders, "Reminders retrieved successfully"));
}
```

## Kullanici Bazli Filtreleme (User Ownership)

- Tum CRUD operasyonlari `currentUser` parametresi ile filtrelenmeli
- Reminder, Group, Contact entity'leri `userId` field'i icerir
- Service katmaninda `repository.findByUserId(currentUser.getId())` kullan
- Baska kullanicinin verisine erisim denenirse `ResourceNotFoundException` firlat
