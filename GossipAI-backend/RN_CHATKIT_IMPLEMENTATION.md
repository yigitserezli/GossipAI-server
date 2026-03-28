# RN ChatKit Implementasyon Notu

Bu dokümanı RN projesindeki ajan için görev tanımı olarak kullan.

## Hedef

React Native uygulamasında kullanıcı mesajlarını backend üzerinden Rosie agent'ına bağla.
Backend zaten hazır:
- `POST /api/chatkit/sessions` endpoint’i var
- `POST /api/chatkit/messages` endpoint’i var
- Backend OpenAI workflow bilgileri:
  - `OPENAI_WORKFLOW_ID=wf_698f70bba3f88190ac22933e514a17ca063a36b59eed0c8d`
  - `OPENAI_WORKFLOW_VERSION=1`

RN tarafı **asla** OpenAI API key kullanmamalı. Sadece backend’den gelen `clientSecret` kullanılmalı.

## Backend Sözleşmesi (Contract)

Base URL: `https://<backend-domain>/api`

### Auth

- `POST /auth/login`
  - body:
  ```json
  { "email": "user@example.com", "password": "12345678" }
  ```
  - response:
  ```json
  {
    "user": { "id": "...", "name": "...", "email": "...", "createdAt": "..." },
    "tokens": { "accessToken": "...", "refreshToken": "..." },
    "session": { "sessionId": "...", "ipAddress": null, "userAgent": "...", "createdAt": "...", "lastUsedAt": "..." }
  }
  ```

- `POST /auth/refresh`
  - body:
  ```json
  { "refreshToken": "..." }
  ```
  - response: login ile aynı format

- `GET /auth/me`
  - header: `Authorization: Bearer <accessToken>`

### ChatKit Session

- `POST /chatkit/sessions`
  - header: `Authorization: Bearer <accessToken>`
  - body: boş
  - response:
  ```json
  {
    "data": {
      "sessionId": "sess_...",
      "clientSecret": "cs_...",
      "expiresAt": "2026-02-18T12:34:56.000Z",
      "threadId": "thread_..."
    }
  }
  ```

### ChatKit Message

- `POST /chatkit/messages`
  - header: `Authorization: Bearer <accessToken>`
  - body:
  ```json
  {
    "content": "Merhaba",
    "conversationId": "optional-existing-conversation-id",
    "title": "optional-new-conversation-title",
    "memoryMode": "summary_only",
    "mode": "HELP_ME_REPLY",
    "style": "FLIRTY",
    "userGender": "female",
    "targetGender": "male",
    "relation": "dating",
    "goal": "Net ama kibar bir cevap yazmak",
    "toneLimits": "No emoji, kısa olsun",
    "context": "Dün buluşmayı son anda iptal etti",
    "chatLog": "Ali: bugün gelemem\nBen: haber verseydin"
  }
  ```
  - response:
  ```json
  {
    "data": {
      "conversationId": "uuid",
      "assistant": {
        "id": "msg_...",
        "role": "assistant",
        "content": "Merhaba...",
        "createdAt": "2026-02-19T00:00:00.000Z",
        "tokensIn": 123,
        "tokensOut": 45
      },
      "state": {
        "rollingSummary": "",
        "factsJson": [],
        "openLoopsJson": [],
        "safetyFlagsJson": {},
        "lastSummarizedMessageId": null,
        "updatedAt": "2026-02-19T00:00:00.000Z"
      },
      "summaryUpdated": true
    }
  }
  ```

Notlar:
- `conversationId` göndermezsen backend otomatik yeni conversation açar.
- Sonraki mesajlarda aynı `conversationId` göndererek aynı chat'e devam edilir.
- `mode` alanı varsayılan olarak `HELP_ME_REPLY` kabul edilir.
- Agent context'i backend conversation/message kayıtları üzerinden korunur.

### Conversation History

- `GET /chatkit/conversations?limit=20` (önerilen alias)
- `GET /chatkit/history?limit=20` (legacy alias)
- `GET /chatkit/threads?limit=20` (legacy alias)
- `GET /conversations?limit=20` (alternatif)
  - header: `Authorization: Bearer <accessToken>`
  - response: kullanıcının konuşma listesi (son güncellenen en üstte)
- `GET /chatkit/conversations/:id?lastMessages=20` (önerilen alias)
- `GET /chatkit/history/:id?lastMessages=20` (legacy alias)
- `GET /chatkit/threads/:id?lastMessages=20` (legacy alias)
- `GET /conversations/:id?lastMessages=20` (alternatif)
  - header: `Authorization: Bearer <accessToken>`
  - response: seçilen konuşmanın state + son mesajları

### Hata formatı

Tüm error response’ları şu formatta:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required.",
    "fields": null,
    "details": null
  }
}
```

## RN Ajanının Yapması Gerekenler

1. `AuthStore` kur:
- `accessToken`, `refreshToken`, `user` tut
- güvenli storage kullan (`expo-secure-store` veya platform secure storage)

2. API client kur (Axios/fetch wrapper):
- Tüm isteklerde `Authorization: Bearer <accessToken>` ekle
- `401` gelirse tek seferde refresh mekanizması çalıştır:
  - `POST /api/auth/refresh` ile yeni token al
  - başarısızsa logout yap ve login ekranına dön

3. Chat ekranı açılırken ChatKit session al:
- `POST /api/chatkit/sessions`
- response’dan `data.clientSecret` al
- opsiyonel: web embed kullanmıyorsan bu adımı atlayabilirsin

4. Session yenileme:
- `clientSecret` süresi dolmadan yeniden `POST /api/chatkit/sessions` çağır
- lifecycle: app foreground olduğunda ve chat açılışında doğrula

5. Native mesaj gönderimi:
- Her user mesajında `POST /api/chatkit/messages` çağır
- `conversationId` değerini store'da tut ve aynı sohbette tekrar gönder
- Kullanıcı ayarlarından gelen `mode/style/gender/relation/goal/toneLimits` alanlarını request body'ye map et
- Response içindeki `state` alanını (özellikle `rollingSummary`, `factsJson`, `openLoopsJson`) local store'a yaz

6. History ekranı:
- Liste için `GET /api/chatkit/conversations?limit=20` çağır
- Kullanıcı bir item'a tıklayınca `GET /api/chatkit/conversations/:id?lastMessages=20` ile konuşmayı hydrate et
- Aynı thread’den devam etmek için sonraki `POST /api/chatkit/messages` çağrılarına `conversationId` ekle

7. UI durumları:
- `loading session`
- `session error` (retry butonu)
- `chat ready`

8. Telemetry/log:
- session alma hatalarını `error.code`, `status`, request id (varsa) ile logla

## Kabul Kriterleri

1. Login olan kullanıcı chat ekranını açınca mesaj gönderip yanıt alabiliyor.
2. Access token expire olunca uygulama otomatik refresh edip kullanıcıyı chatten düşürmüyor.
3. Refresh token geçersizse kullanıcı güvenli şekilde logout oluyor.
4. RN tarafında OpenAI API key bulunmuyor.
5. Cold start sonrası secure storage’dan session devam ediyor.

## Hızlı Test Senaryosu

1. Login ol.
2. Chat ekranını aç, `/api/chatkit/sessions` çağrısının 201 döndüğünü doğrula.
3. Birkaç mesaj gönder, yanıt akışını doğrula.
4. Access token’ı manuel boz, bir API isteği tetikle, refresh’in devreye girdiğini doğrula.
5. Refresh token’ı boz, tekrar istek at, logout akışını doğrula.
