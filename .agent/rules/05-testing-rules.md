# Test Kurallari - Hatirlat.io

## Backend Test Framework

- **JUnit 5** + **Mockito** (`@ExtendWith(MockitoExtension.class)`)
- Test dosyalari: `src/test/java/com/hatirlat/backend/`
- Her service ve controller icin ayri test sinifi

## Test Yazim Kurallari

### Naming Convention

```java
// Format: methodName_condition_expectedBehavior
@Test
void getAllReminders_ReturnsListOfReminders() { ... }

@Test
void getReminderById_NonExistingReminder_ThrowsResourceNotFoundException() { ... }

@Test
void createReminder_ValidPersonalRequest_ReturnsCreatedReminder() { ... }
```

### Test Yapisi (AAA Pattern)

```java
@Test
void methodName_condition_expected() {
    // Arrange - Mock ve test verisi hazirla
    when(repository.findById(1L)).thenReturn(Optional.of(entity));

    // Act - Test edilen metodu cagir
    Response result = service.getById("1");

    // Assert - Sonuclari dogrula
    assertNotNull(result);
    assertEquals("expected", result.getField());
    verify(repository, times(1)).findById(1L);
}
```

### Mock Kullanimi

- `@Mock` ile bagimliliklari mockla
- `@InjectMocks` ile test edilen sinifi olustur
- `when().thenReturn()` ile mock davranis tanimla
- `verify()` ile metot cagrisi dogrula
- `doNothing().when()` void metotlar icin
- `doThrow().when()` exception firlatan void metotlar icin

### Zorunlu Test Senaryolari

Her CRUD operasyonu icin en az su senaryolar test edilmeli:

1. **Create:** Basarili olusturma
2. **Read (list):** Bos ve dolu liste
3. **Read (by id):** Mevcut kayit ve bulunamayan kayit (404)
4. **Update:** Basarili guncelleme ve bulunamayan kayit (404)
5. **Delete:** Basarili silme ve bulunamayan kayit (404)

### ID Donusum Testleri

Service metotlari `String id` kabul ettigi icin:
- Gecerli ID string'leri test et ("1", "100")
- Bulunamayan ID'ler icin `ResourceNotFoundException` dogrula

## Frontend Test (Gelecek)

- Frontend'de henuz test framework kurulmamis
- Yeni ozellikler icin Jest + React Testing Library onerilir
- Component testleri `__tests__/` dizininde
- API service testleri mock axios ile

## Test Calistirma

```bash
# Backend testleri
cd backend && mvn test

# Belirli bir test sinifi
mvn test -Dtest=ReminderServiceTest

# Belirli bir test metodu
mvn test -Dtest=ReminderServiceTest#getAllReminders_ReturnsListOfReminders
```
