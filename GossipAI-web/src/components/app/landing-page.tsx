"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageCircleHeart,
  Route,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useApiQuery } from "@/lib/query/hooks";
import { STORE_LINKS } from "@/config/store-links";

const LANDING_LANGUAGES = [
  "tr",
  "en",
  "de",
  "fr",
  "es",
  "it",
] as const;

type LandingLanguage = (typeof LANDING_LANGUAGES)[number];

const LANDING_LANGUAGE_LABELS: Record<LandingLanguage, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
};

type LocalizedItem = {
  title: string;
  text: string;
};

type HowStep = {
  step: string;
  title: string;
  desc: string;
};

type LandingCopy = {
  features: string;
  plans: string;
  howItWorks: string;
  download: string;
  appStoreEyebrow: string;
  playStoreEyebrow: string;
  trustItems: LocalizedItem[];
  featureTag: string;
  featureHeading: string;
  heroBadge: string;
  heroLead: string;
  heroHighlight: string;
  heroDescription: string;
  featureCards: Array<{ title: string; desc: string }>;
  valueTag: string;
  valueHeading: string;
  valueDescription: string;
  valueBullets: string[];
  missionTag: string;
  missionHeading: string;
  missionDescription: string;
  missionCta: string;
  howTag: string;
  howHeading: string;
  howSteps: HowStep[];
  plansTag: string;
  plansHeading: string;
  plansSubheading: string;
  basicLabel: string;
  premiumLabel: string;
  basicCoreFeature: string;
  premiumCoreFeature: string;
  dailyPromptLabel: string;
  standardResponseFeature: string;
  platformFeature: string;
  premiumReasoningFeature: string;
  premiumPriorityFeature: string;
  premiumWorkflowFeature: string;
  usdPerMonth: string;
  basicBlurb: string;
  premiumBlurb: string;
  ctaHeading: string;
  ctaDescription: string;
  ctaBullets: string[];
  footerPrivacy: string;
  footerTerms: string;
  footerRights: string;
};

const TRANSLATIONS: Record<LandingLanguage, LandingCopy> = {
  tr: {
    features: "Özellikler",
    plans: "Planlar",
    howItWorks: "Nasıl Çalışır",
    download: "İndir",
    appStoreEyebrow: "Şuradan indir",
    playStoreEyebrow: "Şuradan al",
    trustItems: [
      { title: "Gizlilik odaklı", text: "Konuşma bağlamı güvenlik odaklı kontrollerle işlenir." },
      { title: "Hızlı akış", text: "Saniyeler içinde uygulanabilir taslak ve yönlendirme al." },
      { title: "Gerçek sohbetler için", text: "Flört geriliminden sınır konuşmalarına kadar pratik destek." },
    ],
    featureTag: "Dört ajan modu",
    featureHeading: "Zor konuşmaların her türü için tasarlandı",
    heroBadge: "AI İlişki Copilot'u · iOS ve Android",
    heroLead: "Zor mesaj gelir,",
    heroHighlight: "net yanıt çıkar",
    heroDescription: "GossipAI, duygular yükseldiğinde daha net yanıt vermene yardımcı olur. Sohbeti yapıştır, modu seç ve uygulanabilir bir yanıt stratejisi al.",
    featureCards: [
      { title: "Help Me Reply", desc: "Mesajı yapıştır, doğru tonda net bir yanıt taslağı al." },
      { title: "Situation Analysis", desc: "Yanıtlamadan önce niyeti, tonu ve riskleri analiz et." },
      { title: "Resolution Path", desc: "Gerilimi düşüren, ilerleten adım adım öneriler al." },
      { title: "Summarize", desc: "Uzun konuşmaları kısa özet ve aksiyona dönüştür." },
    ],
    valueTag: "Neden tercih ediliyor",
    valueHeading: "Startup hızı, kurumsal ton",
    valueDescription: "Hızlı çalışan ekipler ve üreticiler için; robotik değil, profesyonel bir iletişim desteği sunar.",
    valueBullets: [
      "Kendi üslubuna yakın yanıt seçenekleri",
      "Duygusal sohbetlerde bağlam odaklı taslaklar",
      "Uzun konuşmalarda eylem odaklı özetler",
      "Günlük mesajlaşma akışına uygun tasarım",
    ],
    missionTag: "Ürün vizyonu",
    missionHeading: "Daha az sürtüşme, daha iyi sonuç",
    missionDescription: "Modern ilişkiler ve ekip iletişimi için pratik bir AI katmanı inşa ediyoruz.",
    missionCta: "iOS'ta dene",
    howTag: "Basit ve net",
    howHeading: "Daha iyi yanıt için 3 adım",
    howSteps: [
      { step: "01", title: "Mesajı yapıştır", desc: "DM, SMS, e-posta fark etmez; gelen metni ekle." },
      { step: "02", title: "Ajan modunu seç", desc: "Help Me Reply, Situation Analysis, Resolution Path veya Summarize." },
      { step: "03", title: "Güvenle gönder", desc: "Çıktıyı gözden geçir, düzenle ve gönder." },
    ],
    plansTag: "Planlar",
    plansHeading: "Akışına uygun planı seç",
    plansSubheading: "Basic ile başla, daha fazla derinlik ve kullanım için Premium'a geç.",
    basicLabel: "Basic",
    premiumLabel: "Premium",
    basicCoreFeature: "Temel ajan modları",
    premiumCoreFeature: "Yüksek günlük limit",
    dailyPromptLabel: "Günlük prompt limiti",
    standardResponseFeature: "Standart yanıt üretimi",
    platformFeature: "iOS ve Android erişimi",
    premiumReasoningFeature: "Daha gelişmiş analiz ve yönlendirme",
    premiumPriorityFeature: "Yeni özelliklere öncelikli erişim",
    premiumWorkflowFeature: "Tam konuşma destek akışları",
    usdPerMonth: "USD / ay",
    basicBlurb: "Ürünü denemek ve günlük konuşmalar için ideal.",
    premiumBlurb: "Daha derin analiz, daha fazla kullanım ve güçlü workflow için.",
    ctaHeading: "Daha kontrollü iletişim kurmaya hazır mısın?",
    ctaDescription: "Basic ile başla, ihtiyaç arttığında Premium'a geç. GossipAI'yi indir ve ilk konuşma akışını bir dakikadan kısa sürede başlat.",
    ctaBullets: ["Basic plan mevcut", "iOS ve Android", "Güvenlik odaklı tasarım"],
    footerPrivacy: "Gizlilik Politikası",
    footerTerms: "Kullanım Şartları",
    footerRights: "Tüm hakları saklıdır.",
  },
  en: {
    features: "Features",
    plans: "Plans",
    howItWorks: "How it works",
    download: "Download",
    appStoreEyebrow: "Download on the",
    playStoreEyebrow: "Get it on",
    trustItems: [
      { title: "Privacy first", text: "Conversation context is processed with security controls in mind." },
      { title: "Fast workflow", text: "Get practical drafts and next-step guidance in seconds." },
      { title: "Built for real chats", text: "From dating tension to mixed signals and boundary talks." },
    ],
    featureTag: "Four agent modes",
    featureHeading: "Built for every kind of hard conversation",
    heroBadge: "AI Relationship Copilot · iOS and Android",
    heroLead: "Tough message in,",
    heroHighlight: "clear reply out",
    heroDescription: "GossipAI helps you respond with clarity when emotions are high. Paste the conversation, choose a mode, and get a response strategy you can actually use.",
    featureCards: [
      { title: "Help Me Reply", desc: "Paste a message and get a clear response draft with the right tone." },
      { title: "Situation Analysis", desc: "Break down intent, tone, and risk before you react." },
      { title: "Resolution Path", desc: "Follow practical next steps to de-escalate and move forward." },
      { title: "Summarize", desc: "Turn long threads into concise summaries and action points." },
    ],
    valueTag: "Why teams use it",
    valueHeading: "Startup speed, professional tone",
    valueDescription: "Built for fast-moving founders, operators, and creators who need to communicate clearly without sounding robotic.",
    valueBullets: [
      "Reply style options that stay close to your voice",
      "Context-aware drafts for emotional conversations",
      "Action-oriented summaries for long threads",
      "Designed for day-to-day messaging workflows",
    ],
    missionTag: "Product mission",
    missionHeading: "Less friction, better outcomes",
    missionDescription: "We are building the communication layer for modern relationships and teams.",
    missionCta: "Try on iOS",
    howTag: "Simple by design",
    howHeading: "Three steps to a better reply",
    howSteps: [
      { step: "01", title: "Paste the message", desc: "Copy whatever landed in your inbox." },
      { step: "02", title: "Pick an agent mode", desc: "Choose Help Me Reply, Situation Analysis, Resolution Path, or Summarize." },
      { step: "03", title: "Send with confidence", desc: "Review, edit if needed, and send." },
    ],
    plansTag: "Plans",
    plansHeading: "Choose the plan that fits your flow",
    plansSubheading: "Start with Basic, then upgrade to Premium when you need deeper analysis and higher usage.",
    basicLabel: "Basic",
    premiumLabel: "Premium",
    basicCoreFeature: "Core agent modes",
    premiumCoreFeature: "Higher daily limits",
    dailyPromptLabel: "Daily prompt limit",
    standardResponseFeature: "Standard response generation",
    platformFeature: "iOS and Android access",
    premiumReasoningFeature: "More advanced reasoning and guidance",
    premiumPriorityFeature: "Priority access to new features",
    premiumWorkflowFeature: "Full conversation support workflows",
    usdPerMonth: "USD / month",
    basicBlurb: "Perfect for trying GossipAI and handling everyday conversations.",
    premiumBlurb: "For power users who want more depth, more context, and more volume.",
    ctaHeading: "Ready to communicate with more control?",
    ctaDescription: "Start on Basic, upgrade to Premium when you need more firepower. Download GossipAI and run your first conversation workflow in under a minute.",
    ctaBullets: ["Basic plan available", "iOS and Android", "Security-minded design"],
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    footerRights: "All rights reserved.",
  },
  de: {
    features: "Funktionen",
    plans: "Pläne",
    howItWorks: "So funktioniert es",
    download: "Herunterladen",
    appStoreEyebrow: "Laden im",
    playStoreEyebrow: "Jetzt bei",
    trustItems: [
      { title: "Datenschutz zuerst", text: "Kontext wird mit Sicherheitskontrollen verarbeitet." },
      { title: "Schneller Ablauf", text: "In Sekunden praktische Entwürfe und nächste Schritte." },
      { title: "Für echte Chats", text: "Von Dating-Spannung bis zu schwierigen Grenzen." },
    ],
    featureTag: "Vier Agent-Modi",
    featureHeading: "Für jede schwierige Unterhaltung gebaut",
    heroBadge: "AI Relationship Copilot · iOS und Android",
    heroLead: "Schwierige Nachricht rein,",
    heroHighlight: "klare Antwort raus",
    heroDescription: "GossipAI hilft dir, in emotionalen Situationen klar zu antworten. Gespräch einfügen, Modus wählen, brauchbare Strategie erhalten.",
    featureCards: [
      { title: "Help Me Reply", desc: "Nachricht einfügen und einen klaren Antwortentwurf erhalten." },
      { title: "Situation Analysis", desc: "Absicht, Ton und Risiko erkennen, bevor du reagierst." },
      { title: "Resolution Path", desc: "Praktische Schritte zur Deeskalation und Lösung." },
      { title: "Summarize", desc: "Lange Threads in klare Zusammenfassungen verwandeln." },
    ],
    valueTag: "Warum Teams es nutzen",
    valueHeading: "Startup-Tempo, professioneller Ton",
    valueDescription: "Für schnelle Teams, die klar kommunizieren wollen, ohne robotisch zu wirken.",
    valueBullets: [
      "Antwortstile nah an deiner Stimme",
      "Kontextbewusste Entwürfe für emotionale Gespräche",
      "Aktionsorientierte Zusammenfassungen",
      "Für tägliche Nachrichtenabläufe optimiert",
    ],
    missionTag: "Produktmission",
    missionHeading: "Weniger Reibung, bessere Ergebnisse",
    missionDescription: "Wir bauen die Kommunikationsschicht für moderne Beziehungen und Teams.",
    missionCta: "Auf iOS testen",
    howTag: "Einfach gestaltet",
    howHeading: "Drei Schritte zur besseren Antwort",
    howSteps: [
      { step: "01", title: "Nachricht einfügen", desc: "Text, DM oder Mail kopieren und einfügen." },
      { step: "02", title: "Modus auswählen", desc: "Help Me Reply, Situation Analysis, Resolution Path oder Summarize." },
      { step: "03", title: "Sicher senden", desc: "Ergebnis prüfen, ggf. anpassen und senden." },
    ],
    plansTag: "Pläne",
    plansHeading: "Wähle den passenden Plan",
    plansSubheading: "Starte mit Basic und wechsle bei Bedarf zu Premium.",
    basicLabel: "Basic",
    premiumLabel: "Premium",
    basicCoreFeature: "Kern-Agent-Modi",
    premiumCoreFeature: "Höhere Tageslimits",
    dailyPromptLabel: "Tägliches Prompt-Limit",
    standardResponseFeature: "Standard-Antwortgenerierung",
    platformFeature: "iOS- und Android-Zugang",
    premiumReasoningFeature: "Erweiterte Analyse und Guidance",
    premiumPriorityFeature: "Priorisierter Zugang zu neuen Features",
    premiumWorkflowFeature: "Volle Konversations-Workflows",
    usdPerMonth: "USD / Monat",
    basicBlurb: "Ideal für den Alltag und den Einstieg.",
    premiumBlurb: "Mehr Tiefe, mehr Kontext und mehr Volumen.",
    ctaHeading: "Bereit fuer klarere Kommunikation?",
    ctaDescription: "Mit Basic starten, spaeter auf Premium upgraden.",
    ctaBullets: ["Basic-Plan verfügbar", "iOS und Android", "Sicherheitsorientiertes Design"],
    footerPrivacy: "Datenschutz",
    footerTerms: "Nutzungsbedingungen",
    footerRights: "Alle Rechte vorbehalten.",
  },
  fr: {
    features: "Fonctionnalités",
    plans: "Offres",
    howItWorks: "Comment ça marche",
    download: "Télécharger",
    appStoreEyebrow: "Télécharger sur",
    playStoreEyebrow: "Disponible sur",
    trustItems: [
      { title: "Confidentialité d'abord", text: "Le contexte est traité avec des contrôles de sécurité." },
      { title: "Flux rapide", text: "Des brouillons utiles et des actions en quelques secondes." },
      { title: "Pour les vraies discussions", text: "Des tensions relationnelles aux limites délicates." },
    ],
    featureTag: "Quatre modes d'agent",
    featureHeading: "Conçu pour chaque conversation difficile",
    heroBadge: "AI Relationship Copilot · iOS et Android",
    heroLead: "Message difficile en entrée,",
    heroHighlight: "réponse claire en sortie",
    heroDescription: "GossipAI vous aide à répondre avec clarté quand les émotions montent.",
    featureCards: [
      { title: "Help Me Reply", desc: "Collez un message et obtenez une réponse claire au bon ton." },
      { title: "Situation Analysis", desc: "Analysez intention, ton et risque avant de répondre." },
      { title: "Resolution Path", desc: "Suivez des étapes concrètes pour apaiser et avancer." },
      { title: "Summarize", desc: "Transformez les longs échanges en résumé actionnable." },
    ],
    valueTag: "Pourquoi les équipes l'utilisent",
    valueHeading: "Vitesse startup, ton professionnel",
    valueDescription: "Pour les équipes rapides qui veulent une communication claire sans son robotique.",
    valueBullets: [
      "Styles de réponse proches de votre voix",
      "Brouillons contextualisés pour conversations émotionnelles",
      "Résumés orientés action sur les longs fils",
      "Conçu pour les flux de messagerie quotidiens",
    ],
    missionTag: "Mission produit",
    missionHeading: "Moins de friction, meilleurs résultats",
    missionDescription: "Nous construisons la couche de communication des relations et équipes modernes.",
    missionCta: "Essayer sur iOS",
    howTag: "Simple par design",
    howHeading: "Trois étapes pour mieux répondre",
    howSteps: [
      { step: "01", title: "Collez le message", desc: "DM, SMS, e-mail: collez simplement le contenu reçu." },
      { step: "02", title: "Choisissez un mode", desc: "Help Me Reply, Situation Analysis, Resolution Path ou Summarize." },
      { step: "03", title: "Envoyez avec confiance", desc: "Relisez, ajustez si besoin, puis envoyez." },
    ],
    plansTag: "Offres",
    plansHeading: "Choisissez l'offre adaptée",
    plansSubheading: "Commencez avec Basic, passez a Premium si besoin.",
    basicLabel: "Basic",
    premiumLabel: "Premium",
    basicCoreFeature: "Modes d'agent essentiels",
    premiumCoreFeature: "Limites quotidiennes plus élevées",
    dailyPromptLabel: "Limite quotidienne de prompts",
    standardResponseFeature: "Génération de réponse standard",
    platformFeature: "Accès iOS et Android",
    premiumReasoningFeature: "Analyse et guidance avancées",
    premiumPriorityFeature: "Accès prioritaire aux nouvelles fonctionnalités",
    premiumWorkflowFeature: "Workflows complets de conversation",
    usdPerMonth: "USD / mois",
    basicBlurb: "Parfait pour démarrer et gérer les échanges du quotidien.",
    premiumBlurb: "Pour plus de profondeur et de volume.",
    ctaHeading: "Prêt à mieux communiquer ?",
    ctaDescription: "Commencez avec Basic puis passez à Premium quand vous en avez besoin.",
    ctaBullets: ["Offre Basic disponible", "iOS et Android", "Conception axée sécurité"],
    footerPrivacy: "Politique de confidentialité",
    footerTerms: "Conditions d'utilisation",
    footerRights: "Tous droits réservés.",
  },
  it: {
    features: "Funzionalità",
    plans: "Piani",
    howItWorks: "Come funziona",
    download: "Scarica",
    appStoreEyebrow: "Scarica su",
    playStoreEyebrow: "Disponibile su",
    trustItems: [
      { title: "Privacy al primo posto", text: "Il contesto viene elaborato con controlli di sicurezza." },
      { title: "Workflow rapido", text: "Bozze utili e prossimi passi in pochi secondi." },
      { title: "Per chat reali", text: "Dalle tensioni relazionali alle conversazioni sui confini." },
    ],
    featureTag: "Quattro modalita agente",
    featureHeading: "Pensato per ogni conversazione difficile",
    heroBadge: "AI Relationship Copilot · iOS e Android",
    heroLead: "Messaggio difficile in ingresso,",
    heroHighlight: "risposta chiara in uscita",
    heroDescription: "GossipAI ti aiuta a rispondere con chiarezza quando le emozioni sono alte.",
    featureCards: [
      { title: "Help Me Reply", desc: "Incolla un messaggio e ottieni una bozza chiara con il tono giusto." },
      { title: "Situation Analysis", desc: "Analizza intento, tono e rischio prima di rispondere." },
      { title: "Resolution Path", desc: "Segui passi pratici per ridurre tensioni e andare avanti." },
      { title: "Summarize", desc: "Trasforma thread lunghi in sintesi chiare e azionabili." },
    ],
    valueTag: "Perche i team lo usano",
    valueHeading: "Velocita startup, tono professionale",
    valueDescription: "Per team veloci che vogliono comunicare con chiarezza senza sembrare robotici.",
    valueBullets: [
      "Stili di risposta vicini alla tua voce",
      "Bozze contestuali per conversazioni emotive",
      "Sintesi orientate all'azione",
      "Progettato per i flussi di messaggistica quotidiani",
    ],
    missionTag: "Missione prodotto",
    missionHeading: "Meno attrito, risultati migliori",
    missionDescription: "Stiamo costruendo il layer di comunicazione per relazioni e team moderni.",
    missionCta: "Prova su iOS",
    howTag: "Semplice per design",
    howHeading: "Tre passi per una risposta migliore",
    howSteps: [
      { step: "01", title: "Incolla il messaggio", desc: "DM, SMS o email: incolla il testo ricevuto." },
      { step: "02", title: "Scegli una modalita", desc: "Help Me Reply, Situation Analysis, Resolution Path o Summarize." },
      { step: "03", title: "Invia con sicurezza", desc: "Rivedi, modifica se serve, poi invia." },
    ],
    plansTag: "Piani",
    plansHeading: "Scegli il piano giusto",
    plansSubheading: "Inizia con Basic e passa a Premium quando serve.",
    basicLabel: "Basic",
    premiumLabel: "Premium",
    basicCoreFeature: "Modalita agente essenziali",
    premiumCoreFeature: "Limiti giornalieri piu alti",
    dailyPromptLabel: "Limite giornaliero prompt",
    standardResponseFeature: "Generazione risposta standard",
    platformFeature: "Accesso iOS e Android",
    premiumReasoningFeature: "Analisi e guida avanzate",
    premiumPriorityFeature: "Accesso prioritario alle nuove funzioni",
    premiumWorkflowFeature: "Workflow completi di supporto conversazionale",
    usdPerMonth: "USD / mese",
    basicBlurb: "Perfetto per iniziare e gestire chat quotidiane.",
    premiumBlurb: "Per utenti che vogliono piu profondita e volume.",
    ctaHeading: "Pronto a comunicare meglio?",
    ctaDescription: "Inizia con Basic, passa a Premium quando vuoi.",
    ctaBullets: ["Piano Basic disponibile", "iOS e Android", "Design orientato alla sicurezza"],
    footerPrivacy: "Privacy Policy",
    footerTerms: "Termini di servizio",
    footerRights: "Tutti i diritti riservati.",
  },
  es: {
    features: "Funciones",
    plans: "Planes",
    howItWorks: "Como funciona",
    download: "Descargar",
    appStoreEyebrow: "Descargar en",
    playStoreEyebrow: "Disponible en",
    trustItems: [
      { title: "Privacidad primero", text: "El contexto se procesa con controles de seguridad." },
      { title: "Flujo rapido", text: "Borradores utiles y siguientes pasos en segundos." },
      { title: "Para chats reales", text: "Desde tension de pareja hasta limites delicados." },
    ],
    featureTag: "Cuatro modos de agente",
    featureHeading: "Disenado para cualquier conversacion dificil",
    heroBadge: "AI Relationship Copilot · iOS y Android",
    heroLead: "Mensaje dificil entra,",
    heroHighlight: "respuesta clara sale",
    heroDescription: "GossipAI te ayuda a responder con claridad cuando las emociones suben.",
    featureCards: [
      { title: "Help Me Reply", desc: "Pega un mensaje y recibe un borrador claro con el tono correcto." },
      { title: "Situation Analysis", desc: "Analiza intencion, tono y riesgo antes de responder." },
      { title: "Resolution Path", desc: "Sigue pasos practicos para desescalar y avanzar." },
      { title: "Summarize", desc: "Convierte hilos largos en resumenes accionables." },
    ],
    valueTag: "Por que los equipos lo usan",
    valueHeading: "Velocidad startup, tono profesional",
    valueDescription: "Pensado para equipos rapidos que quieren comunicacion clara sin sonar roboticos.",
    valueBullets: [
      "Estilos de respuesta cercanos a tu voz",
      "Borradores con contexto para conversaciones emocionales",
      "Resumenes orientados a la accion",
      "Disenado para el flujo diario de mensajeria",
    ],
    missionTag: "Mision del producto",
    missionHeading: "Menos friccion, mejores resultados",
    missionDescription: "Construimos la capa de comunicacion para relaciones y equipos modernos.",
    missionCta: "Probar en iOS",
    howTag: "Simple por diseno",
    howHeading: "Tres pasos para una mejor respuesta",
    howSteps: [
      { step: "01", title: "Pega el mensaje", desc: "DM, SMS o correo: pega el texto recibido." },
      { step: "02", title: "Elige un modo", desc: "Help Me Reply, Situation Analysis, Resolution Path o Summarize." },
      { step: "03", title: "Envia con confianza", desc: "Revisa, ajusta si hace falta y envia." },
    ],
    plansTag: "Planes",
    plansHeading: "Elige el plan para tu flujo",
    plansSubheading: "Empieza con Basic y sube a Premium cuando necesites mas.",
    basicLabel: "Basic",
    premiumLabel: "Premium",
    basicCoreFeature: "Modos de agente esenciales",
    premiumCoreFeature: "Limites diarios mas altos",
    dailyPromptLabel: "Limite diario de prompts",
    standardResponseFeature: "Generacion de respuesta estandar",
    platformFeature: "Acceso en iOS y Android",
    premiumReasoningFeature: "Analisis y guia avanzados",
    premiumPriorityFeature: "Acceso prioritario a nuevas funciones",
    premiumWorkflowFeature: "Workflows completos de soporte conversacional",
    usdPerMonth: "USD / mes",
    basicBlurb: "Ideal para empezar y conversaciones diarias.",
    premiumBlurb: "Para usuarios que necesitan mas profundidad y volumen.",
    ctaHeading: "Listo para comunicarte mejor?",
    ctaDescription: "Empieza con Basic y sube a Premium cuando quieras.",
    ctaBullets: ["Plan Basic disponible", "iOS y Android", "Diseno centrado en seguridad"],
    footerPrivacy: "Politica de privacidad",
    footerTerms: "Terminos de servicio",
    footerRights: "Todos los derechos reservados.",
  },
};

const publicPlanSchema = z.object({
  plan: z.enum(["basic", "premium"]),
  displayName: z.string(),
  priceUsd: z.number(),
  billingInterval: z.string(),
  dailyPromptLimit: z.number(),
});

const publicPlansSchema = z.array(publicPlanSchema);

const LANDING_LANGUAGE_STORAGE_KEY = "gossipai-landing-language";

/* ─── Apple logo SVG path (reused) ──────────────────────── */
const APPLE_PATH =
  "M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.5 0 129.5 46.4 174 46.4 43 0 110.6-49 193.9-49 31.3 0 113.7 2.9 169.9 87.1zm-234.8-181.9c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z";

/* ─── Google Play triangle SVG ───────────────────────────── */
function PlayIcon({ light = false }: { light?: boolean }) {
  const id = light ? "L" : "D";
  return (
    <svg viewBox="0 0 512 512" className="h-6 w-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`gp4${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={light ? "#aaeecc" : "#32a071"} />
          <stop offset="100%" stopColor={light ? "#88ffbb" : "#00e887"} />
        </linearGradient>
        <linearGradient id={`gp1${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={light ? "#9af0ff" : "#00c3ff"} />
          <stop offset="100%" stopColor={light ? "#7fffff" : "#1de9b6"} />
        </linearGradient>
        <linearGradient id={`gp2${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={light ? "#ffe566" : "#ffbc00"} />
          <stop offset="100%" stopColor={light ? "#ffb066" : "#ff4c00"} />
        </linearGradient>
        <linearGradient id={`gp3${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={light ? "#ff9090" : "#e5405e"} />
          <stop offset="100%" stopColor={light ? "#ffb066" : "#ff6b00"} />
        </linearGradient>
      </defs>
      <path fill={`url(#gp4${id})`} d="M54 50L271 256 54 462c-16-11-27-29-27-52V102c0-23 11-41 27-52z" />
      <path fill={`url(#gp1${id})`} d="M399 204l-56-32L271 256l72 72 57-33c24-14 38-38 38-64s-14-50-39-27z" transform="translate(-1,0)" />
      <path fill={`url(#gp2${id})`} d="M54 462l217-206 72 72-234 135c-20 12-41 11-55-1z" />
      <path fill={`url(#gp3${id})`} d="M54 50c14-12 35-13 55-2l234 135-72 73L54 50z" />
    </svg>
  );
}

/* ─── Reusable store badge ────────────────────────────────── */
function StoreBadge({
  href,
  label,
  eyebrow,
  title,
  icon,
  dark = false,
}: {
  href: string;
  label: string;
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={
        dark
          ? "inline-flex h-13 items-center gap-3 rounded-[10px] border border-white/30 bg-white/10 px-5 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          : "inline-flex h-13 items-center gap-3 rounded-[10px] bg-black px-5 text-white transition-opacity hover:opacity-80"
      }
    >
      {icon}
      <div className="flex flex-col items-start leading-tight">
        <span className={`text-[10px] font-normal tracking-wide ${dark ? "text-white/70" : ""}`}>{eyebrow}</span>
        <span className="text-[17px] font-semibold tracking-tight">{title}</span>
      </div>
    </a>
  );
}

/* ─── Main component ─────────────────────────────────────── */

export function LandingPage() {
  const [language, setLanguage] = useState<LandingLanguage>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(LANDING_LANGUAGE_STORAGE_KEY);
    if (!stored) return;

    if ((LANDING_LANGUAGES as readonly string[]).includes(stored)) {
      setLanguage(stored as LandingLanguage);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LANDING_LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const copy = TRANSLATIONS[language] ?? TRANSLATIONS.en;

  const plansQuery = useApiQuery({
    queryKey: ["public", "subscription", "plans"],
    request: {
      method: "GET",
      url: "/subscription/plans",
    },
    schema: publicPlansSchema,
    options: {
      retry: 1,
    },
  });

  const basicPlan = useMemo(
    () => plansQuery.data?.find((p) => p.plan === "basic") ?? { priceUsd: 0, dailyPromptLimit: 5 },
    [plansQuery.data]
  );
  const premiumPlan = useMemo(
    () => plansQuery.data?.find((p) => p.plan === "premium") ?? { priceUsd: 9.99, dailyPromptLimit: 100 },
    [plansQuery.data]
  );

  const formatUSD = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: value === 0 ? 0 : 2 }).format(value);

  return (
    <div className="relative overflow-hidden bg-[#f4f6fb] text-[#0f172a]">
      <div className="pointer-events-none absolute -left-28 -top-20 h-72 w-72 rounded-full bg-[#0070f3]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full bg-[#00c2a8]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-80 rounded-full bg-[#0f172a]/10 blur-3xl" />

      {/* ─── NAVBAR ─────────────────────────────────────── */}
      <nav className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#0f172a] text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(15,23,42,0.35)]">
            GA
          </div>
          <span className="text-sm font-semibold tracking-tight">GossipAI</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="#features" className="hidden text-sm text-[#334155] hover:text-[#0f172a] sm:block">{copy.features}</Link>
          <Link href="#plans" className="hidden text-sm text-[#334155] hover:text-[#0f172a] sm:block">{copy.plans}</Link>
          <Link href="#how-it-works" className="hidden text-sm text-[#334155] hover:text-[#0f172a] sm:block">{copy.howItWorks}</Link>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LandingLanguage)}
            className="h-9 rounded-lg border border-[#cbd5e1] bg-white px-2.5 text-xs text-[#0f172a]"
            aria-label="Landing language"
          >
            {LANDING_LANGUAGES.map((code) => (
              <option key={code} value={code}>
                {LANDING_LANGUAGE_LABELS[code]}
              </option>
            ))}
          </select>
          <a
            href={STORE_LINKS.appStore}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e293b]"
          >
            <svg viewBox="0 0 814 1000" className="h-3.5 w-3.5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d={APPLE_PATH} />
            </svg>
            {copy.download}
          </a>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-12 text-center">
        <Badge className="mb-6 inline-flex rounded-full border border-[#0f172a]/15 bg-white/90 px-4 py-1.5 text-sm font-medium text-[#0f172a]">
          {copy.heroBadge}
        </Badge>

        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          {copy.heroLead}
          <span className="bg-linear-to-r from-[#0f172a] via-[#0070f3] to-[#00a38c] bg-clip-text text-transparent">
            {copy.heroHighlight}
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#334155] sm:text-lg">
          {copy.heroDescription}
        </p>

        {/* Store badges */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <StoreBadge
            href={STORE_LINKS.appStore}
            label="Download on the App Store"
            eyebrow={copy.appStoreEyebrow}
            title="App Store"
            icon={
              <svg viewBox="0 0 814 1000" className="h-6 w-6 shrink-0 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d={APPLE_PATH} />
              </svg>
            }
          />
          <StoreBadge
            href={STORE_LINKS.playStore}
            label="Get it on Google Play"
            eyebrow={copy.playStoreEyebrow}
            title="Google Play"
            icon={<PlayIcon />}
          />
        </div>

        {/* Reality-based trust strip */}
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {copy.trustItems.map((item, index) => (
            <div key={item.title} className="rounded-2xl border border-[#0f172a]/10 bg-white/90 p-4 text-left shadow-sm">
              <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
                {index === 0 ? <ShieldCheck className="h-4 w-4" /> : null}
                {index === 1 ? <Zap className="h-4 w-4" /> : null}
                {index === 2 ? <CheckCircle2 className="h-4 w-4" /> : null}
                {item.title}
              </div>
              <p className="text-sm leading-relaxed text-[#475569]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────── */}
      <section id="features" className="relative mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0070f3]">{copy.featureTag}</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{copy.featureHeading}</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <MessageCircleHeart className="h-5 w-5" />, color: "#0f172a", bg: "bg-[#0f172a]/8", ...copy.featureCards[0] },
            { icon: <Sparkles className="h-5 w-5" />, color: "#0070f3", bg: "bg-[#0070f3]/10", ...copy.featureCards[1] },
            { icon: <Route className="h-5 w-5" />, color: "#00a38c", bg: "bg-[#00a38c]/10", ...copy.featureCards[2] },
            { icon: <FileText className="h-5 w-5" />, color: "#334155", bg: "bg-[#334155]/10", ...copy.featureCards[3] },
          ].map(({ icon, color, bg, title, desc }) => (
            <Card key={title} className="border-[#0f172a]/10 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className={`mb-4 inline-flex rounded-xl ${bg} p-3`} style={{ color }}>{icon}</div>
                <p className="mb-1.5 font-semibold">{title}</p>
                <p className="text-sm leading-relaxed text-[#475569]">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── VALUE GRID ─────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="border-[#0f172a]/10 bg-white/90 lg:col-span-2">
            <CardContent className="p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0070f3]">{copy.valueTag}</p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-tight">{copy.valueHeading}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#475569]">
                {copy.valueDescription}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {copy.valueBullets.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-[#334155]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#0070f3]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#0f172a]/10 bg-[#0f172a] text-white">
            <CardContent className="p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">{copy.missionTag}</p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-tight">{copy.missionHeading}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {copy.missionDescription}
              </p>
              <a
                href={STORE_LINKS.appStore}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-[#0f172a] hover:bg-white/90"
              >
                {copy.missionCta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────── */}
      <section id="how-it-works" className="relative bg-white/60 py-24 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0070f3]">{copy.howTag}</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{copy.howHeading}</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {copy.howSteps.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-start gap-4 rounded-2xl border border-[#0f172a]/10 bg-white/80 p-5">
                <span className="text-4xl font-black text-[#0f172a]/20">{step}</span>
                <div>
                  <p className="mb-1.5 font-semibold">{title}</p>
                  <p className="text-sm leading-relaxed text-[#475569]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────── */}
      <section id="plans" className="relative mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0070f3]">{copy.plansTag}</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{copy.plansHeading}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#475569]">
            {copy.plansSubheading}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Card className="border-[#0f172a]/10 bg-white/90">
            <CardContent className="p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#334155]">{copy.basicLabel}</p>
              <p className="mt-3 text-3xl font-extrabold text-[#0f172a]">{formatUSD(basicPlan.priceUsd)}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#64748b]">{copy.usdPerMonth}</p>
              <p className="mt-2 text-sm text-[#334155]">{copy.basicBlurb}</p>
              <div className="mt-6 space-y-2.5 text-sm text-[#1e293b]">
                {[
                  copy.basicCoreFeature,
                  `${copy.dailyPromptLabel}: ${basicPlan.dailyPromptLimit}`,
                  copy.standardResponseFeature,
                  copy.platformFeature,
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#0070f3]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#0070f3]/30 bg-[#0f172a] text-white shadow-[0_20px_50px_rgba(2,8,23,0.35)]">
            <CardContent className="p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#93c5fd]">{copy.premiumLabel}</p>
              <p className="mt-3 text-3xl font-extrabold">{formatUSD(premiumPlan.priceUsd)}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#93c5fd]">{copy.usdPerMonth}</p>
              <p className="mt-2 text-sm text-white/90">{copy.premiumBlurb}</p>
              <div className="mt-6 space-y-2.5 text-sm text-white/85">
                {[
                  `${copy.dailyPromptLabel}: ${premiumPlan.dailyPromptLimit}`,
                  copy.premiumReasoningFeature,
                  copy.premiumPriorityFeature,
                  copy.premiumWorkflowFeature,
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#67e8f9]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── CTA BANNER ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0f172a] py-20 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-[#0070f3]/25 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{copy.ctaHeading}</h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/85">
            {copy.ctaDescription}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <StoreBadge
              href={STORE_LINKS.appStore}
              label="Download on the App Store"
              eyebrow={copy.appStoreEyebrow}
              title="App Store"
              dark
              icon={
                <svg viewBox="0 0 814 1000" className="h-6 w-6 shrink-0 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d={APPLE_PATH} />
                </svg>
              }
            />
            <StoreBadge
              href={STORE_LINKS.playStore}
              label="Get it on Google Play"
              eyebrow={copy.playStoreEyebrow}
              title="Google Play"
              dark
              icon={<PlayIcon light />}
            />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm text-white/60">
            {copy.ctaBullets.map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-white/50" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────── */}
      <footer className="bg-[#f4f6fb]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 px-6 py-10 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#0f172a] text-[11px] font-bold text-white">GA</div>
            <span className="text-sm font-semibold">GossipAI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#475569]">
            <Link href="/privacy" className="hover:text-[#0f172a] hover:underline">{copy.footerPrivacy}</Link>
            <Link href="/terms" className="hover:text-[#0f172a] hover:underline">{copy.footerTerms}</Link>
            <a href={STORE_LINKS.appStore} target="_blank" rel="noopener noreferrer" className="hover:text-[#0f172a] hover:underline">App Store</a>
            <a href={STORE_LINKS.playStore} target="_blank" rel="noopener noreferrer" className="hover:text-[#0f172a] hover:underline">Google Play</a>
          </div>
          <p className="text-xs text-[#475569]">© {new Date().getFullYear()} GossipAI. {copy.footerRights}</p>
        </div>
      </footer>
    </div>
  );
}
