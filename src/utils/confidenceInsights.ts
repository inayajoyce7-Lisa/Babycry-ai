import type { CryAnalysisRecord, CryCategory } from '../types/babycry';

export type ComparisonSource = 'user_history' | 'model_baseline';

export type ConfidenceTier = 'above_average' | 'on_par' | 'below_average';

export type ContributionImpactLevel = 'high' | 'medium' | 'calibration' | 'low';

export type RefinementReasonKey =
  | 'inconclusive_audio'
  | 'underrepresented_category'
  | 'ambiguous_boundary'
  | 'below_average_edge_case'
  | 'strong_anchor'
  | 'balanced_reinforcement';

export interface CategoryCalibrationBenchmark {
  referenceAvg: number;
  targetSamples: number;
}

export const CATEGORY_BENCHMARKS: Record<CryCategory, CategoryCalibrationBenchmark> = {
  hunger: { referenceAvg: 74, targetSamples: 120 },
  fatigue: { referenceAvg: 68, targetSamples: 120 },
  discomfort: { referenceAvg: 63, targetSamples: 100 },
  diaper: { referenceAvg: 65, targetSamples: 100 },
  gas_colic: { referenceAvg: 70, targetSamples: 120 },
  comfort_holding: { referenceAvg: 64, targetSamples: 100 },
  pain: { referenceAvg: 76, targetSamples: 150 },
  temperature: { referenceAvg: 59, targetSamples: 90 },
  unusual: { referenceAvg: 48, targetSamples: 100 },
};

export interface ConfidenceInsightSummary {
  category: CryCategory;
  currentConfidence: number;
  comparisonAvg: number;
  comparisonSource: ComparisonSource;
  userCategoryCount: number;
  userCategoryAvg: number | null;
  referenceAvg: number;
  deltaPoints: number;
  tier: ConfidenceTier;
  secondaryGap: number | null;
  categoryContributionCount: number;
  targetSamples: number;
  coveragePct: number;
  impactLevel: ContributionImpactLevel;
  reasonKey: RefinementReasonKey;
}

export function computeConfidenceInsights(
  record: CryAnalysisRecord,
  allAnalyses: CryAnalysisRecord[],
  categoryBreakdown: Record<string, number>
): ConfidenceInsightSummary {
  const category = record.primaryHypothesis.category;
  const currentConfidence = Math.max(0, Math.min(100, Math.round(record.confidence)));
  const benchmark = CATEGORY_BENCHMARKS[category] ?? CATEGORY_BENCHMARKS.unusual;

  // Gather user's past analyses in the same primary category (excluding the active record itself)
  const peerRecords = allAnalyses.filter(
    (item) => item.id !== record.id && item.primaryHypothesis.category === category
  );
  const userCategoryCount = peerRecords.length;
  const userCategoryAvg =
    userCategoryCount > 0
      ? Math.round(
          peerRecords.reduce((sum, item) => sum + item.confidence, 0) / userCategoryCount
        )
      : null;

  const comparisonSource: ComparisonSource =
    userCategoryCount >= 2 && userCategoryAvg !== null ? 'user_history' : 'model_baseline';
  const comparisonAvg =
    comparisonSource === 'user_history' && userCategoryAvg !== null
      ? userCategoryAvg
      : benchmark.referenceAvg;

  const deltaPoints = currentConfidence - comparisonAvg;
  let tier: ConfidenceTier = 'on_par';
  if (deltaPoints >= 5) tier = 'above_average';
  else if (deltaPoints <= -5) tier = 'below_average';

  const topSecondary = record.secondaryHypotheses[0];
  const secondaryGap = topSecondary ? Math.max(0, currentConfidence - topSecondary.confidence) : null;

  const categoryContributionCount = categoryBreakdown[category] ?? 0;
  const coveragePct = Math.min(
    100,
    Math.round((categoryContributionCount / Math.max(1, benchmark.targetSamples)) * 100)
  );

  let impactLevel: ContributionImpactLevel;
  let reasonKey: RefinementReasonKey;

  if (record.isInconclusive || !record.acousticFeatures.isCryDetected) {
    impactLevel = 'low';
    reasonKey = 'inconclusive_audio';
  } else if (categoryContributionCount < 10) {
    impactLevel = 'high';
    reasonKey = 'underrepresented_category';
  } else if (secondaryGap !== null && secondaryGap <= 12) {
    impactLevel = 'high';
    reasonKey = 'ambiguous_boundary';
  } else if (deltaPoints <= -5) {
    impactLevel = 'high';
    reasonKey = 'below_average_edge_case';
  } else if (deltaPoints >= 5) {
    impactLevel = 'calibration';
    reasonKey = 'strong_anchor';
  } else {
    impactLevel = 'medium';
    reasonKey = 'balanced_reinforcement';
  }

  return {
    category,
    currentConfidence,
    comparisonAvg,
    comparisonSource,
    userCategoryCount,
    userCategoryAvg,
    referenceAvg: benchmark.referenceAvg,
    deltaPoints,
    tier,
    secondaryGap,
    categoryContributionCount,
    targetSamples: benchmark.targetSamples,
    coveragePct,
    impactLevel,
    reasonKey,
  };
}
