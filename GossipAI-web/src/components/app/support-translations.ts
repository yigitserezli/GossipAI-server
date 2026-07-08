import type { LandingLanguage } from "@/components/app/landing/content";

type SupportCategory = {
  value: "account" | "billing" | "bug" | "feedback" | "general";
  label: string;
};

type SupportFaq = {
  question: string;
  answer: string;
};

export type SupportCopy = {
  support: string;
  home: string;
  heroTitle: string;
  heroDescription: string;
  emailTrackingTitle: string;
  emailTrackingText: string;
  faqFirstTitle: string;
  faqFirstText: string;
  faqTitle: string;
  formTitle: string;
  formDescription: string;
  sent: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  ticketId: string;
  sending: string;
  sendTicket: string;
  successToast: string;
  errorToast: string;
  categories: SupportCategory[];
  faqs: SupportFaq[];
};

export const SUPPORT_TRANSLATIONS: Record<LandingLanguage, SupportCopy> = {
  tr: {
    support: "Destek",
    home: "Ana sayfa",
    heroTitle: "GossipAI için insana ihtiyaç olduğunda buradayız.",
    heroDescription: "Hesap, ödeme, hata veya geri bildirim taleplerini doğrudan ekibe gönder. Talebin iletişim ve hesap detaylarınla admin paneline düşer.",
    emailTrackingTitle: "Email ile takip",
    emailTrackingText: "Her ticket yanıt adresiyle, varsa bağlı kullanıcı hesabıyla birlikte kaydedilir.",
    faqFirstTitle: "Önce FAQ, sonra ticket",
    faqFirstText: "Hızlı cevaplar aşağıda; çözülmeyen her konu form üzerinden ekibe gider.",
    faqTitle: "FAQ",
    formTitle: "Ticket aç",
    formDescription: "Ne olduğunu ve sana nereden ulaşabileceğimizi yaz.",
    sent: "Gönderildi",
    name: "Ad",
    email: "Email",
    category: "Kategori",
    subject: "Konu",
    message: "Mesaj",
    ticketId: "Ticket ID",
    sending: "Gönderiliyor...",
    sendTicket: "Ticket gönder",
    successToast: "Support ticket gönderildi.",
    errorToast: "Ticket gönderilemedi",
    categories: [
      { value: "account", label: "Hesap" },
      { value: "billing", label: "Ödeme" },
      { value: "bug", label: "Hata" },
      { value: "feedback", label: "Geri bildirim" },
      { value: "general", label: "Genel" },
    ],
    faqs: [
      {
        question: "GossipAI bana ne yazmamda yardımcı olur?",
        answer: "Yanıt taslağı hazırlama, konuşmayı analiz etme, uzun sohbeti özetleme ve flört, arkadaşlık, aile ya da iş konuşmalarında daha sakin bir cevap bulma konusunda yardımcı olur.",
      },
      {
        question: "Bir sohbet konuşmasını GossipAI'ye yapıştırabilir miyim?",
        answer: "Evet. Tonu, niyeti ve olası yanıtları analiz edebilmesi için ilgili sohbet bağlamını yapıştırabilirsin. Gerekli olmayan hassas kişisel bilgileri paylaşmamaya dikkat et.",
      },
      {
        question: "GossipAI konuşmalarımı hatırlar mı?",
        answer: "GossipAI, yanıtları tutarlı tutmak için konuşma bağlamını kullanabilir. Gizlilikle ilgili inceleme gerektiren bir konu varsa support üzerinden bize ulaşabilirsin.",
      },
      {
        question: "Neden günlük limite takıldım?",
        answer: "Ücretsiz kullanımda günlük prompt limiti olabilir. Premium hesaplarda aktif plana göre daha geniş kullanım sağlanır.",
      },
      {
        question: "GossipAI ilişki tavsiyesi verir mi?",
        answer: "İletişim kurma ve mesaj yazma konusunda düşünmene yardımcı olur; ancak terapist, hukuk danışmanı veya acil destek servisi değildir. Acil güvenlik durumlarında yerel acil yardım hatlarına başvur.",
      },
      {
        question: "Yanıt neden fazla flörtöz, ciddi veya resmi geliyor?",
        answer: "Çıktı verdiğin bağlama ve seçtiğin stile bağlıdır. Hedefini, ilişki türünü ve ton sınırlarını daha net yazarsan daha iyi sonuç alırsın.",
      },
      {
        question: "Ne kadar hızlı dönüş yapıyorsunuz?",
        answer: "Çoğu ticket 1 iş günü içinde incelenir. Ödeme ve hesap erişimi konuları önceliklendirilir.",
      },
      {
        question: "Hata bildirimine ne eklemeliyim?",
        answer: "Hesap emailini, cihaz tipini, uygulama versiyonunu, ne beklediğini ve ne olduğunu yaz. Varsa ekran görüntüsü de faydalı olur.",
      },
      {
        question: "İade taleplerini buradan sorabilir miyim?",
        answer: "Evet. Ödeme kategorisini seçip mağaza, satın alma tarihi ve GossipAI hesabına bağlı emaili ekle.",
      },
      {
        question: "Giriş yapmam gerekiyor mu?",
        answer: "Hayır. Giriş yaptıysan ticket otomatik hesabına bağlanır; değilse formdaki ad ve email ile public ticket oluşturulur.",
      },
    ],
  },
  en: {
    support: "Support",
    home: "Home",
    heroTitle: "We are here when GossipAI needs a human.",
    heroDescription: "Send account, billing, bug, or feedback tickets directly to the team. Your request will appear in the admin panel with your contact and account details.",
    emailTrackingTitle: "Email-backed tracking",
    emailTrackingText: "Every ticket stores a reply address and account link when available.",
    faqFirstTitle: "FAQ first, ticket second",
    faqFirstText: "Quick answers are below; anything unresolved goes through the form.",
    faqTitle: "FAQ",
    formTitle: "Open a ticket",
    formDescription: "Tell us what happened and where we can reply.",
    sent: "Sent",
    name: "Name",
    email: "Email",
    category: "Category",
    subject: "Subject",
    message: "Message",
    ticketId: "Ticket ID",
    sending: "Sending...",
    sendTicket: "Send ticket",
    successToast: "Support ticket sent.",
    errorToast: "Ticket could not be sent",
    categories: [
      { value: "account", label: "Account" },
      { value: "billing", label: "Billing" },
      { value: "bug", label: "Bug" },
      { value: "feedback", label: "Feedback" },
      { value: "general", label: "General" },
    ],
    faqs: [
      {
        question: "What can GossipAI help me write?",
        answer: "GossipAI helps you draft replies, understand a conversation, summarize context, and find a calmer way to respond in dating, friendship, family, or work chats.",
      },
      {
        question: "Can I paste a chat conversation into GossipAI?",
        answer: "Yes. You can paste relevant chat context so GossipAI can analyze tone, intent, and possible next replies. Avoid sharing sensitive personal data that is not needed.",
      },
      {
        question: "Does GossipAI remember my conversations?",
        answer: "GossipAI can use conversation context to keep replies consistent. You can manage privacy-sensitive requests through support if something needs review.",
      },
      {
        question: "Why did I hit a daily limit?",
        answer: "Free usage may have daily prompt limits. Premium accounts get expanded access depending on the active plan connected to the account.",
      },
      {
        question: "Can GossipAI give relationship advice?",
        answer: "It can help you think through communication and wording, but it is not a therapist, legal advisor, or emergency service. For urgent safety issues, contact local emergency or crisis resources.",
      },
      {
        question: "Why does an answer feel too flirty, serious, or formal?",
        answer: "The result depends on the context and style you choose. Add more detail about your goal, relationship, and tone limits to get a better reply.",
      },
      {
        question: "How fast do you reply?",
        answer: "Most tickets are reviewed within 1 business day. Billing and account access issues are prioritized first.",
      },
      {
        question: "What should I include in a bug report?",
        answer: "Send your account email, device type, app version, what you expected, and what happened. Screenshots are useful when available.",
      },
      {
        question: "Can I ask about refunds here?",
        answer: "Yes. Choose Billing and include the store, purchase date, and the email connected to your GossipAI account.",
      },
      {
        question: "Do I need to be signed in?",
        answer: "No. Signed-in tickets are linked to your account automatically, but the form also accepts name and email for public support.",
      },
    ],
  },
  de: {
    support: "Support",
    home: "Startseite",
    heroTitle: "Wir sind da, wenn GossipAI menschliche Hilfe braucht.",
    heroDescription: "Sende Fragen zu Konto, Zahlung, Fehlern oder Feedback direkt an das Team. Deine Anfrage erscheint im Admin-Panel mit Kontakt- und Kontodaten.",
    emailTrackingTitle: "Nachverfolgung per E-Mail",
    emailTrackingText: "Jedes Ticket speichert eine Antwortadresse und, falls vorhanden, den verknuepften Account.",
    faqFirstTitle: "Erst FAQ, dann Ticket",
    faqFirstText: "Schnelle Antworten findest du unten; alles Offene geht ueber das Formular ans Team.",
    faqTitle: "FAQ",
    formTitle: "Ticket oeffnen",
    formDescription: "Beschreibe, was passiert ist und wo wir antworten koennen.",
    sent: "Gesendet",
    name: "Name",
    email: "E-Mail",
    category: "Kategorie",
    subject: "Betreff",
    message: "Nachricht",
    ticketId: "Ticket-ID",
    sending: "Wird gesendet...",
    sendTicket: "Ticket senden",
    successToast: "Support-Ticket gesendet.",
    errorToast: "Ticket konnte nicht gesendet werden",
    categories: [
      { value: "account", label: "Konto" },
      { value: "billing", label: "Zahlung" },
      { value: "bug", label: "Fehler" },
      { value: "feedback", label: "Feedback" },
      { value: "general", label: "Allgemein" },
    ],
    faqs: [
      { question: "Wobei hilft mir GossipAI beim Schreiben?", answer: "GossipAI hilft bei Antwortentwuerfen, Analyse von Gespraechen, Zusammenfassungen und ruhigeren Antworten in Dating-, Freundschafts-, Familien- oder Arbeitschats." },
      { question: "Kann ich einen Chat in GossipAI einfuegen?", answer: "Ja. Fuege relevanten Kontext ein, damit GossipAI Ton, Absicht und moegliche Antworten analysieren kann. Teile keine unnoetigen sensiblen Daten." },
      { question: "Merkt sich GossipAI meine Gespraeche?", answer: "GossipAI kann Kontext nutzen, um Antworten konsistent zu halten. Bei Datenschutzfragen kannst du uns ueber Support kontaktieren." },
      { question: "Warum habe ich ein Tageslimit erreicht?", answer: "Kostenlose Nutzung kann Tageslimits haben. Premium-Accounts erhalten je nach aktivem Plan mehr Nutzung." },
      { question: "Gibt GossipAI Beziehungstipps?", answer: "Es hilft bei Kommunikation und Formulierungen, ist aber kein Therapeut, Rechtsberater oder Notfalldienst. Bei akuter Gefahr kontaktiere lokale Notfallstellen." },
      { question: "Warum wirkt eine Antwort zu flirtend, ernst oder formell?", answer: "Das Ergebnis haengt von Kontext und Stil ab. Beschreibe Ziel, Beziehung und Ton-Grenzen genauer." },
      { question: "Wie schnell antwortet ihr?", answer: "Die meisten Tickets werden innerhalb eines Werktags geprueft. Zahlungs- und Kontozugangsprobleme haben Prioritaet." },
      { question: "Was gehoert in einen Fehlerbericht?", answer: "Sende Account-E-Mail, Geraetetyp, App-Version, erwartetes Verhalten und was passiert ist. Screenshots helfen." },
      { question: "Kann ich Rueckerstattungen hier anfragen?", answer: "Ja. Waehle Zahlung und nenne Store, Kaufdatum und die E-Mail deines GossipAI-Kontos." },
      { question: "Muss ich angemeldet sein?", answer: "Nein. Angemeldete Tickets werden automatisch verknuepft; sonst wird ein Public Ticket mit Name und E-Mail erstellt." },
    ],
  },
  fr: {
    support: "Assistance",
    home: "Accueil",
    heroTitle: "Nous sommes là quand GossipAI a besoin d'un humain.",
    heroDescription: "Envoyez vos demandes de compte, paiement, bug ou feedback directement à l'équipe. Elles apparaissent dans l'admin avec vos coordonnées et détails de compte.",
    emailTrackingTitle: "Suivi par e-mail",
    emailTrackingText: "Chaque ticket conserve une adresse de réponse et le compte associé lorsqu'il existe.",
    faqFirstTitle: "FAQ d'abord, ticket ensuite",
    faqFirstText: "Les réponses rapides sont ci-dessous; le reste passe par le formulaire.",
    faqTitle: "FAQ",
    formTitle: "Ouvrir un ticket",
    formDescription: "Expliquez ce qui s'est passé et où nous pouvons répondre.",
    sent: "Envoyé",
    name: "Nom",
    email: "E-mail",
    category: "Catégorie",
    subject: "Sujet",
    message: "Message",
    ticketId: "Ticket ID",
    sending: "Envoi...",
    sendTicket: "Envoyer le ticket",
    successToast: "Ticket support envoyé.",
    errorToast: "Le ticket n'a pas pu être envoyé",
    categories: [
      { value: "account", label: "Compte" },
      { value: "billing", label: "Paiement" },
      { value: "bug", label: "Bug" },
      { value: "feedback", label: "Feedback" },
      { value: "general", label: "Général" },
    ],
    faqs: [
      { question: "Que peut m'aider à écrire GossipAI ?", answer: "GossipAI aide à rédiger des réponses, analyser une conversation, résumer le contexte et trouver une réponse plus calme pour les échanges personnels ou professionnels." },
      { question: "Puis-je coller une conversation dans GossipAI ?", answer: "Oui. Collez le contexte utile pour analyser le ton, l'intention et les prochaines réponses possibles. Evitez les données sensibles inutiles." },
      { question: "GossipAI mémorise-t-il mes conversations ?", answer: "GossipAI peut utiliser le contexte pour garder des réponses cohérentes. Pour une demande liée à la confidentialité, contactez le support." },
      { question: "Pourquoi ai-je atteint une limite quotidienne ?", answer: "L'usage gratuit peut avoir des limites quotidiennes. Les comptes Premium disposent d'un accès étendu selon le plan actif." },
      { question: "GossipAI donne-t-il des conseils relationnels ?", answer: "Il aide à réfléchir à la communication, mais ne remplace pas un thérapeute, un avocat ni un service d'urgence. En cas d'urgence, contactez les services locaux." },
      { question: "Pourquoi une réponse semble trop flirt, sérieuse ou formelle ?", answer: "Le résultat dépend du contexte et du style choisi. Ajoutez votre objectif, la relation et les limites de ton." },
      { question: "Sous quel délai répondez-vous ?", answer: "La plupart des tickets sont examinés sous 1 jour ouvré. Les sujets paiement et accès compte sont prioritaires." },
      { question: "Que mettre dans un rapport de bug ?", answer: "Ajoutez l'e-mail du compte, l'appareil, la version de l'app, le résultat attendu et ce qui s'est produit. Les captures aident." },
      { question: "Puis-je demander un remboursement ici ?", answer: "Oui. Choisissez Paiement et indiquez le store, la date d'achat et l'e-mail lié au compte GossipAI." },
      { question: "Dois-je être connecté ?", answer: "Non. Les tickets connectés sont liés au compte automatiquement; sinon le formulaire crée un ticket public avec nom et e-mail." },
    ],
  },
  es: {
    support: "Soporte",
    home: "Inicio",
    heroTitle: "Estamos aquí cuando GossipAI necesita una persona.",
    heroDescription: "Envía tickets de cuenta, pagos, bugs o feedback directamente al equipo. La solicitud aparecerá en el panel admin con tus datos de contacto y cuenta.",
    emailTrackingTitle: "Seguimiento por email",
    emailTrackingText: "Cada ticket guarda una dirección de respuesta y el vínculo de cuenta cuando existe.",
    faqFirstTitle: "Primero FAQ, luego ticket",
    faqFirstText: "Las respuestas rápidas están abajo; lo que no se resuelva va por el formulario.",
    faqTitle: "FAQ",
    formTitle: "Abrir un ticket",
    formDescription: "Cuéntanos qué pasó y dónde podemos responder.",
    sent: "Enviado",
    name: "Nombre",
    email: "Email",
    category: "Categoría",
    subject: "Asunto",
    message: "Mensaje",
    ticketId: "Ticket ID",
    sending: "Enviando...",
    sendTicket: "Enviar ticket",
    successToast: "Ticket de soporte enviado.",
    errorToast: "No se pudo enviar el ticket",
    categories: [
      { value: "account", label: "Cuenta" },
      { value: "billing", label: "Pago" },
      { value: "bug", label: "Bug" },
      { value: "feedback", label: "Feedback" },
      { value: "general", label: "General" },
    ],
    faqs: [
      { question: "Qué puede ayudarme a escribir GossipAI?", answer: "GossipAI ayuda a redactar respuestas, entender conversaciones, resumir contexto y responder con más calma en chats personales o de trabajo." },
      { question: "Puedo pegar una conversación en GossipAI?", answer: "Sí. Pega el contexto relevante para analizar tono, intención y posibles respuestas. Evita datos sensibles innecesarios." },
      { question: "GossipAI recuerda mis conversaciones?", answer: "GossipAI puede usar contexto para mantener respuestas coherentes. Si necesitas revisión de privacidad, contacta soporte." },
      { question: "Por qué llegué a un límite diario?", answer: "El uso gratuito puede tener límites diarios. Las cuentas Premium tienen más acceso según el plan activo." },
      { question: "GossipAI da consejos de relación?", answer: "Ayuda a pensar la comunicación y el texto, pero no es terapeuta, asesor legal ni servicio de emergencia. En urgencias, contacta recursos locales." },
      { question: "Por qué una respuesta suena muy coqueta, seria o formal?", answer: "Depende del contexto y estilo elegido. Agrega objetivo, tipo de relación y límites de tono para mejorar el resultado." },
      { question: "Qué tan rápido responden?", answer: "La mayoría de tickets se revisan en 1 día hábil. Pagos y acceso a cuenta tienen prioridad." },
      { question: "Qué incluyo en un reporte de bug?", answer: "Incluye email de cuenta, dispositivo, versión de app, lo esperado y lo ocurrido. Las capturas ayudan." },
      { question: "Puedo consultar reembolsos aquí?", answer: "Sí. Elige Pago e incluye tienda, fecha de compra y email conectado a tu cuenta GossipAI." },
      { question: "Necesito iniciar sesión?", answer: "No. Si inicias sesión el ticket se vincula a tu cuenta; si no, se crea con el nombre y email del formulario." },
    ],
  },
  it: {
    support: "Supporto",
    home: "Home",
    heroTitle: "Siamo qui quando GossipAI ha bisogno di una persona.",
    heroDescription: "Invia ticket su account, pagamenti, bug o feedback direttamente al team. La richiesta apparirà nel pannello admin con contatto e dettagli account.",
    emailTrackingTitle: "Tracciamento via email",
    emailTrackingText: "Ogni ticket salva un indirizzo di risposta e il link all'account quando disponibile.",
    faqFirstTitle: "Prima FAQ, poi ticket",
    faqFirstText: "Le risposte rapide sono qui sotto; tutto il resto passa dal modulo.",
    faqTitle: "FAQ",
    formTitle: "Apri un ticket",
    formDescription: "Raccontaci cosa è successo e dove possiamo rispondere.",
    sent: "Inviato",
    name: "Nome",
    email: "Email",
    category: "Categoria",
    subject: "Oggetto",
    message: "Messaggio",
    ticketId: "Ticket ID",
    sending: "Invio...",
    sendTicket: "Invia ticket",
    successToast: "Ticket di supporto inviato.",
    errorToast: "Impossibile inviare il ticket",
    categories: [
      { value: "account", label: "Account" },
      { value: "billing", label: "Pagamento" },
      { value: "bug", label: "Bug" },
      { value: "feedback", label: "Feedback" },
      { value: "general", label: "Generale" },
    ],
    faqs: [
      { question: "Cosa puo aiutarmi a scrivere GossipAI?", answer: "GossipAI aiuta a creare risposte, capire conversazioni, riassumere contesto e rispondere con piu calma in chat personali o di lavoro." },
      { question: "Posso incollare una conversazione in GossipAI?", answer: "Si. Incolla il contesto rilevante per analizzare tono, intento e possibili risposte. Evita dati sensibili non necessari." },
      { question: "GossipAI ricorda le mie conversazioni?", answer: "GossipAI puo usare il contesto per mantenere risposte coerenti. Per richieste privacy, contatta il supporto." },
      { question: "Perche ho raggiunto un limite giornaliero?", answer: "L'uso gratuito puo avere limiti giornalieri. Gli account Premium hanno accesso ampliato in base al piano attivo." },
      { question: "GossipAI offre consigli relazionali?", answer: "Aiuta a ragionare sulla comunicazione, ma non e un terapeuta, consulente legale o servizio d'emergenza. In urgenza, contatta i servizi locali." },
      { question: "Perche una risposta sembra troppo flirt, seria o formale?", answer: "Dipende dal contesto e dallo stile scelto. Aggiungi obiettivo, relazione e limiti di tono." },
      { question: "Quanto velocemente rispondete?", answer: "La maggior parte dei ticket viene esaminata entro 1 giorno lavorativo. Pagamenti e accesso account hanno priorita." },
      { question: "Cosa includere in un bug report?", answer: "Invia email account, dispositivo, versione app, cosa ti aspettavi e cosa e successo. Screenshot utili." },
      { question: "Posso chiedere rimborsi qui?", answer: "Si. Scegli Pagamento e includi store, data acquisto ed email collegata all'account GossipAI." },
      { question: "Devo effettuare l'accesso?", answer: "No. I ticket autenticati sono collegati all'account; altrimenti il modulo crea un ticket pubblico con nome ed email." },
    ],
  },
};
