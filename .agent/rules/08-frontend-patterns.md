# Frontend Pattern'leri ve UI Kurallari - Hatirlat.io

## UI Framework

- **Shadcn/UI** + **Radix UI** bilesen kutuphanesi
- **Tailwind CSS** stil yonetimi
- **next-themes** karanlik/aydinlik tema destegi
- **Lucide React** ikonlari
- **Sonner** toast bildirimleri

## Bilesen Yapisi

```tsx
// Fonksiyonel bilesen + TypeScript
interface ComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: ComponentProps) {
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

## API Entegrasyon Pattern'i

```typescript
// Repository interface
interface IReminderRepository {
  getAll(): Promise<ReminderResponse[]>;
  getById(id: string): Promise<ReminderResponse>;
  create(request: ReminderRequest): Promise<ReminderResponse>;
  update(id: string, request: ReminderRequest): Promise<ReminderResponse>;
  delete(id: string): Promise<void>;
}

// Repository implementasyonu
class ReminderRepository implements IReminderRepository {
  async getAll(): Promise<ReminderResponse[]> {
    const response = await apiManager.get<BaseResponse<ReminderResponse[]>>('/api/reminders');
    return response.data.data;
  }
}
```

## Durum Yonetimi (State Management)

- React `useState` ve `useEffect` hook'lari
- API verileri component seviyesinde tutulur
- Global state icin React Context (tema, auth durumu)
- Form state'i controlled component pattern'i ile

## Hata Yonetimi

- **ErrorBoundary:** Class component, tum sayfalari sarar (2 katmanli)
- **error.tsx:** Next.js App Router global hata sayfasi
- **not-found.tsx:** 404 sayfasi
- **Toast bildirimleri:** API hatalarinda Sonner ile kullaniciya gosterilir
- **401 auto-redirect:** apiService.ts icinde, token gecersizse `/login`'e yonlendirir

## Bos Durum (Empty State) Pattern'i

```tsx
{items.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <IconComponent className="h-12 w-12 text-muted-foreground/50 mb-4" />
    <h3 className="text-lg font-medium">Henuz veri yok</h3>
    <p className="text-sm text-muted-foreground mt-1">Aciklama metni</p>
    <Button className="mt-4" onClick={handleCreate}>
      Yeni Olustur
    </Button>
  </div>
) : (
  // Normal liste/icerik
)}
```

## Responsive Tasarim

- Mobile-first yaklasim
- Hamburger menu sidebar icin (mobilde)
- Grid layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Padding/margin: `p-1 sm:p-2` (mobilde daha kucuk)

## Tema Destegi

- `next-themes` ile karanlik/aydinlik mod
- CSS degiskenleri Tailwind ile entegre
- `dark:` prefix ile karanlik mod stilleri
- Gradient arkaplanlar: `bg-gradient-to-br from-background via-background to-accent/5`

## Turkce UI Metinleri

Tum kullanici-gorunen metinler Turkce olmali:
- Buton: "Yeni Olustur", "Kaydet", "Iptal", "Sil"
- Bos durum: "Henuz veri yok", "Ilk hatirlaticiyi olustur"
- Toast: "Basariyla olusturuldu", "Bir hata olustu"
- Hata sayfasi: "Bir seyler ters gitti", "Sayfa bulunamadi"
