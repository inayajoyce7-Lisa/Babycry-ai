import type {
  AgeStage,
  CryCategory,
  Language,
  RetentionDays,
  SafetyEvaluationResult,
  SafetyRedFlagId,
} from '../types/babycry';

export const ALL_CRY_CATEGORIES: CryCategory[] = [
  'hunger',
  'fatigue',
  'discomfort',
  'diaper',
  'gas_colic',
  'comfort_holding',
  'pain',
  'temperature',
  'unusual',
];

export const ALL_SAFETY_RED_FLAGS: SafetyRedFlagId[] = [
  'breathing_difficulty',
  'bluish_skin',
  'hard_to_wake',
  'fever_under_3m',
  'unusual_general_state',
];

export interface BabyAgeInfo {
  days: number;
  weeks: number;
  months: number;
  stage: AgeStage;
  isUnderThreeMonths: boolean;
}

export function calculateBabyAge(birthDateIso: string, referenceDate: Date = new Date()): BabyAgeInfo {
  const birth = new Date(`${birthDateIso}T00:00:00`);
  if (Number.isNaN(birth.getTime())) {
    return {
      days: 0,
      weeks: 0,
      months: 0,
      stage: 'newborn',
      isUnderThreeMonths: true,
    };
  }

  const diffMs = Math.max(0, referenceDate.getTime() - birth.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.4375);

  let stage: AgeStage = 'newborn';
  if (days < 90) {
    stage = 'newborn';
  } else if (days < 180) {
    stage = 'young_infant';
  } else if (days < 365) {
    stage = 'older_infant';
  } else {
    stage = 'toddler';
  }

  return {
    days,
    weeks,
    months,
    stage,
    isUnderThreeMonths: days < 90,
  };
}

export function formatBabyAge(age: BabyAgeInfo, lang: Language): string {
  if (age.days < 14) {
    if (lang === 'fr') return `${age.days} jour${age.days > 1 ? 's' : ''}`;
    if (lang === 'ht') return `${age.days} jou`;
    return `${age.days} day${age.days !== 1 ? 's' : ''}`;
  }
  if (age.days < 60) {
    if (lang === 'fr') return `${age.weeks} semaine${age.weeks > 1 ? 's' : ''}`;
    if (lang === 'ht') return `${age.weeks} semèn`;
    return `${age.weeks} week${age.weeks !== 1 ? 's' : ''}`;
  }
  if (lang === 'fr') return `${age.months} mois`;
  if (lang === 'ht') return `${age.months} mwa`;
  return `${age.months} month${age.months !== 1 ? 's' : ''}`;
}

export function evaluateSafetyRedFlags(
  selectedFlags: SafetyRedFlagId[],
  babyAgeDays: number | null,
  temperatureCelsius?: number | null
): SafetyEvaluationResult {
  const triggered = new Set<SafetyRedFlagId>(selectedFlags);
  const isUnderThreeMonths = babyAgeDays === null ? true : babyAgeDays < 90;
  const feverRuleTriggered =
    typeof temperatureCelsius === 'number' &&
    !Number.isNaN(temperatureCelsius) &&
    temperatureCelsius >= 38.0 &&
    isUnderThreeMonths;

  if (feverRuleTriggered) {
    triggered.add('fever_under_3m');
  }

  return {
    isEmergency: triggered.size > 0,
    triggeredFlags: Array.from(triggered),
    feverRuleTriggered: feverRuleTriggered || triggered.has('fever_under_3m'),
  };
}

export function computeExpirationIso(createdAtIso: string, retentionDays: RetentionDays): string | null {
  if (retentionDays === 0) {
    return createdAtIso;
  }
  const base = new Date(createdAtIso);
  if (Number.isNaN(base.getTime())) {
    return null;
  }
  base.setUTCDate(base.getUTCDate() + retentionDays);
  return base.toISOString();
}

export function getAgeAdaptedTipFocus(stage: AgeStage, lang: Language): string {
  const tips: Record<AgeStage, Record<Language, string>> = {
    newborn: {
      fr: 'Nouveau-né (0-3 mois) : les besoins de succion, de chaleur peau à peau et de digestion (gaz) sont fréquents. Surveillez la température (>= 38 °C = urgence pédiatrique immédiate à cet âge).',
      en: 'Newborn (0-3 months): frequent feeding cues, skin-to-skin warmth, and immature digestion (gas) are common. Any fever >= 38.0°C (100.4°F) at this age requires immediate pediatric evaluation.',
      ht: 'Tibebe ki fèk fèt (0-3 mwa) : li bezwen tete souvan, chalè po ak po, epi li ka gen gaz fasil. Si li gen lafyèv >= 38 °C nan laj sa a, ale lopital touswit.',
    },
    young_infant: {
      fr: 'Nourrisson (3-6 mois) : les fenêtres d’éveil s’allongent mais la fatigue arrive vite. Observez les bâillements, le frottement des yeux et les signes de poussée dentaire précoce.',
      en: 'Infant (3-6 months): wake windows lengthen, though overtiredness builds quickly. Watch for eye-rubbing, yawning, and early teething discomfort.',
      ht: 'Tibebe (3-6 mwa) : tan li rete reveye a pi long men fatig ka pran l vit. Gade si l ap baye, si l ap fwote je l oswa si jansiv li ap fè l mal.',
    },
    older_infant: {
      fr: 'Bébé (6-12 mois) : angoisse de séparation, poussées dentaires et frustration motrice peuvent déclencher des pleurs intenses ou des appels de réconfort.',
      en: 'Older infant (6-12 months): separation anxiety, teething, and developmental frustration often trigger comfort-seeking or sharp discomfort cries.',
      ht: 'Tibebe (6-12 mwa) : laperèz pou l pa ret poukont li, dan k ap pouse, ak anvi bouje ka fè l kriye fò pou l mande konsolasyon.',
    },
    toddler: {
      fr: 'Grand bébé (12+ mois) : les pleurs expriment souvent la fatigue accumulée, une douleur localisée, la frustration ou un inconfort physique identifiable.',
      en: 'Toddler (12+ months): cries often reflect overtiredness, localized pain, sensory overload, or frustration.',
      ht: 'Timoun (12+ mwa) : kriye yo souvan montre gwo fatig, yon doulè kote ki fè l mal, oswa fristrasyon.',
    },
  };
  return tips[stage][lang];
}
