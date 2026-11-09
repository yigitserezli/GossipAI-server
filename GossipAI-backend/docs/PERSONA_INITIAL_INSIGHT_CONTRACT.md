# Persona oluşturulduğunda ilk GPT analizi

Bu doküman, persona oluşturulduktan sonra GPT'ye gönderilecek iç payload'u ve mobil uygulamanın kullanacağı analiz yanıtını tanımlar.

## Akış

1. Mobil uygulama persona kaydını oluşturur: `POST /personas`.
2. Persona kaydı başarılıysa ekran bekletilmeden persona detayına geçilir.
3. Arka planda, yalnızca aktif AI izni varsa şu çağrı yapılır:

```http
POST /personas/:personaId/insights/refresh
Authorization: Bearer <access-token>
Content-Type: application/json

{ "language": "tr" }
```

4. Backend kayıtlı persona bilgisinden aşağıdaki GPT payload'unu üretir.
5. GPT'nin döndürdüğü doğrulanmış JSON `PersonaInsight` olarak kaydedilir. Persona, analiz üretilemese bile oluşturulmuş kalır.
6. Mobil sorguları yenilendiğinde ana sayfa ve persona detay sayfası yeni analizi gösterir.

## GPT'ye gönderilecek payload

Bu payload backend içindedir; mobil istemci doğrudan GPT'ye istek atmaz. Ham WhatsApp dosyası, kullanıcı kimliği, erişim token'ı ve avatar URL'si GPT'ye gönderilmez. WhatsApp'tan yalnızca kullanıcının izin verdiği işlenmiş özetler kullanılabilir.

```json
{
  "event": "persona.created",
  "requestedLanguage": "tr",
  "persona": {
    "name": "Deniz",
    "relationshipType": "crush",
    "whoIsThis": "Aynı arkadaş grubundan biri.",
    "thoughtsFeelings": "Yanında rahat hissediyorum ama niyetini bilmiyorum.",
    "goals": "Baskı kurmadan daha yakından tanımak.",
    "currentSituation": "Son haftalarda ara sıra yazışıyoruz.",
    "communicationStyleNotes": null
  },
  "evidence": {
    "characterAnalysis": null,
    "whatsappSummaries": [],
    "optedInConversationMemory": [],
    "selectedConversation": null
  },
  "responseContract": {
    "summary": "Ana sayfadaki ilişki nabzı için 1-2 kısa, kanıta dayalı cümle.",
    "confidence": "0-100 arası kanıt güveni; uyum, kimya veya sonuç olasılığı değildir.",
    "communicationStyle": "Persona detayındaki iletişim tarzı. Veri yetersizse null.",
    "greenFlags": "0-5 ihtiyatlı olumlu gözlem.",
    "redFlags": "0-5 ihtiyatlı dikkat noktası veya belirsizlik.",
    "relationshipNarrative": "Persona detayı ve ilişki analizi için tek, uygulanabilir paragraf."
  }
}
```

### Alan açıklamaları

| Alan | Açıklama |
| --- | --- |
| `event` | İlk kayıtta `persona.created` gönderilir. Konuşma veya işlenmiş WhatsApp verisi geldikten sonraki güncellemelerde `persona.insights.refresh` olur. |
| `requestedLanguage` | GPT'nin insan tarafından okunacak tüm metinleri üretmesi gereken dil. |
| `persona` | Kullanıcının oluşturma formunda verdiği bağlamdır. Bu metinler veri olarak ele alınır, komut olarak değil. |
| `characterAnalysis` | Varsa deterministik karakter analizi sonucudur; psikolojik tanı değildir. |
| `whatsappSummaries` | Sadece tamamlanmış ve izinli WhatsApp içe aktarımlarının türetilmiş özetleri. |
| `optedInConversationMemory` | Kullanıcının persona içgörülerinde kullanılmasına izin verdiği sohbet hafızası. |
| `selectedConversation` | Yenileme belirli bir sohbetten istendiyse son ilgili mesajlar. İlk analizde `null` olur. |
| `responseContract` | GPT'nin dönmesi gereken alanların ekran kullanımını ve sınırlarını açıklar. |

## GPT'den beklenen analiz yanıtı

GPT yalnızca aşağıdaki JSON nesnesini döndürmelidir. Markdown, açıklama metni veya JSON dışı içerik döndürmemelidir. Tüm metinler `requestedLanguage` dilinde olmalıdır.

```json
{
  "summary": "Elindeki bilgi, aranızda merak ve rahatlık olabileceğini düşündürüyor; karşı tarafın niyeti için henüz yeterli doğrudan kanıt yok.",
  "confidence": 28,
  "communicationStyle": null,
  "greenFlags": [
    "Kullanıcı, yanında rahat hissettiğini belirtiyor."
  ],
  "redFlags": [
    "Karşı tarafın niyetine dair doğrudan bir bilgi yok."
  ],
  "relationshipNarrative": "Bu ilk okuma yalnızca senin verdiğin bağlama dayanıyor: tanışmayı küçük ve karşılıklılık arayan adımlarla ilerletmek daha sağlıklı görünüyor. Kısa ve rahat bir sohbet açıp karşı tarafın konuşmayı sürdürme isteğini gözlemle. Niyet veya hisler konusunda şu an kesin bir sonuç çıkarmak için yeterli veri yok."
}
```

### Analiz alanları ve kurallar

| Alan | Tip / sınır | Beklenen analiz |
| --- | --- | --- |
| `summary` | Metin, en çok 420 karakter | Ana sayfada gösterilecek ilişki nabzı. 1-2 kısa cümle olmalı; en önemli tabloyu ve belirsizliği özetlemeli. |
| `confidence` | 0-100 tam sayı | Yalnızca GPT'nin elindeki kanıtın yeterliliği. Karşı tarafın ilgisi, ilişki uyumu, kimya veya bir sonucun gerçekleşme ihtimali değildir. |
| `communicationStyle` | Metin veya `null`, en çok 320 karakter | Gözlemlenen ya da kullanıcının aktardığı iletişim örüntüsü. Doğrudan veri yoksa tahmin edilmez ve `null` döner. |
| `greenFlags` | En çok 5 kısa metin | Mevcut bağlamla desteklenen olumlu sinyaller. Karşı tarafın niyeti hakkında varsayım içermez. Veri yoksa boş dizi dönebilir. |
| `redFlags` | En çok 5 kısa metin | Dikkat edilmesi gereken sinyaller veya açık belirsizlikler. Tanı koymaz, kişiyi etiketlemez ve varsayımı gerçek gibi sunmaz. Veri yoksa boş dizi dönebilir. |
| `relationshipNarrative` | Metin, en çok 2.000 karakter | Persona detayı için kapsamlı ama tek paragraflık ilişki okuması. Bilinenleri, belirsiz olanları ve en düşük baskılı faydalı sonraki adımı içermeli. |

## Mobil ekranlarda kullanım

| Analiz alanı | Kullanıldığı ekran / bölüm |
| --- | --- |
| `summary` | Ana sayfa > Aranızdaki Hava / Relationship Pulse kartı ve son AI yorumu |
| `confidence` | Ana sayfa > Kanıt Güveni yüzdesi |
| `relationshipNarrative` | Persona detayı > İlişki Okuması; İlişki Analizi ekranı |
| `communicationStyle` | Persona detayı > İletişim Dili |
| `greenFlags` | Persona detayı > İyi Gelenler |
| `redFlags` | Persona detayı > Dikkat Edilecekler |

## Ajan için zorunlu davranışlar

- Yalnızca payload içindeki bilgileri kullanır; eksik bilgiyi uydurmaz.
- Kişilik/psikolojik tanı koymaz; başka bir kişinin hislerinden veya niyetinden kesinmiş gibi söz etmez.
- İlk kayıtta veri sınırlıysa bunu "ilk okuma" olarak çerçeveler ve düşük kanıt güveni döndürür.
- Alanları doldurmak için yapay green flag veya red flag üretmez; boş dizi kullanılabilir.
- Yapıcı, baskısız ve uygulanabilir bir sonraki adım önerir.
- Kullanıcının seçtiği dilde, yalnızca geçerli JSON döndürür.

Konuşmalar veya işlenmiş WhatsApp içe aktarımları eklendiğinde aynı endpoint tekrar çağrılır. Payload'taki `event` değeri `persona.insights.refresh` olur; yanıt şeması değişmez. Böylece mobil uygulama ilk analiz ve güncel analiz için ayrı bir arayüz ya da ayrı bir response modeli kullanmaz.

## Agents API bağlantısı ve sohbet hafızası

- Backend, `OPENAI_PERSONA_AGENT_ID` ile kayıtlı `Analyze` agent'ını çağırır. Yerel `.env` ve örnek yapılandırmadaki ID: `agent_e891e3ab966f436cbdc7111bfbc1a6e4972b817fa40c4c49bc`. Agent'ın kayıtlı modeli ve talimatları korunur; oturumda yalnızca JSON çıktı şeması sınırlandırılır.
- Analiz için `POST /v1/agents/sessions`, `OpenAI-Beta: agents=v1`, `environment: { type: "none" }` kullanılır. Her analiz bağımsız, güncel kanıt payload'ı alır. Başarılı ana turn tamamlanmadan sonuç kaydedilmez; eksik, fazladan alanlı, yanlış tipli veya sınırları aşan yanıtlar reddedilir.
- `conversationId` yoksa `selectedConversation: null` gönderilir. Otomatik olarak en son sohbet seçilmez. Persona profili ve bu personaya bağlı izinli, silinmemiş sohbetlerin kalıcı hafızası kullanılır.
- Aktif sohbet kendi son mesajlarını ve `ConversationState` hafızasını kullanır. Diğer izinli sohbetlerin önemli sonuçları, persona ilişkisi üzerinden yüklenip yeni/aktif sohbetin bağlamına eklenir. Mevcut sohbet bu ikinci listeden çıkarılır.
- Kalıcı hafızalar kaynak sohbet kimliği ve güncellenme tarihiyle gönderilir; AI yorumları bağımsız yeni kanıt sayılmaz. Hafıza, persona ile ilişkili `ConversationState` kayıtlarında tutulur; kaynak izinleri kaldırıldığında ya da sohbet silindiğinde sonraki okumaya dahil edilmez.
- Yeni persona analizi yalnızca sunucudan doğrulanan aktif AI izniyle arka planda başlar. Profil düzenlemesinden sonra da analiz yenilenir. Home ve persona detay sorguları ekrana dönüşte ve açıkken 15 saniyede bir yenilenir.

### Doğrulama

Gerçek kayıtlı agent ile Türkçe ilk persona ve önceki sohbet hafızası içeren yenileme örnekleri denendi. İlk örnek `confidence: 15`, iletişim tarzı `null` ve boş sinyal dizileri döndürdü. İkinci örnek `confidence: 30` döndürdü; önceki sohbette bildirilen ilişki sınırını koruyup yeni bir selamlaşmayı romantik ilgi kanıtı saymadı. Üretim istemcisinin JSON şeması zorunlu çağrısı da gerçek API ile doğrulandı.

Otomatik kontroller:

- Backend: `npm test` ve `npm run typecheck`.
- Mobil: `node --test scripts/test-persona-insights.cjs scripts/test-chat-runtime.cjs` ve `npx tsc --noEmit`.
- Mobil render testleri native bileşenleri taklit ederek gerçek Home sinyal ve persona detay bileşenlerinde alan eşlemesini doğrular; cihaz üzerinde oturum açılmış uçtan uca testin yerine geçmez.
