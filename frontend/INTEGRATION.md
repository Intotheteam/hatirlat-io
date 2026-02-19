# Hatirlat.io Frontend ↔ Backend Integration Guide

Bu döküman, frontend (Next.js) ile backend (Spring Boot) arasındaki entegrasyonu açıklar.
Claude AI veya geliştiriciler tarafından okunarak bağlantı durumunu ve gerekli değişiklikleri anlamak için kullanılabilir.

---

## 1. Genel Mimari

```
Next.js Frontend (port 3000)
  └── services/api/apiService.ts       ← HTTP request wrapper (fetch + Auth header)
  └── services/api/apiManager.ts       ← Tüm endpoint çağrıları
  └── services/auth/authService.ts     ← Login/register + localStorage token yönetimi
  └── contexts/AuthContext.tsx         ← React auth state
  └── services/repositories/MemberRepository.ts  ← MOCK (gerçek API'ye bağlı DEĞİL)

Spring Boot Backend (port 8080)
  └── /api/auth      ← AuthController
  └── /api/reminders ← ReminderController
  └── /api/groups    ← GroupController
  └── /api/groups/{groupId}/members  ← MemberController
  └── /api/members/invite            ← MemberController
  └── /api/contacts  ← ContactController
```

---

## 2. Ortam Yapılandırması

### Frontend `.env.local` (OLUŞTURULMASI GEREKİYOR)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> Dosya henüz oluşturulmamış. `services/api/apiService.ts` satır 7:
> `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"`
>
> Geliştirme ortamında `.env.local` olmasa da `http://localhost:8080` default olarak kullanılır.

### Backend Başlatma

```bash
cd backend
mvn spring-boot:run
# Swagger UI: http://localhost:8080/swagger-ui.html
# Scalar UI:  http://localhost:8080/scalar
```

---

## 3. Authentication (JWT)

### Akış

1. **Register**: `POST /api/auth/register` → backend `User` entity döner
2. **Login**: `POST /api/auth/login` → `{ token, refreshToken, type, expiresIn, user }` döner
3. Token `localStorage["authToken"]` a kaydedilir
4. Sonraki tüm isteklerde: `Authorization: Bearer <token>` header'ı eklenir
5. **Logout**: localStorage temizlenir

### Token Storage (authService.ts)

```typescript
localStorage["authToken"]    // JWT access token
localStorage["refreshToken"] // Refresh token
localStorage["currentUser"]  // JSON.stringify(User)
```

### Kimlik Doğrulama Gerektirmeyen Endpoint'ler

Aşağıdaki endpoint'ler token olmadan erişilebilir (security-routes.properties'de tanımlı):
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /swagger-ui/**`
- `GET /v3/api-docs/**`
- `GET /scalar/**`

Diğer tüm endpoint'ler JWT token gerektirir. Token yoksa veya geçersizse `403 Forbidden` döner.

---

## 4. Genel Response Formatı

### `BaseResponse<T>` (Tüm korumalı endpoint'ler)

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

```json
{
  "success": false,
  "data": null,
  "message": "Error description"
}
```

### Error Response (404, 400 vb.)

```json
{
  "status": 404,
  "message": "Resource not found",
  "timestamp": "2024-01-01T00:00:00"
}
```

### Frontend'de Kullanım (apiManager.ts)

```typescript
const response = await apiService.get<{ success: boolean; data: T[] }>("/api/reminders");
return response.data || [];
```

---

## 5. Auth Endpoint'leri

### `POST /api/auth/register`

**Durum:** ✅ Frontend bağlı (`authService.ts`)

**Request Body:**
```json
{
  "username": "string (required, not blank)",
  "password": "string (required, not blank)",
  "email": "string (required, valid email)",
  "role": "USER | ADMIN (optional, default: USER)"
}
```

**Response:** `User` entity (role, id, username, email, password hash — NOT `BaseResponse`)
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "role": "USER"
}
```

> ⚠️ **Dikkat:** Register endpoint `BaseResponse` KULLANMAZ, direkt `User` döner.
> Frontend `authService.register()` bunu `User` olarak parse eder.
> Backend'de `User` entity'si `UserDetails` implement ettiğinden `authorities` gibi ekstra alanlar içerir.

**Validation Hataları (400):**
- `username` boş → 400
- `email` geçersiz format → 400
- `email` zaten kullanımda → 409 (conflict)

---

### `POST /api/auth/login`

**Durum:** ✅ Frontend bağlı (`authService.ts`)

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `AuthResponse` (NOT `BaseResponse`)
```json
{
  "token": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "type": "Bearer",
  "expiresIn": 86400000,
  "user": {
    "id": "1",
    "username": "testuser",
    "email": "test@example.com",
    "role": "USER"
  }
}
```

> ⚠️ **Dikkat:** Geçersiz credentials için backend `BadCredentialsException` fırlatır.
> `GlobalExceptionHandler`'da bu exception için özel bir handler YOK → 500 döner.
> Frontend `ApiError` ile bu hatayı yakalar ama status 500 alabilir.
> Frontend geliştiricileri bu durumda generic bir "Geçersiz kullanıcı adı veya şifre" mesajı göstermelidir.

---

### `GET /api/auth/me`

**Durum:** ✅ Frontend bağlı (`AuthContext.tsx`)

**Headers:** `Authorization: Bearer <token>`

**Response:** `BaseResponse<UserResponse>`
```json
{
  "success": true,
  "data": {
    "id": "1",
    "username": "testuser",
    "email": "test@example.com",
    "role": "USER"
  },
  "message": "User info retrieved successfully"
}
```

---

## 6. Reminder Endpoint'leri

### `GET /api/reminders`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → getReminders()`)

**Response:** `BaseResponse<ReminderResponse[]>`
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Meeting Reminder",
      "type": "personal",
      "message": "Don't forget the meeting",
      "dateTime": "2024-12-01T10:00:00",
      "status": "scheduled",
      "contact": { "name": "John", "email": "john@example.com", "phone": "555-1234" },
      "group": null,
      "channels": ["email"],
      "repeat": "none",
      "customRepeat": null
    }
  ],
  "message": "Reminders retrieved successfully"
}
```

---

### `GET /api/reminders/{id}`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → getReminderById(id)`)

**Hata:** 404 → `ResourceNotFoundException` → `{"status": 404, "message": "..."}`

---

### `POST /api/reminders`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → createReminder(reminder)`)

**Request Body:** (`ReminderRequest`)
```json
{
  "title": "string (required)",
  "type": "personal | group (required)",
  "message": "string (optional)",
  "dateTime": "2024-12-01T10:00:00 (required, ISO format)",
  "status": "scheduled | sent | paused | failed (required)",
  "contact": {
    "name": "string",
    "email": "string",
    "phone": "string"
  },
  "groupId": "string (existing group ID, for type=group)",
  "group": { "name": "string", "description": "string" },
  "channels": ["email", "sms", "whatsapp"] ,
  "repeat": "none | hourly | daily | weekly | custom (required)",
  "customRepeat": {
    "interval": 2,
    "frequency": "day | week | month",
    "daysOfWeek": ["mon", "tue"]
  }
}
```

> **Validation (400):** `title`, `type`, `dateTime`, `status`, `channels`, `repeat` zorunlu.

> **`@LimitedForFree` AOP:** Bu endpoint free kullanıcılar için rate limiting içeriyor.
> Free kullanıcılar `free-limit.default-max-requests` aşınca 429 alabilir.

---

### `PUT /api/reminders/{id}`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → updateReminder(id, reminder)`)

Request body: `ReminderRequest` (aynı format, partial update desteklenmez, tüm alanlar gönderilmeli)

---

### `PUT /api/reminders/{id}/status`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → updateReminderStatus(id, status)`)

**Request Body:**
```json
{ "status": "paused" }
```

---

### `DELETE /api/reminders/{id}`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → deleteReminder(id)`)

**Response:** `BaseResponse<Void>` with `success: true`

---

## 7. Group Endpoint'leri

### `GET /api/groups`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → getGroups()`)

**Response:** `BaseResponse<GroupResponse[]>`
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Team Alpha",
      "description": "Alpha team group",
      "memberCount": 5,
      "createdAt": "2024-01-01T00:00:00"
    }
  ]
}
```

---

### `GET /api/groups/{id}`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → getGroupById(id)`)

---

### `POST /api/groups`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → createGroup(group)`)

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

---

### `PUT /api/groups/{id}`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → updateGroup(id, group)`)

---

### `DELETE /api/groups/{id}`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → deleteGroup(id)`)

---

## 8. Member Endpoint'leri

### `GET /api/groups/{groupId}/members`

**Durum:** ⚠️ `apiManager.ts`'de bağlı AMA `MemberRepository.ts` (component tarafından kullanılan) MOCK

`apiManager.ts → getGroupMembers(groupId)` gerçek API çağırır.
Ancak `app/(authenticated)/groups/[groupId]/members/page.tsx` muhtemelen `MemberRepository.ts`
(mock) kullanıyor. Bu durumu kontrol et.

**Response:** `BaseResponse<MemberResponse[]>`
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "ADMIN",
      "status": "ACTIVE",
      "joinedAt": "2024-01-01T00:00:00",
      "phone": "555-1234",
      "lastActivity": "2024-01-01T00:00:00"
    }
  ]
}
```

> **Backend rol değerleri:** `ADMIN` veya `MEMBER` (büyük harf)
> **Mock değerler (`MemberRepository.ts`):** `"Admin"` veya `"Member"` (mixed case)
> Bu bir **type mismatch**'tir.

---

### `POST /api/groups/{groupId}/members`

**Durum:** ⚠️ `apiManager.ts`'de bağlı AMA `MemberRepository.ts` mock ile çakışıyor

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "valid email (optional)",
  "role": "ADMIN | MEMBER (optional, default: MEMBER — geçersiz değer de MEMBER'a düşer)",
  "phone": "string (optional)"
}
```

> **BUG FIX notu:** Geçersiz role değeri (örn. `"InvalidRole"`) artık 500 atmaz,
> `MemberService.java`'da try/catch ile `MEMBER`'a fallback yapılır.

---

### `DELETE /api/groups/{groupId}/members/{memberId}`

**Durum:** ⚠️ `apiManager.ts`'de bağlı AMA `MemberRepository.ts` mock ile çakışıyor

**Response:** `success: true` veya `success: false` (farklı pattern — `BaseResponse<Void>` değil `BaseResponse<?>`)

---

### `POST /api/members/invite`

**Durum:** ✅ `apiManager.ts`'de YOK (henüz implement edilmemiş)

**Request Body:**
```json
{
  "email": "invitee@example.com",
  "groupId": "1"
}
```

**Response:** `BaseResponse<String>` (invite link veya confirm mesajı)

---

## 9. Contact Endpoint'leri

### `GET /api/contacts`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → getContacts()`)

**Response:** `BaseResponse<ContactResponse[]>`
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "phone": "555-1234",
      "email": "john@example.com"
    }
  ]
}
```

> ⚠️ **Type Mismatch:** `types/index.ts` içindeki `Contact` type'ında `id` alanı YOK:
> ```typescript
> export interface Contact { name: string; phone: string; email: string; }
> ```
> Ama backend `ContactResponse` `id` döndürür.
> Frontend'de Contact güncelleme/silme için `id` gerekli — `types/index.ts` güncellenmeli.

---

### `POST /api/contacts`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → createContact(contact)`)

**Request Body:** (`ContactRequest`)
```json
{
  "name": "string",
  "email": "valid email",
  "phone": "string"
}
```

---

### `PUT /api/contacts/{id}`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → updateContact(id, contact)`)

---

### `DELETE /api/contacts/{id}`

**Durum:** ✅ Frontend bağlı (`apiManager.ts → deleteContact(id)`)

---

## 10. TypeScript Type Uyuşmazlıkları (Düzeltilmesi Gerekenler)

### Sorun 1: `Contact` interface'inde `id` yok

**`types/index.ts` mevcut:**
```typescript
export interface Contact {
  name: string;
  phone: string;
  email: string;
}
```

**Backend `ContactResponse`:**
```typescript
{ id: string; name: string; phone: string; email: string; }
```

**Düzeltme:** `id` alanını ekle:
```typescript
export interface Contact {
  id?: string;   // ← ekle
  name: string;
  phone: string;
  email: string;
}
```

---

### Sorun 2: `Reminder.dateTime` — frontend `string`, backend `LocalDateTime`

Frontend `types/index.ts`:
```typescript
dateTime: string  // ISO string olarak tutulması doğru
```

Backend `ReminderRequest` `@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")` bekler.
Frontend tarih gönderirken `"2024-12-01T10:00:00"` formatını kullanmalı (saniye olmadan da kabul eder).

---

### Sorun 3: `Member` role değerleri — case uyuşmazlığı

**Backend MemberResponse:** `"ADMIN"` | `"MEMBER"` (büyük harf)
**Frontend `core/domain/entities/member.ts`:** `"Admin"` | `"Member"` (mixed case)
**Mock MemberRepository.ts:** `"Admin"` | `"Member"` (mixed case)

**Düzeltme:** `core/domain/entities/member.ts`:
```typescript
role: "ADMIN" | "MEMBER"  // ← büyük harf
```

---

### Sorun 4: `AuthResponse.user` — backend `UserResponse` döner, frontend `User` bekler

Backend `AuthResponse`:
```json
{ "user": { "id": "1", "username": "testuser", "email": "...", "role": "USER" } }
```

Frontend `types/index.ts → User`:
```typescript
{ id: string; username: string; email: string; role: string; }
```

✅ Bu uyuşuyor, sorun yok.

---

### Sorun 5: `Reminder.contact` ve `Reminder.group` zorunlu ama optional olabilmeli

Frontend `types/index.ts`:
```typescript
contact: Contact  // zorunlu
group: Group      // zorunlu
```

Backend'de kişisel hatırlatıcılarda `contact` ve `group` null olabilir.

**Düzeltme:**
```typescript
contact?: Contact | null
group?: Group | null
```

---

## 11. MemberRepository Mock → Gerçek API Geçişi

`services/repositories/MemberRepository.ts` şu an **tamamen mock** verilerle çalışıyor.
Gerçek API'ye bağlamak için:

```typescript
// ÖNCE (mock):
async getMembersByGroupId(groupId: string): Promise<Member[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return Promise.resolve([...mockMembers]);
}

// SONRA (gerçek API):
async getMembersByGroupId(groupId: string): Promise<Member[]> {
  const response = await apiService.get<{ success: boolean; data: Member[] }>(
    `/api/groups/${groupId}/members`
  );
  return response.data || [];
}

async addMemberToGroup(groupId: string, email: string): Promise<Member> {
  const response = await apiService.post<{ success: boolean; data: Member }>(
    `/api/groups/${groupId}/members`,
    { email, name: email.split("@")[0], role: "MEMBER" }  // backend name zorunlu
  );
  return response.data;
}

async removeMemberFromGroup(groupId: string, memberId: string): Promise<void> {
  await apiService.delete(`/api/groups/${groupId}/members/${memberId}`);
}
```

> **Dikkat:** Backend `MemberRequest` için `name` zorunlu (`@NotBlank`).
> `MemberRepository.addMemberToGroup` sadece `email` alıyor ama backend `name` de istiyor.
> Interface'i güncellemen veya name'i email'den türetmen gerekiyor.

---

## 12. Eksik Frontend Implementasyonları

| Feature | Backend Endpoint | Frontend Durumu |
|---------|-----------------|-----------------|
| Invite Member | `POST /api/members/invite` | `apiManager.ts`'de YOK |
| Get Member By ID | `GET /api/groups/{gId}/members/{mId}` | `apiManager.ts`'de VAR |
| Update Member | `PUT /api/groups/{gId}/members/{mId}` | `apiManager.ts`'de VAR |
| Refresh Token | Backend'de endpoint YOK | — |
| Search Reminders | `GET /api/reminders?q=...` | `apiManager.searchReminders()` VAR ama backend desteklemiyor |

> **`searchReminders` sorunu:** `apiManager.ts` satır 74:
> `GET /api/reminders?q=...` çağrısı yapıyor ama `ReminderController.getAllReminders()`
> query parameter kabul etmiyor. Bu endpoint çağrısı tam liste döndürür, filtreleme yapmaz.

---

## 13. Error Handling

### Frontend `apiService.ts`

```typescript
if (!response.ok) {
  throw new ApiError(response.status, errorMessage);
}
```

### Backend `GlobalExceptionHandler` Yanıt Kodları

| Durum | HTTP Kodu |
|-------|-----------|
| Kaynak bulunamadı (`ResourceNotFoundException`) | 404 |
| Validation hatası (`MethodArgumentNotValidException`) | 400 |
| Token yok / geçersiz | 403 (Spring Security default) |
| Geçersiz credentials (`BadCredentialsException`) | 500 ⚠️ (handler yok) |
| Genel exception | 500 |

> ⚠️ Login başarısız olduğunda 401 değil, 500 dönebilir. Frontend bunu handle etmeli.

---

## 14. CORS Yapılandırması

Backend `application.properties`:
```
cors.allowed-origins=http://localhost:3000
```

Frontend varsayılan olarak `http://localhost:3000` üzerinde çalışır — uyumlu.
Production'da `cors.allowed-origins` güncellenmeli.

---

## 15. Özet: Bağlantı Durumu

| Bileşen | Durum |
|---------|-------|
| Auth (login/register/me) | ✅ Bağlı |
| Reminders CRUD | ✅ Bağlı |
| Groups CRUD | ✅ Bağlı |
| Members (apiManager.ts) | ✅ Bağlı |
| Members (MemberRepository.ts) | ❌ Mock — gerçek API'ye bağlanmadı |
| Contacts CRUD | ✅ Bağlı |
| Invite Member | ❌ Frontend'de eksik |
| Search Reminders | ⚠️ Frontend var, backend desteklemiyor |
| .env.local | ❌ Oluşturulmamış (default değer çalışır) |
| Contact.id type | ⚠️ Frontend'de eksik |
| Member role case | ⚠️ Frontend ADMIN/MEMBER, Mock Admin/Member |
