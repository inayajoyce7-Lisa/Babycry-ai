import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, Sparkles, CheckCircle2 } from 'lucide-react';
import type { CryAnalysisRecord, Language } from '../types/babycry';
import { TRANSLATIONS } from '../i18n/translations';
import { computeConfidenceInsights } from '../utils/confidenceInsights';

interface ConfidenceGaugeProps {
  language: Language;
  record: CryAnalysisRecord;
  allAnalyses: CryAnalysisRecord[];
  categoryBreakdown: Record<string, number>;
  allowDatasetContribution: boolean;
  onEnableDatasetContribution: () => Promise<void>;
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, radius: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, radius, startDeg);
  const end = polarToCartesian(cx, cy, radius, endDeg);
  const largeArc = endDeg - startDeg <= 180 ? '0' : '1';
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  language,
  record,
  allAnalyses,
  categoryBreakdown,
  allowDatasetContribution,
  onEnableDatasetContribution,
}) => {
  const t = TRANSLATIONS[language];
  const g = t.results.gauge;
  const [enabling, setEnabling] = useState(false);

  const insights = computeConfidenceInsights(record, allAnalyses, categoryBreakdown);

  // Semicircle geometry: 180° (left = 0%) to 360° (right = 100%)
  const cx = 130;
  const cy = 115;
  const radius = 88;
  const trackPath = describeArc(cx, cy, radius, 180, 360);
  const currentAngle = 180 + (insights.currentConfidence / 100) * 180;
  const valuePath =
    insights.currentConfidence > 0
      ? describeArc(cx, cy, radius, 180, Math.max(181, currentAngle))
      : '';

  const avgAngle = 180 + (insights.comparisonAvg / 100) * 180;
  const avgInner = polarToCartesian(cx, cy, radius - 14, avgAngle);
  const avgOuter = polarToCartesian(cx, cy, radius + 14, avgAngle);
  const avgLabelPos = polarToCartesian(cx, cy, radius + 24, avgAngle);

  const tierText =
    insights.tier === 'above_average'
      ? g.tierAbove
      : insights.tier === 'below_average'
        ? g.tierBelow
        : g.tierOnPar;

  const deltaFormatted =
    insights.deltaPoints > 0 ? `+${insights.deltaPoints}` : `${insights.deltaPoints}`;

  const sourceLabel =
    insights.comparisonSource === 'user_history'
      ? `${g.sourceUserHistory} (${insights.userCategoryCount})`
      : g.sourceModelBaseline;

  const categoryLabel = t.categories[insights.category].label;

  return (
    <div
      className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 space-y-5"
      data-testid="confidence-gauge-panel"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">{g.title}</h3>
        <span className="text-xs text-slate-500">
          {categoryLabel} · {sourceLabel}
        </span>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-center">
        {/* Semicircular SVG Confidence Gauge */}
        <div className="md:col-span-5 flex flex-col items-center">
          <svg
            viewBox="0 0 260 148"
            className="w-full max-w-[260px] h-auto overflow-visible"
            role="img"
            aria-label={`${g.title}: ${insights.currentConfidence}% vs ${insights.comparisonAvg}%`}
          >
            <defs>
              <linearGradient id="babycry-gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor={record.isInconclusive ? '#D97706' : '#6D5DF6'} />
              </linearGradient>
            </defs>

            {/* Background Track */}
            <path
              d={trackPath}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Active Confidence Arc */}
            {valuePath && (
              <path
                d={valuePath}
                fill="none"
                stroke="url(#babycry-gauge-grad)"
                strokeWidth="14"
                strokeLinecap="round"
              />
            )}

            {/* Historical Average Marker Line */}
            <line
              x1={avgInner.x}
              y1={avgInner.y}
              x2={avgOuter.x}
              y2={avgOuter.y}
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <text
              x={avgLabelPos.x}
              y={avgLabelPos.y}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#334155"
            >
              {insights.comparisonAvg}%
            </text>

            {/* Scale endpoints */}
            <text x="34" y="136" fontSize="10" fill="#64748B" textAnchor="middle">
              0%
            </text>
            <text x="226" y="136" fontSize="10" fill="#64748B" textAnchor="middle">
              100%
            </text>

            {/* Center Readout */}
            <text
              x={cx}
              y={cy - 12}
              textAnchor="middle"
              fontSize="28"
              fontWeight="700"
              fill="#0F172A"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {insights.currentConfidence}%
            </text>
            <text
              x={cx}
              y={cy + 8}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#6D5DF6"
            >
              {tierText}
            </text>
          </svg>

          {/* Clean Comparison Summary Line */}
          <div className="w-full pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[11px] text-slate-500">{g.currentLabel}</p>
              <p className="text-sm font-mono tabular-nums font-bold text-slate-900">
                {insights.currentConfidence}%
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">{g.historicalAvgLabel}</p>
              <p className="text-sm font-mono tabular-nums font-bold text-slate-900">
                {insights.comparisonAvg}%
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">{g.deltaLabel}</p>
              <p
                className={`text-sm font-mono tabular-nums font-bold inline-flex items-center justify-center gap-0.5 ${
                  insights.tier === 'above_average'
                    ? 'text-emerald-700'
                    : insights.tier === 'below_average'
                      ? 'text-amber-700'
                      : 'text-slate-700'
                }`}
              >
                {insights.tier === 'above_average' && (
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {insights.tier === 'below_average' && (
                  <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {insights.tier === 'on_par' && <Minus className="w-3.5 h-3.5" aria-hidden="true" />}
                <span>{deltaFormatted} pts</span>
              </p>
            </div>
          </div>
        </div>

        {/* Category Refinement Impact Explanation */}
        <div className="md:col-span-7 space-y-3 md:border-l md:border-slate-100 md:pl-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#6D5DF6] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{g.impactLabels[insights.impactLevel]}</span>
              </p>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{g.refinementTitle}</h4>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{g.reasons[insights.reasonKey]}</p>

          {/* Category Dataset Coverage Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">{g.categorySamplesLabel}</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {insights.categoryContributionCount} / {insights.targetSamples}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#3B82F6] transition-all"
                style={{ width: `${Math.max(insights.categoryContributionCount > 0 ? 4 : 0, insights.coveragePct)}%` }}
              />
            </div>
          </div>

          {/* Dataset Opt-In Status / Quick Enable */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {record.parentFeedback ? (
              <p className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{g.submittedNote}</span>
              </p>
            ) : allowDatasetContribution ? (
              <p className="text-xs text-slate-600 leading-relaxed">{g.optInActiveNote}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-600 leading-relaxed">{g.optInInactiveNote}</p>
                <button
                  type="button"
                  disabled={enabling}
                  onClick={async () => {
                    setEnabling(true);
                    try {
                      await onEnableDatasetContribution();
                    } finally {
                      setEnabling(false);
                    }
                  }}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#EAF4FF] hover:bg-sky-100 text-sky-950 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {g.enableOptInBtn}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
