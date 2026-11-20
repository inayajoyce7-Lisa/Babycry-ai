import React, { useState } from 'react';
import { Mic, Upload, Baby, ShieldAlert, ArrowRight, Clock, Volume2 } from 'lucide-react';
import type { BabyProfile, CryAnalysisRecord, Language, ScreenId } from '../types/babycry';
import { TRANSLATIONS } from '../i18n/translations';
import { calculateBabyAge, formatBabyAge, getAgeAdaptedTipFocus } from '../utils/babyDomain';

interface HomeScreenProps {
  language: Language;
  activeBaby: BabyProfile | null;
  latestAnalysis: CryAnalysisRecord | null;
  onNavigate: (screen: ScreenId) => void;
  onSelectAnalysis: (record: CryAnalysisRecord) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  language,
  activeBaby,
  latestAnalysis,
  onNavigate,
  onSelectAnalysis,
}) => {
  const t = TRANSLATIONS[language];
  const [heroImgError, setHeroImgError] = useState(false);

  const babyAge = activeBaby ? calculateBabyAge(activeBaby.birthDate) : null;
  const ageFormatted = babyAge ? formatBabyAge(babyAge, language) : null;

  return (
    <div className="space-y-8">
      {/* Hero Split Section */}
      <section className="rounded-3xl bg-gradient-to-br from-[#EAF4FF] via-white to-[#F3E8FF] border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-sm">
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-wide text-[#6D5DF6]">
                {t.brandName} · {t.brandSubtitle}
              </p>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance leading-tight">
                {t.home.heroTitle}
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                {t.home.heroDescription}
              </p>
            </div>

            {/* Primary Central Recording CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('record')}
                className="min-h-[56px] px-7 py-3.5 rounded-2xl bg-[#6D5DF6] hover:bg-[#5B4CE4] active:scale-[0.99] text-white font-bold text-base shadow-md shadow-violet-500/20 flex items-center justify-center gap-3 transition-all whitespace-nowrap"
              >
                <Mic className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{t.home.recordCta}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('record')}
                className="min-h-[56px] px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Upload className="w-4 h-4 text-sky-600 shrink-0" aria-hidden="true" />
                <span>{t.home.uploadShortcut}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex">
            <div className="w-full rounded-2xl overflow-hidden bg-white border border-slate-200/70 aspect-[4/3] lg:aspect-auto lg:h-full flex items-center justify-center">
              {!heroImgError ? (
                <img
                  src="/src/assets/images/hero_baby_soothing_1794694105321.jpg"
                  alt={t.home.heroTitle}
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-8 text-center space-y-2">
                  <Baby className="w-12 h-12 mx-auto text-[#6D5DF6]" aria-hidden="true" />
                  <p className="text-sm font-medium text-slate-600">{t.brandName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Row: Active Baby Profile & Pediatric Safety */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Baby Profile Summary Card */}
        <section className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between gap-4">
          {activeBaby && babyAge ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500">{t.home.activeBabyLabel}</p>
                  <h2 className="text-xl font-bold text-slate-900">{activeBaby.name}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="tabular-nums font-medium">{ageFormatted}</span>
                    <span aria-hidden="true">·</span>
                    <span>{t.feedingTypes[activeBaby.feedingType]}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#EAF4FF] hover:bg-sky-100 text-sky-900 text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  {t.home.editProfileCta}
                </button>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700 mb-1">{t.home.ageTipTitle}</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {getAgeAdaptedTipFocus(babyAge.stage, language)}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-between h-full gap-4">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900">{t.home.noBabyTitle}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{t.home.noBabyDesc}</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#EAF4FF] hover:bg-sky-100 text-sky-900 text-sm font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <Baby className="w-4 h-4" aria-hidden="true" />
                  <span>{t.home.createProfileCta}</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Pediatric Safety Card */}
        <section className="rounded-3xl bg-[#FCE7F3]/55 border border-rose-200/80 p-6 shadow-sm flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-800">
              <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
              <h2 className="text-lg font-bold">{t.home.safetyBannerTitle}</h2>
            </div>
            <p className="text-sm text-rose-950/85 leading-relaxed">{t.home.safetyBannerDesc}</p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => onNavigate('guides')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-900 border border-rose-200 text-sm font-semibold transition-colors inline-flex items-center gap-2"
            >
              <span>{t.home.safetyBannerCta}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>

      {/* Latest Insight Section */}
      <section className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">{t.home.latestInsightTitle}</h2>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="min-h-[40px] px-3 text-sm font-semibold text-[#6D5DF6] hover:underline whitespace-nowrap"
          >
            {t.home.viewAllHistory}
          </button>
        </div>

        {latestAnalysis ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{latestAnalysis.babyName}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {new Date(latestAnalysis.createdAt).toLocaleString(
                    language === 'fr' ? 'fr-FR' : 'en-US',
                    { dateStyle: 'medium', timeStyle: 'short' }
                  )}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {latestAnalysis.durationSec.toFixed(1)}s
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {(latestAnalysis.primaryHypothesis?.category &&
                  t.categories[latestAnalysis.primaryHypothesis.category]?.label) ||
                  t.categories.unusual.label}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-2">{latestAnalysis.simpleExplanation}</p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-xs text-slate-500">{t.results.modelConfidenceLabel}</p>
                <p className="text-2xl font-bold font-mono tabular-nums text-[#6D5DF6]">
                  {latestAnalysis.confidence}%
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectAnalysis(latestAnalysis)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#F3E8FF] hover:bg-violet-200/70 text-violet-950 text-sm font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                <span>{t.history.inspectBtn}</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 pt-2 border-t border-slate-100">
            {t.home.noHistoryYet}
          </p>
        )}
      </section>
    </div>
  );
};
