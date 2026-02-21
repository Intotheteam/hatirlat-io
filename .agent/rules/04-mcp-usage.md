# MCP Kullanim Kurallari - Hatirlat.io

## Mevcut MCP Server'lar

Bu projede iki MCP server yapilandirilmistir:

### 1. Context7 (`@upstash/context7-mcp`)

**Ne yapar:** Guncel, versiyon-spesifik kutuphane dokumantasyonu ve kod ornekleri saglar.

**Ne zaman kullan:**
- Spring Boot, Spring Security, Spring Data JPA API'leri hakkinda bilgi gerektiginde
- Next.js 15, React 19, TypeScript API referanslari icin
- Shadcn/Radix UI bilesen dokumantasyonu icin
- Tailwind CSS class referanslari icin
- JWT, Swagger/OpenAPI entegrasyonlari icin
- Herhangi bir kutuphane/framework'un guncel versiyonu hakkinda suphe oldugunda

**Nasil kullan:**
1. Once `resolve-library-id` tool'u ile kutuphane ID'sini bul
2. Sonra `get-library-docs` tool'u ile ilgili dokumantasyonu cek
3. Dokumantasyondaki bilgiyi kodlama kararlarinda referans olarak kullan

**Ornek kullanim:**
- "Spring Boot 3.3 @Valid annotation nasil calisir?" -> context7 ile Spring Boot docs cek
- "Next.js 15 App Router error.tsx nasil yapilandirilir?" -> context7 ile Next.js docs cek
- "Radix UI Dialog bileseninin props'lari neler?" -> context7 ile Radix UI docs cek

### 2. Sequential Thinking (`@modelcontextprotocol/server-sequential-thinking`)

**Ne yapar:** Karmasik problemleri yapilandirilmis, adim adim dusunme sureci ile cozer.

**Ne zaman kullan:**
- Birden fazla dosyayi etkileyen buyuk refactoring islemlerinde
- Yeni bir ozellik eklerken mimari karar alinmasi gerektiginde
- Bug teshisinde birden fazla olasilik oldugunda
- Veritabani sema degisiklikleri planlanirken
- Guvenlik yapilandirmasi veya auth akisi degisikliklerinde
- Performans optimizasyonu stratejisi belirlerken

**Nasil kullan:**
1. Problemi tanimla
2. `sequential-thinking` tool'unu cagir
3. Her adimda dusunce, dal olusturma veya revizyon yap
4. Sonuca ulasinca ozet olustur

**Ornek kullanim:**
- "Bildirim sistemi (email/SMS/WhatsApp) nasil entegre edilmeli?" -> sequential-thinking ile strateji belirle
- "Tekrarlayan hatirlaticilarin zamanlama mantigi nasil olmali?" -> sequential-thinking ile akis tasarla
- "Premium abonelik sistemi nasil yapilandirilmali?" -> sequential-thinking ile mimari plan olustur

## Genel MCP Kullanim Kurallari

1. **Her zaman context7 kullan** eger bir framework/kutuphane API'si hakkinda emin degilsen
2. **Sequential thinking kullan** eger cozum birden fazla adim ve dosya gerektiriyorsa
3. **Ikisini birlikte kullan** buyuk ozellik implementasyonlarinda:
   - Once sequential-thinking ile plan olustur
   - Sonra context7 ile her adim icin guncel API referanslari cek
4. **Kullanma** basit, tek satirlik degisikliklerde veya mevcut pattern'lerin tekrarinda
