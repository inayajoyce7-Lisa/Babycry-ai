import React, { useState } from 'react';
import { ShieldCheck, Lock, HeartHandshake, AlertCircle } from 'lucide-react';
import type { Language } from '../types/babycry';
import { TRANSLATIONS } from '../i18n/translations';

interface ConsentModalProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onAccept: (allowDataset: boolean) => Promise<void>;
  onOpenPolicy: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  language,
  onLanguageChange,
  onAccept,
  onOpenPolicy,
}) => {
  const t = TRANSLATIONS[language];
  const [consentChecked, setConsentChecked] = useState(false);
  const [datasetOptIn, setDatasetOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked || submitting) return;
    setSubmitting(true);
    try {
      await onAccept(datasetOptIn);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-dialog-title"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl border border-slate-200/80 overflow-hidden my-auto">
        <div className="grid md:grid-cols-5 items-stretch">
          <div className="md:col-span-2 bg-gradient-to-br from-[#EAF4FF] via-[#F3E8FF] to-[#FCE7F3] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-4" role="group" aria-label={t.settings.languageLabel}>
                {(['fr', 'en', 'ht'] as Language[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onLanguageChange(code)}
                    className={`min-h-[36px] px-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      language === code
                        ? 'bg-slate-900 text-white'
                        : 'bg-white/80 text-slate-700 hover:bg-white'
                    }`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
              <h2 id="consent-dialog-title" className="text-xl font-bold text-slate-900 text-balance">
                {t.consent.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{t.consent.subtitle}</p>
            </div>

            <div className="mt-6 rounded-2xl overflow-hidden bg-white/70 border border-white/80 aspect-[4/3] flex items-center justify-center">
              {!imgFailed ? (
                <img
                  src="/src/assets/images/empty_history_calm_1794694105895.jpg"
                  alt={t.brandSubtitle}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShieldCheck className="w-12 h-12 text-[#6D5DF6]" aria-hidden="true" />
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="md:col-span-3 p-6 sm:p-7 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#6D5DF6] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-slate-700 leading-relaxed">{t.consent.bulletAudio}</p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-slate-700 leading-relaxed">{t.consent.bulletEncryption}</p>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-slate-700 leading-relaxed">{t.consent.bulletMedical}</p>
              </div>
              <div className="flex items-start gap-3">
                <HeartHandshake className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-slate-700 leading-relaxed">{t.consent.bulletCommercial}</p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-[#6D5DF6] focus:ring-[#6D5DF6]"
                />
                <span className="text-sm font-medium text-slate-900 leading-snug">
                  {t.consent.checkboxLabel}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={datasetOptIn}
                  onChange={(e) => setDatasetOptIn(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-[#6D5DF6] focus:ring-[#6D5DF6]"
                />
                <span className="text-xs text-slate-600 leading-snug">{t.consent.datasetOptInLabel}</span>
              </label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={onOpenPolicy}
                className="text-xs font-medium text-[#6D5DF6] hover:underline text-left min-h-[40px] whitespace-nowrap"
              >
                {t.consent.viewPolicy}
              </button>
              <button
                type="submit"
                disabled={!consentChecked || submitting}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6D5DF6] text-white text-sm font-semibold hover:bg-[#5B4CE4] disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
              >
                {t.consent.acceptCta}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
