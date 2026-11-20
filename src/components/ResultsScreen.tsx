import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lightbulb,
  Mic,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from 'lucide-react';
import type { CryAnalysisRecord, CryCategory, Language, ScreenId } from '../types/babycry';
import { TRANSLATIONS } from '../i18n/translations';
import { ALL_CRY_CATEGORIES } from '../utils/babyDomain';

interface ResultsScreenProps {
  language: Language;
  record: CryAnalysisRecord | null;
  onSubmitFeedback: (
    id: string,
    feedback: { confirmedCategory?: CryCategory; helpful: boolean; notes?: string }
  ) => Promise<void>;
  onNavigate: (screen: ScreenId) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  language,
  record,
  onSubmitFeedback,
  onNavigate,
}) => {
  const t = TRANSLATIONS[language];
  const initialCategory: CryCategory =
    record?.parentFeedback?.confirmedCategory ??
    (record?.primaryHypothesis?.category && t.categories[record.primaryHypothesis.category]
      ? record.primaryHypothesis.category
      : 'hunger');

  const [helpful, setHelpful] = useState<boolean>(record?.parentFeedback?.helpful ?? true);
  const [confirmedCategory, setConfirmedCategory] = useState<CryCategory>(initialCategory);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(Boolean(record?.parentFeedback));

  useEffect(() => {
    setHelpful(record?.parentFeedback?.helpful ?? true);
    const nextCat =
      record?.parentFeedback?.confirmedCategory ??
      (record?.primaryHypothesis?.category && t.categories[record.primaryHypothesis.category]
        ? record.primaryHypothesis.category
        : 'hunger');
    setConfirmedCategory(nextCat);
    setFeedbackSaved(Boolean(record?.parentFeedback));
  }, [record?.id, record?.parentFeedback, record?.primaryHypothesis?.category, t.categories]);

  if (!record || !record.primaryHypothesis) {
    return (
      <div className="rounded-3xl bg-white border border-slate-200/80 p-8 text-center space-y-4">
        <p className="text-slate-600">{t.home.noHistoryYet}</p>
        <button
          type="button"
          onClick={() => onNavigate('record')}
          className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#6D5DF6] text-white text-sm font-semibold"
        >
          {t.home.recordCta}
        </button>
      </div>
    );
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFeedback(true);
    try {
      await onSubmitFeedback(record.id, {
        helpful,
        confirmedCategory,
      });
      setFeedbackSaved(true);
    } finally {
      setSavingFeedback(false);
    }
  };

  const safePrimaryCategory: CryCategory = t.categories[record.primaryHypothesis.category]
    ? record.primaryHypothesis.category
    : 'unusual';
  const primaryLabel = t.categories[safePrimaryCategory].label;

  return (
    <div className="space-y-6" data-testid="results-screen">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">
            {record.babyName} ·{' '}
            <span className="tabular-nums">
              {new Date(record.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{t.results.title}</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('record')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#6D5DF6] hover:bg-[#5B4CE4] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Mic className="w-4 h-4" aria-hidden="true" />
            <span>{t.results.recordAnotherCta}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold transition-colors whitespace-nowrap"
          >
            {t.results.backToHistoryCta}
          </button>
        </div>
      </div>

      {/* Primary Hypothesis + Confidence Card */}
      <section className="rounded-3xl bg-gradient-to-br from-[#EAF4FF] via-white to-[#F3E8FF] border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
        {record.isInconclusive && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm font-medium text-amber-950 flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />
            <span>{t.results.inconclusiveBadge}</span>
          </div>
        )}

        <div className="grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <p className="text-xs font-semibold text-[#6D5DF6]">{t.results.primaryLabel}</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{primaryLabel}</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{record.primaryHypothesis.rationale}</p>
          </div>

          <div className="md:col-span-4 rounded-2xl bg-white border border-slate-200/80 p-5 space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">{t.results.modelConfidenceLabel}</span>
              <span className="text-3xl font-bold font-mono tabular-nums text-[#6D5DF6]">
                {record.confidence}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#6D5DF6]"
                style={{ width: `${record.confidence}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug pt-1">
              {t.results.confidenceDisclaimer}
            </p>
          </div>
        </div>

        {/* Other Possibilities + Duration */}
        <div className="grid md:grid-cols-12 gap-6 pt-4 border-t border-slate-200/70">
          <div className="md:col-span-8 space-y-2">
            <p className="text-xs font-semibold text-slate-600">{t.results.otherPossibilities}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {(record.secondaryHypotheses ?? [])
                .filter((hyp) => hyp && t.categories[hyp.category])
                .map((hyp, i) => (
                  <div
                    key={`${hyp.category}-${i}`}
                    className="rounded-xl bg-white/85 border border-slate-200/70 px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <span className="text-sm font-semibold text-slate-800">
                      {t.categories[hyp.category].label}
                    </span>
                    <span className="text-sm font-mono tabular-nums font-bold text-slate-600">
                      {hyp.confidence}%
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col justify-center rounded-xl bg-white/85 border border-slate-200/70 px-4 py-3">
            <span className="text-xs text-slate-500">{t.results.durationLabel}</span>
            <span className="text-lg font-bold font-mono tabular-nums text-slate-900 inline-flex items-center gap-2 mt-0.5">
              <Clock className="w-4 h-4 text-sky-600" aria-hidden="true" />
              {record.durationSec.toFixed(1)} s
            </span>
            <span className="text-[11px] text-slate-500 mt-1 truncate">{record.modelSource}</span>
          </div>
        </div>
      </section>

      {/* Explanation & Practical Tips */}
      <div className="grid lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">{t.results.explanationLabel}</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{record.simpleExplanation}</p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#6D5DF6]" aria-hidden="true" />
              <span>{t.results.practicalTipsLabel}</span>
            </h2>
            <ul className="space-y-2.5">
              {record.practicalTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                  <span className="font-mono text-xs font-bold text-[#6D5DF6] mt-1 shrink-0">
                    0{idx + 1}.
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {record.hasAudioBlob && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-sky-600" aria-hidden="true" />
                <span>{t.results.audioPlaybackLabel}</span>
              </p>
              <audio controls src={`/api/analyses/${encodeURIComponent(record.id)}/audio`} className="w-full h-10" />
            </div>
          )}
        </section>

        {/* Acoustic Characteristics & DSP Metrics */}
        <section className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" aria-hidden="true" />
              <span>{t.results.observedTraitsLabel}</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">{record.acousticSummary}</p>

            {(record.observedTraits ?? []).filter((trait) => t.traits[trait]).length > 0 && (
              <div className="divide-y divide-slate-100 pt-2">
                {(record.observedTraits ?? [])
                  .filter((trait) => t.traits[trait])
                  .map((trait) => (
                    <div key={trait} className="py-2">
                      <p className="text-sm font-semibold text-slate-800">{t.traits[trait].label}</p>
                      <p className="text-xs text-slate-500">{t.traits[trait].description}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-700">{t.results.acousticMetricsLabel}</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-[#F8FBFF] p-3">
                <dt className="text-xs text-slate-500">{t.results.pitchLabel}</dt>
                <dd className="font-mono tabular-nums font-bold text-slate-900 mt-0.5">
                  {record.acousticFeatures.fundamentalFreqHz} Hz
                </dd>
              </div>
              <div className="rounded-xl bg-[#F8FBFF] p-3">
                <dt className="text-xs text-slate-500">{t.results.loudnessLabel}</dt>
                <dd className="font-mono tabular-nums font-bold text-slate-900 mt-0.5">
                  {record.acousticFeatures.rmsDb} dBFS
                </dd>
              </div>
              <div className="rounded-xl bg-[#F8FBFF] p-3">
                <dt className="text-xs text-slate-500">{t.results.burstsLabel}</dt>
                <dd className="font-mono tabular-nums font-bold text-slate-900 mt-0.5">
                  {record.acousticFeatures.cryBurstCount}
                </dd>
              </div>
              <div className="rounded-xl bg-[#F8FBFF] p-3">
                <dt className="text-xs text-slate-500">Pattern</dt>
                <dd className="text-xs font-semibold text-slate-900 mt-1">
                  {record.acousticFeatures.suddenShiftDetected
                    ? t.results.suddenShiftYes
                    : t.results.suddenShiftNo}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      {/* Medical Safety Reminder + Parent Feedback */}
      <div className="grid lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 rounded-3xl bg-[#FCE7F3]/55 border border-rose-200/80 p-6 space-y-2">
          <div className="flex items-center gap-2 text-rose-900">
            <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
            <h2 className="text-base font-bold">{t.results.medicalSafetyTitle}</h2>
          </div>
          <p className="text-sm text-rose-950/90 leading-relaxed">{t.results.medicalNeverReplaces}</p>
          {record.safetyReminders.length > 0 && (
            <ul className="text-xs text-rose-900/85 space-y-1 pt-2">
              {record.safetyReminders.map((rem, i) => (
                <li key={i}>• {rem}</li>
              ))}
            </ul>
          )}
        </section>

        <form
          onSubmit={handleFeedbackSubmit}
          className="lg:col-span-6 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4"
        >
          <div>
            <h2 className="text-base font-bold text-slate-900">{t.results.feedbackTitle}</h2>
            <p className="text-xs text-slate-600 mt-0.5">{t.results.feedbackDesc}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHelpful(true)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 border transition-colors ${
                helpful
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <ThumbsUp className="w-4 h-4" aria-hidden="true" />
              <span>{t.results.feedbackHelpfulYes}</span>
            </button>
            <button
              type="button"
              onClick={() => setHelpful(false)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 border transition-colors ${
                !helpful
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <ThumbsDown className="w-4 h-4" aria-hidden="true" />
              <span>{t.results.feedbackHelpfulNo}</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="feedback-category-select" className="block text-xs font-semibold text-slate-700">
              {t.results.feedbackCategoryLabel}
            </label>
            <select
              id="feedback-category-select"
              value={confirmedCategory}
              onChange={(e) => setConfirmedCategory(e.target.value as CryCategory)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50/50"
            >
              {ALL_CRY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t.categories[cat].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={savingFeedback}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#6D5DF6] hover:bg-[#5B4CE4] text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {t.results.feedbackSubmit}
            </button>
            {feedbackSaved && (
              <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                {t.results.feedbackSaved}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
