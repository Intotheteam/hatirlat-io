# Test Uretme Workflow'u

Belirtilen sinif veya katman icin otomatik test uretir.

## Adimlar

1. **Hedef sinifi analiz et:**
   - Public metotlari listele
   - Bagimliliklari (dependency) belirle
   - Return tiplerini ve exception'lari kontrol et

2. **Test sinifi olustur:**
   - `@ExtendWith(MockitoExtension.class)` ekle
   - `@Mock` ile bagimliliklari mockla
   - `@InjectMocks` ile hedef sinifi inject et
   - `@BeforeEach` ile test verisini hazirla

3. **Test senaryolari yaz:**
   - Her public metot icin basarili senaryo
   - Her public metot icin basarisiz senaryo (exception)
   - Edge case'ler (bos liste, null deger, gecersiz ID)

4. **Naming convention uygula:**
   - `methodName_condition_expectedBehavior` formati

5. **Calistir ve dogrula:**
   - `mvn test -Dtest=SinifAdiTest` ile calistir
   - Tum testlerin gectigini dogrula
