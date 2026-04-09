# Daily Insight API

Günlük anasayfa "Daily Insight" alanı için backend endpoint dökümanı.

## Endpoint

```
GET /api/daily-insight/today
```

## Authentication

Bearer token gerekli.

```
Authorization: Bearer <access_token>
```

## Dil Seçimi

`X-Language` header'ı ile dil belirtilir. Gönderilmezse `en` (İngilizce) döner.

```
X-Language: tr
```

### Desteklenen Diller

| Kod      | Dil                |
|----------|--------------------|
| `tr`     | Türkçe             |
| `en`     | English            |
| `de`     | Deutsch            |
| `fr`     | Français           |
| `it`     | Italiano           |
| `es`     | Español            |
| `es-419` | Español (LatAm)    |
| `ru`     | Русский            |
| `zh`     | 中文               |
| `ja`     | 日本語             |
| `ko`     | 한국어             |
| `uk`     | Українська         |
| `pt`     | Português          |

Desteklenmeyen bir dil kodu gönderilirse `en` döner.

## Response

```json
{
  "data": {
    "id": "uuid",
    "date": "2026-04-10T00:00:00.000Z",
    "language": "tr",
    "content": "Bazen en güzel şeyler, en beklenmedik anlarda gelir.",
    "author": null,
    "createdAt": "2026-04-10T00:05:01.123Z"
  }
}
```

### Alanlar

| Alan       | Tip              | Açıklama                                                    |
|------------|------------------|-------------------------------------------------------------|
| `id`       | `string`         | Insight UUID                                                |
| `date`     | `string` (date)  | Insight'ın ait olduğu gün (UTC)                             |
| `language` | `string`         | Dil kodu                                                    |
| `content`  | `string`         | Insight metni (max ~280 karakter)                           |
| `author`   | `string \| null` | Söz bir kişiye aitse ismi, orijinal insight ise `null`      |
| `createdAt`| `string` (datetime) | Oluşturulma zamanı                                      |

## Örnek İstek

```bash
curl -X GET https://gossip-ai.site/api/daily-insight/today \
  -H "Authorization: Bearer <token>" \
  -H "X-Language: tr"
```

## Notlar

- Her gün UTC 00:05'te tüm diller için insight'lar otomatik üretilir (cron scheduler).
- Eğer kullanıcı scheduler çalışmadan önce istek atarsa, o an on-the-fly üretilip cache'lenir.
- Aynı gün + aynı dil için tekrar istek atılırsa DB'den döner, yeni API çağrısı yapılmaz.
- `author` alanı doluysa UI'da "— Atatürk" gibi gösterilebilir, `null` ise sadece `content` gösterilir.
