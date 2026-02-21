# Bug Duzeltme Workflow'u

Bu workflow bir bug duzeltirken izlenmesi gereken adimlari tanimlar.

## Adimlar

1. **Teshis:**
   - Hata mesajini ve stack trace'i oku
   - Hatanin hangi katmanda oldugunu belirle (controller/service/repository/frontend)
   - Gerekiyorsa Sequential Thinking MCP ile kok neden analizi yap

2. **Yeniden Uretme:**
   - Hatayi yeniden uretecek adimlari belirle
   - Ilgili test senaryosunu kontrol et (varsa)

3. **Duzeltme:**
   - En az degisiklikle hatayi duzelt
   - Context7 MCP ile ilgili framework/kutuphane dokumantasyonunu kontrol et
   - Yan etkilere dikkat et

4. **Test:**
   - Hatayi kapsayan yeni test ekle (yoksa)
   - Mevcut testlerin gectigini dogrula
   - `mvn test` ile tum testleri calistir

5. **Dogrulama:**
   - Hatanin duzeltildigini manuel olarak dogrula
   - Regresyon olmamis mi kontrol et
