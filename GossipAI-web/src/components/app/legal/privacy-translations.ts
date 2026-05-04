export type SupportedLang = "en" | "tr" | "de" | "es";

export const LANGUAGE_LABELS: Record<SupportedLang, string> = {
  en: "EN",
  tr: "TR",
  de: "DE",
  es: "ES",
};

export type PrivacySection = {
  title: string;
  paragraph?: string;
  paragraphAfter?: string;
  items?: string[];
  hasContactLink?: boolean;
  contactEmail?: string;
};

export type PrivacyTranslation = {
  pageTitle: string;
  lastUpdated: string;
  backToHome: string;
  footerRights: string;
  footerPrivacy: string;
  footerTerms: string;
  sections: PrivacySection[];
};

const LAST_UPDATED = {
  en: "March 28, 2026",
  tr: "28 Mart 2026",
  de: "28. März 2026",
  es: "28 de marzo de 2026",
};

export const PRIVACY_TRANSLATIONS: Record<SupportedLang, PrivacyTranslation> = {
  en: {
    pageTitle: "Privacy Policy",
    lastUpdated: `Last updated: ${LAST_UPDATED.en}`,
    backToHome: "Back to home",
    footerRights: "All rights reserved.",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    sections: [
      {
        title: "1. Introduction",
        paragraph:
          'GossipAI operates the GossipAI mobile app and website (the "Service"). This Privacy Policy explains how we collect, use, and safeguard your information.',
      },
      {
        title: "2. Information We Collect",
        items: [
          "Account data: name, email address, and password hash.",
          "User-generated content: message text you voluntarily submit.",
          "Usage data: feature interactions and session metadata.",
          "Device data: device type, OS version, app version.",
          "Log data: IP address, browser type, crash reports.",
        ],
      },
      {
        title: "3. How We Use Your Information",
        items: [
          "To provide and maintain the Service.",
          "To process AI requests and return results.",
          "To send transactional communications.",
          "To improve product quality and reliability.",
          "To prevent abuse and comply with legal obligations.",
        ],
      },
      {
        title: "4. AI Processing & OpenAI",
        paragraph:
          "Submitted message text may be sent to OpenAI APIs to generate responses, under applicable contractual protections and platform policies.",
      },
      {
        title: "5. Data Retention",
        paragraph:
          "Conversation history may be retained to provide continuity. You may request deletion at",
        hasContactLink: true,
        paragraphAfter: ".",
      },
      {
        title: "6. Data Security",
        paragraph:
          "We use standard security measures including TLS in transit, secure password hashing, and authenticated access controls.",
      },
      {
        title: "7. Third-Party Services",
        items: [
          "OpenAI for model inference.",
          "Cloud hosting infrastructure providers.",
          "Email delivery providers for transactional messages.",
          "App distribution platforms for iOS and Android releases.",
        ],
      },
      {
        title: "8. Children's Privacy",
        paragraph:
          "The Service is not directed to children under 13 (or 16 in the EU). We do not knowingly collect child data.",
      },
      {
        title: "9. Your Rights",
        paragraph:
          "Depending on jurisdiction, you may request access, correction, deletion, restriction, objection, and portability of your personal data.",
      },
      {
        title: "10. International Transfers",
        paragraph:
          "If you access the Service from outside our hosting region, your data may be transferred internationally with required safeguards.",
      },
      {
        title: "11. Changes to This Policy",
        paragraph:
          'We may update this policy periodically and reflect changes by updating the "Last updated" date.',
      },
      {
        title: "12. Contact Us",
        paragraph: "For privacy questions, contact",
        hasContactLink: true,
        paragraphAfter: ".",
      },
    ],
  },

  tr: {
    pageTitle: "Gizlilik Politikası",
    lastUpdated: `Son güncelleme: ${LAST_UPDATED.tr}`,
    backToHome: "Ana sayfaya dön",
    footerRights: "Tüm hakları saklıdır.",
    footerPrivacy: "Gizlilik Politikası",
    footerTerms: "Kullanım Koşulları",
    sections: [
      {
        title: "1. Giriş",
        paragraph:
          'GossipAI, GossipAI mobil uygulamasını ve web sitesini ("Hizmet") işletmektedir. Bu Gizlilik Politikası, bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.',
      },
      {
        title: "2. Topladığımız Bilgiler",
        items: [
          "Hesap verileri: ad, e-posta adresi ve şifre hash'i.",
          "Kullanıcı tarafından oluşturulan içerik: gönüllü olarak ilettiğiniz mesaj metinleri.",
          "Kullanım verileri: özellik etkileşimleri ve oturum meta verileri.",
          "Cihaz verileri: cihaz türü, işletim sistemi sürümü, uygulama sürümü.",
          "Log verileri: IP adresi, tarayıcı türü, çökme raporları.",
        ],
      },
      {
        title: "3. Bilgilerinizi Nasıl Kullanıyoruz",
        items: [
          "Hizmeti sağlamak ve sürdürmek için.",
          "Yapay zeka isteklerini işlemek ve sonuçları döndürmek için.",
          "İşlemsel iletişimler göndermek için.",
          "Ürün kalitesini ve güvenilirliğini artırmak için.",
          "Kötüye kullanımı önlemek ve yasal yükümlülüklere uymak için.",
        ],
      },
      {
        title: "4. Yapay Zeka İşleme ve OpenAI",
        paragraph:
          "Gönderilen mesaj metinleri, yanıtlar oluşturmak amacıyla OpenAI API'lerine gönderilebilir; bu işlem ilgili sözleşme korumaları ve platform politikaları kapsamında gerçekleştirilir.",
      },
      {
        title: "5. Veri Saklama",
        paragraph: "Konuşma geçmişi süreklilik sağlamak amacıyla saklanabilir. Silme talebinde bulunmak için",
        hasContactLink: true,
        paragraphAfter: "adresine ulaşabilirsiniz.",
      },
      {
        title: "6. Veri Güvenliği",
        paragraph:
          "İletimde TLS, güvenli şifre hashleme ve kimlik doğrulamalı erişim kontrolleri dahil standart güvenlik önlemleri kullanıyoruz.",
      },
      {
        title: "7. Üçüncü Taraf Hizmetler",
        items: [
          "Model çıkarımı için OpenAI.",
          "Bulut barındırma altyapı sağlayıcıları.",
          "İşlemsel mesajlar için e-posta teslimat sağlayıcıları.",
          "iOS ve Android sürümleri için uygulama dağıtım platformları.",
        ],
      },
      {
        title: "8. Çocukların Gizliliği",
        paragraph:
          "Hizmet, 13 yaşın altındaki çocuklara (AB'de 16 yaş) yönelik değildir. Çocuklara ait verileri bilerek toplamıyoruz.",
      },
      {
        title: "9. Haklarınız",
        paragraph:
          "Yargı yetkisine bağlı olarak kişisel verilerinize erişim, düzeltme, silme, kısıtlama, itiraz etme ve taşınabilirlik haklarınızı kullanabilirsiniz.",
      },
      {
        title: "10. Uluslararası Transferler",
        paragraph:
          "Hizmete barındırma bölgemizin dışından erişiyorsanız verileriniz gerekli güvencelerle uluslararası olarak aktarılabilir.",
      },
      {
        title: "11. Bu Politikadaki Değişiklikler",
        paragraph:
          'Bu politikayı periyodik olarak güncelleyebilir ve değişiklikleri "Son güncelleme" tarihini güncelleyerek yansıtabiliriz.',
      },
      {
        title: "12. Bize Ulaşın",
        paragraph: "Gizlilik soruları için",
        hasContactLink: true,
        paragraphAfter: "adresine ulaşabilirsiniz.",
      },
      {
        title: "13. KVKK – Kişisel Verilerin Korunması",
        paragraph:
          "Türkiye'de ikamet eden kullanıcılar, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıdaki haklara sahiptir: kişisel verilerinin işlenip işlenmediğini öğrenme; işlenmişse buna ilişkin bilgi talep etme; işlenme amacını ve bu amaca uygun kullanılıp kullanılmadığını öğrenme; yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme; eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme; KVKK'nın 7. maddesi çerçevesinde silinmesini veya yok edilmesini talep etme; bu işlemlerin üçüncü kişilere bildirilmesini isteme; işlenen verilerin münhasıran otomatik sistemler aracılığıyla analizi sonucunda aleyhe bir sonuç doğurmasına itiraz etme; kanuna aykırı işleme nedeniyle uğranılan zararın tazminini talep etme. Bu haklarınızı kullanmak için",
        hasContactLink: true,
        contactEmail: "alpermir3@gmail.com",
        paragraphAfter: "adresine yazabilirsiniz.",
      },
    ],
  },

  de: {
    pageTitle: "Datenschutzerklärung",
    lastUpdated: `Zuletzt aktualisiert: ${LAST_UPDATED.de}`,
    backToHome: "Zurück zur Startseite",
    footerRights: "Alle Rechte vorbehalten.",
    footerPrivacy: "Datenschutzerklärung",
    footerTerms: "Nutzungsbedingungen",
    sections: [
      {
        title: "1. Einleitung",
        paragraph:
          'GossipAI betreibt die GossipAI-App und die Website (den "Dienst"). Diese Datenschutzerklärung erläutert, wie wir Ihre Daten erheben, verwenden und schützen.',
      },
      {
        title: "2. Von uns erhobene Daten",
        items: [
          "Kontodaten: Name, E-Mail-Adresse und Passwort-Hash.",
          "Nutzergenerierte Inhalte: von Ihnen freiwillig übermittelte Nachrichtentexte.",
          "Nutzungsdaten: Funktionsinteraktionen und Sitzungsmetadaten.",
          "Gerätedaten: Gerätetyp, Betriebssystemversion, App-Version.",
          "Protokolldaten: IP-Adresse, Browsertyp, Absturzberichte.",
        ],
      },
      {
        title: "3. Verwendung Ihrer Daten",
        items: [
          "Um den Dienst bereitzustellen und aufrechtzuerhalten.",
          "Um KI-Anfragen zu verarbeiten und Ergebnisse zurückzugeben.",
          "Um Transaktionskommunikationen zu senden.",
          "Um Produktqualität und -zuverlässigkeit zu verbessern.",
          "Um Missbrauch zu verhindern und rechtliche Verpflichtungen zu erfüllen.",
        ],
      },
      {
        title: "4. KI-Verarbeitung & OpenAI",
        paragraph:
          "Übermittelte Nachrichtentexte können unter geltenden vertraglichen Schutzmaßnahmen und Plattformrichtlinien an OpenAI-APIs gesendet werden.",
      },
      {
        title: "5. Datenspeicherung",
        paragraph:
          "Der Gesprächsverlauf kann zur Sicherstellung der Kontinuität gespeichert werden. Löschanfragen richten Sie bitte an",
        hasContactLink: true,
        paragraphAfter: ".",
      },
      {
        title: "6. Datensicherheit",
        paragraph:
          "Wir verwenden Standardsicherheitsmaßnahmen, einschließlich TLS bei der Übertragung, sicherem Passwort-Hashing und authentifizierten Zugriffskontrollen.",
      },
      {
        title: "7. Drittanbieterdienste",
        items: [
          "OpenAI für Modellinferenz.",
          "Anbieter von Cloud-Hosting-Infrastruktur.",
          "E-Mail-Zustellungsanbieter für Transaktionsnachrichten.",
          "App-Vertriebsplattformen für iOS- und Android-Releases.",
        ],
      },
      {
        title: "8. Datenschutz für Kinder",
        paragraph:
          "Der Dienst richtet sich nicht an Kinder unter 13 Jahren (oder 16 Jahren in der EU). Wir erheben wissentlich keine Daten von Kindern.",
      },
      {
        title: "9. Ihre Rechte",
        paragraph:
          "Je nach Zuständigkeit können Sie Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und Übertragbarkeit Ihrer personenbezogenen Daten beantragen.",
      },
      {
        title: "10. Internationale Datenübertragungen",
        paragraph:
          "Wenn Sie von außerhalb unserer Hosting-Region auf den Dienst zugreifen, können Ihre Daten mit den erforderlichen Schutzmaßnahmen international übertragen werden.",
      },
      {
        title: "11. Änderungen dieser Richtlinie",
        paragraph:
          'Wir können diese Richtlinie regelmäßig aktualisieren und Änderungen durch eine Aktualisierung des "Zuletzt aktualisiert"-Datums widerspiegeln.',
      },
      {
        title: "12. Kontakt",
        paragraph: "Bei Datenschutzfragen wenden Sie sich bitte an",
        hasContactLink: true,
        paragraphAfter: ".",
      },
    ],
  },

  es: {
    pageTitle: "Política de Privacidad",
    lastUpdated: `Última actualización: ${LAST_UPDATED.es}`,
    backToHome: "Volver al inicio",
    footerRights: "Todos los derechos reservados.",
    footerPrivacy: "Política de Privacidad",
    footerTerms: "Términos de Servicio",
    sections: [
      {
        title: "1. Introducción",
        paragraph:
          'GossipAI opera la aplicación móvil y el sitio web de GossipAI (el "Servicio"). Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos su información.',
      },
      {
        title: "2. Información que recopilamos",
        items: [
          "Datos de cuenta: nombre, dirección de correo electrónico y hash de contraseña.",
          "Contenido generado por el usuario: texto de mensajes que envía voluntariamente.",
          "Datos de uso: interacciones con funciones y metadatos de sesión.",
          "Datos del dispositivo: tipo de dispositivo, versión del SO, versión de la aplicación.",
          "Datos de registro: dirección IP, tipo de navegador, informes de fallos.",
        ],
      },
      {
        title: "3. Cómo usamos su información",
        items: [
          "Para proporcionar y mantener el Servicio.",
          "Para procesar solicitudes de IA y devolver resultados.",
          "Para enviar comunicaciones transaccionales.",
          "Para mejorar la calidad y fiabilidad del producto.",
          "Para prevenir abusos y cumplir con obligaciones legales.",
        ],
      },
      {
        title: "4. Procesamiento de IA y OpenAI",
        paragraph:
          "El texto de mensajes enviado puede ser transmitido a las APIs de OpenAI para generar respuestas, bajo las protecciones contractuales aplicables y las políticas de la plataforma.",
      },
      {
        title: "5. Retención de datos",
        paragraph:
          "El historial de conversaciones puede conservarse para proporcionar continuidad. Puede solicitar la eliminación escribiendo a",
        hasContactLink: true,
        paragraphAfter: ".",
      },
      {
        title: "6. Seguridad de datos",
        paragraph:
          "Utilizamos medidas de seguridad estándar que incluyen TLS en tránsito, hash seguro de contraseñas y controles de acceso autenticados.",
      },
      {
        title: "7. Servicios de terceros",
        items: [
          "OpenAI para inferencia de modelos.",
          "Proveedores de infraestructura de alojamiento en la nube.",
          "Proveedores de entrega de correo electrónico para mensajes transaccionales.",
          "Plataformas de distribución de aplicaciones para versiones iOS y Android.",
        ],
      },
      {
        title: "8. Privacidad de los menores",
        paragraph:
          "El Servicio no está dirigido a menores de 13 años (o 16 años en la UE). No recopilamos conscientemente datos de menores.",
      },
      {
        title: "9. Sus derechos",
        paragraph:
          "Dependiendo de la jurisdicción, puede solicitar acceso, corrección, eliminación, restricción, oposición y portabilidad de sus datos personales.",
      },
      {
        title: "10. Transferencias internacionales",
        paragraph:
          "Si accede al Servicio desde fuera de nuestra región de alojamiento, sus datos pueden transferirse internacionalmente con las salvaguardas requeridas.",
      },
      {
        title: "11. Cambios en esta política",
        paragraph:
          'Podemos actualizar esta política periódicamente y reflejar los cambios actualizando la fecha de "Última actualización".',
      },
      {
        title: "12. Contáctenos",
        paragraph: "Para preguntas sobre privacidad, escríbanos a",
        hasContactLink: true,
        paragraphAfter: ".",
      },
    ],
  },
};
