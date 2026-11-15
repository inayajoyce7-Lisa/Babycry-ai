import React, { useState } from 'react';
import { Lock, ShieldCheck, Trash2, Check, Globe } from 'lucide-react';
import type { Language, PrivacySettings, RetentionDays } from '../types/babycry';
import { TRANSLATIONS } from '../i18n/translations';

interface SettingsScreenProps {
  settings: PrivacySettings;
  datasetContributionsCount: number;
  onUpdateSettings: (
    patch: Partial<{
      language: Language;
      parentalConsentAccepted: boolean;
      retentionDays: RetentionDays;
      allowModelImprovementDataset: boolean;
    }>
  ) => Promise<void>;
  onEraseAllData: () => Promise<void>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  datasetContributionsCount,
  onUpdateSettings,
  onEraseAllData,
}) => {
  const t = TRANSLATIONS[settings.language];
  const [confirmErase, setConfirmErase] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);

  const handlePatch = async (
    patch: Partial<{
      language: Language;
      parentalConsentAccepted: boolean;
      retentionDays: RetentionDays;
      allowModelImprovementDataset: boolean;
    }>
  ) => {
    setSavedFlag(false);
    await onUpdateSettings(patch);
    setSavedFlag(true);
    window.setTimeout(() => setSavedFlag(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.settings.title}</h1>
          <p className="text-sm text-slate-600 mt-1">{t.settings.subtitle}</p>
        </div>
        {savedFlag && (
          <span role="status" className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" aria-hidden="true" />
            {t.settings.savedMessage}
          </span>
        )}
      </div>

      {/* Language Switcher */}
      <section className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#6D5DF6]" aria-hidden="true" />
          <span>{t.settings.languageLabel}</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { code: 'fr', label: 'Français' },
              { code: 'en', label: 'English' },
              { code: 'ht', label: 'Kreyòl Ayisyen' },
            ] as { code: Language; label: string }[]
          ).map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => handlePatch({ language: opt.code })}
              className={`min-h-[44px] px-5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                settings.language === opt.code
                  ? 'bg-[#6D5DF6] border-[#6D5DF6] text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Consent, Retention & Dataset Opt-In */}
      <section className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-600" aria-hidden="true" />
          <span>{t.settings.privacySectionTitle}</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-900">{t.settings.consentStatusLabel}</p>
            {settings.consentTimestamp && (
              <p className="text-xs text-slate-500 tabular-nums">
                {new Date(settings.consentTimestamp).toLocaleString(
                  settings.language === 'fr' ? 'fr-FR' : 'en-US'
                )}
              </p>
            )}
          </div>
          <span className="text-sm font-bold text-emerald-700">
            {settings.parentalConsentAccepted ? t.settings.consentGranted : t.settings.consentNotGranted}
          </span>
        </div>

        <div className="space-y-2 pb-4 border-b border-slate-100">
          <label htmlFor="retention-select" className="block text-sm font-semibold text-slate-900">
            {t.settings.retentionLabel}
          </label>
          <select
            id="retention-select"
            value={settings.retentionDays}
            onChange={(e) => handlePatch({ retentionDays: Number(e.target.value) as RetentionDays })}
            className="w-full sm:w-80 min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-sm"
          >
            {t.settings.retentionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-start justify-between gap-4 cursor-pointer">
          <div className="space-y-1">
            <span className="block text-sm font-semibold text-slate-900">
              {t.settings.datasetToggleLabel}
            </span>
            <span className="block text-xs text-slate-600 leading-relaxed">
              {t.settings.datasetToggleDesc}
            </span>
            <span className="block text-xs font-mono tabular-nums text-slate-500">
              {t.settings.datasetCountLabel}: {datasetContributionsCount}
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.allowModelImprovementDataset}
            onChange={(e) => handlePatch({ allowModelImprovementDataset: e.target.checked })}
            className="mt-1 h-5 w-5 rounded border-slate-300 text-[#6D5DF6] focus:ring-[#6D5DF6] shrink-0"
          />
        </label>
      </section>

      {/* Encryption & Privacy Policy */}
      <section className="rounded-3xl bg-[#EAF4FF]/45 border border-sky-200/80 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              {t.settings.encryptionTitle} ({settings.encryptionAlgorithm})
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">{t.settings.encryptionDesc}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-sky-200/60 space-y-2">
          <h3 className="text-sm font-bold text-slate-900">{t.settings.policyTitle}</h3>
          <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
            {t.settings.policyBody.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Permanent Erasure */}
      <section className="rounded-3xl bg-white border border-rose-200 p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-rose-950 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" aria-hidden="true" />
            <span>{t.settings.eraseAllTitle}</span>
          </h2>
          <p className="text-sm text-slate-600">{t.settings.eraseAllDesc}</p>
        </div>

        {!confirmErase ? (
          <button
            type="button"
            onClick={() => setConfirmErase(true)}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-sm font-semibold transition-colors"
          >
            {t.settings.eraseAllBtn}
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                await onEraseAllData();
                setConfirmErase(false);
              }}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors"
            >
              {t.settings.eraseAllConfirmBtn}
            </button>
            <button
              type="button"
              onClick={() => setConfirmErase(false)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors"
            >
              {t.settings.eraseCancelBtn}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
