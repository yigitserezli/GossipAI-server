/// <reference types="node" />

import { NotificationCampaignStatus, NotificationScenario, type Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

type LocalizedContent = Record<string, string>;

type CampaignSeed = {
  scenario: NotificationScenario;
  status: NotificationCampaignStatus;
  targetPlan: "free" | "premium" | null;
  titleByLanguage: LocalizedContent;
  bodyByLanguage: LocalizedContent;
  deepLink: string;
};

const autoTranslateTemplate = (trText: string): LocalizedContent => ({
  tr: trText,
  en: `[AUTO_TRANSLATE_FROM_TR] ${trText}`,
  de: `[AUTO_TRANSLATE_FROM_TR] ${trText}`,
  fr: `[AUTO_TRANSLATE_FROM_TR] ${trText}`,
  it: `[AUTO_TRANSLATE_FROM_TR] ${trText}`,
  es: `[AUTO_TRANSLATE_FROM_TR] ${trText}`,
  ru: `[AUTO_TRANSLATE_FROM_TR] ${trText}`,
  zh: `[AUTO_TRANSLATE_FROM_TR] ${trText}`,
  ja: `[AUTO_TRANSLATE_FROM_TR] ${trText}`,
  ko: `[AUTO_TRANSLATE_FROM_TR] ${trText}`,
  uk: `[AUTO_TRANSLATE_FROM_TR] ${trText}`,
  pt: `[AUTO_TRANSLATE_FROM_TR] ${trText}`,
  "es-419": `[AUTO_TRANSLATE_FROM_TR] ${trText}`,
});

const CAMPAIGNS: CampaignSeed[] = [
  {
    scenario: "inactivity_3d",
    status: "draft",
    targetPlan: null,
    titleByLanguage: autoTranslateTemplate("Seni ozledik"),
    bodyByLanguage: autoTranslateTemplate("3 gundur yoktun. Bir mesaj getir, beraber cevaplayalim."),
    deepLink: "gossipai://tabs/chat",
  },
  {
    scenario: "inactivity_7d",
    status: "draft",
    targetPlan: null,
    titleByLanguage: autoTranslateTemplate("7 gundur uygulamaya girmedin"),
    bodyByLanguage: autoTranslateTemplate("Konusmalar seni bekliyor. Hemen don ve kaldigin yerden devam et."),
    deepLink: "gossipai://tabs/chat",
  },
  {
    scenario: "inactivity_10d",
    status: "draft",
    targetPlan: null,
    titleByLanguage: autoTranslateTemplate("10 gundur sessizlik var"),
    bodyByLanguage: autoTranslateTemplate("Hazirsan bugun net bir adim atin. Biz buradayiz."),
    deepLink: "gossipai://tabs/chat",
  },
  {
    scenario: "inactivity_15d",
    status: "draft",
    targetPlan: null,
    titleByLanguage: autoTranslateTemplate("15 gun sonra geri donus zamani"),
    bodyByLanguage: autoTranslateTemplate("Yeni bir sohbet ac ve durumunu birlikte netlestirelim."),
    deepLink: "gossipai://tabs/chat",
  },
  {
    scenario: "inactivity_30d",
    status: "draft",
    targetPlan: null,
    titleByLanguage: autoTranslateTemplate("Bir aydir yoksun"),
    bodyByLanguage: autoTranslateTemplate("Seni tekrar gormek guzel olur. Bugun kisa bir analizle basla."),
    deepLink: "gossipai://tabs/chat",
  },
  {
    scenario: "weekly_free_upsell",
    status: "draft",
    targetPlan: "free",
    titleByLanguage: autoTranslateTemplate("Premium ile daha hizli ilerle"),
    bodyByLanguage: autoTranslateTemplate("Bu hafta Premium ile gunluk 100 prompt ve tum modlar acik."),
    deepLink: "gossipai://subscription-plans",
  },
  {
    scenario: "manual_broadcast",
    status: "draft",
    targetPlan: null,
    titleByLanguage: autoTranslateTemplate("[Admin] Baslik"),
    bodyByLanguage: autoTranslateTemplate("[Admin] Icerik"),
    deepLink: "gossipai://tabs/home",
  },
];

const toJson = (value: LocalizedContent): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

const run = async () => {
  await prisma.notificationCampaign.deleteMany({ where: { createdBy: "seed:notifications" } });

  for (const campaign of CAMPAIGNS) {
    await prisma.notificationCampaign.create({
      data: {
        scenario: campaign.scenario,
        status: campaign.status,
        titleByLanguage: toJson(campaign.titleByLanguage),
        bodyByLanguage: toJson(campaign.bodyByLanguage),
        targetPlan: campaign.targetPlan,
        deepLink: campaign.deepLink,
        createdBy: "seed:notifications",
      },
    });
  }

  console.log(`Seeded ${CAMPAIGNS.length} notification campaigns.`);
};

run()
  .catch((error) => {
    console.error("Failed to seed notification campaigns", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
