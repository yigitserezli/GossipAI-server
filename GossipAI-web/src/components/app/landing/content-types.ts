export const LANDING_LANGUAGES = [
  "tr",
  "en",
  "de",
  "fr",
  "es",
  "it",
] as const;

export type LandingLanguage = (typeof LANDING_LANGUAGES)[number];

export const LANDING_LANGUAGE_LABELS: Record<LandingLanguage, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
};

export type LocalizedItem = {
  title: string;
  text: string;
};

export type HowStep = {
  step: string;
  title: string;
  desc: string;
};

export type LandingCopy = {
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
