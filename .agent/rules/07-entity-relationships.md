# Entity Iliskileri ve Veritabani - Hatirlat.io

## Entity'ler

### User
- `id` (Long, PK)
- `username` (String, unique)
- `password` (String, BCrypt hash)
- `email` (String, unique)
- `role` (Role enum: USER, ADMIN, PREMIUM)

### Reminder
- `id` (Long, PK)
- `title` (String)
- `message` (String)
- `dateTime` (LocalDateTime)
- `type` (ReminderType enum: PERSONAL, GROUP)
- `status` (ReminderStatus enum: SCHEDULED, PAUSED, SENT, FAILED)
- `channels` (List<NotificationChannel> enum: EMAIL, SMS, WHATSAPP, PUSH)
- `repeat` (RepeatType enum: NONE, DAILY, WEEKLY, MONTHLY, YEARLY, CUSTOM)
- `groupId` (Long, nullable - grup hatirlaticilari icin)
- `userId` (Long, FK -> User.id)

### Group
- `id` (Long, PK)
- `name` (String)
- `description` (String)
- `userId` (Long, FK -> User.id, grup sahibi)

### Member
- `id` (Long, PK)
- `name` (String)
- `email` (String)
- `phone` (String)
- `role` (String: "admin", "member")
- `groupId` (Long, FK -> Group.id)

### Contact
- `id` (Long, PK)
- `name` (String)
- `email` (String)
- `phone` (String)
- `userId` (Long, FK -> User.id)

### CustomRepeatConfig
- `id` (Long, PK)
- `reminderId` (Long, FK -> Reminder.id)
- `interval` (Integer)
- `unit` (String)
- `daysOfWeek` (List<String>)

## Enum Degerleri

Backend enum'lari UPPERCASE `.name()` dondurur. Frontend type'lari bununla eslesmelidir:

```java
// Backend
public enum ReminderType { PERSONAL, GROUP }
public enum ReminderStatus { SCHEDULED, PAUSED, SENT, FAILED }
public enum NotificationChannel { EMAIL, SMS, WHATSAPP, PUSH }
public enum RepeatType { NONE, DAILY, WEEKLY, MONTHLY, YEARLY, CUSTOM }
public enum Role { USER, ADMIN, PREMIUM }
```

## Iliski Kurallari

1. Tum ana entity'ler (Reminder, Group, Contact) `userId` field'i icerir
2. Member entity'si Group'a baglidir (`groupId`)
3. CustomRepeatConfig Reminder'a baglidir (`reminderId`)
4. Cascade delete uygulanir: Group silinince Member'lar da silinir
5. User silinince tum verisi (reminder, group, contact) temizlenir

## Veritabani Profilleri

```yaml
# Gelistirme (H2)
spring.datasource.url: jdbc:h2:mem:hatirlat
spring.jpa.hibernate.ddl-auto: create-drop

# Uretim (PostgreSQL)
spring.datasource.url: jdbc:postgresql://localhost:5432/hatirlat
spring.jpa.hibernate.ddl-auto: update
```
