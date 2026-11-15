import React, { useState } from 'react';
import { ShieldAlert, Cpu, AudioWaveform, HeartHandshake } from 'lucide-react';
import type { Language, SoundTrait } from '../types/babycry';
import { TRANSLATIONS } from '../i18n/translations';
import { ALL_CRY_CATEGORIES, ALL_SAFETY_RED_FLAGS } from '../utils/babyDomain';

interface GuidesScreenProps {
  language: Language;
}

const ALL_TRAITS: SoundTrait[] = [
  'groaning',
  'high_pitched',
  'continuous',
  'intermittent',
  'intense',
  'weak',
  'sudden_change',
];

export const GuidesScreen: React.FC<GuidesScreenProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header + Caring Parent Illustration */}
      <section className="rounded-3xl bg-gradient-to-br from-[#F3E8FF]/65 via-white to-[#EAF4FF] border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.guides.title}</h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{t.guides.subtitle}</p>
          </div>
          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200/70 bg-white aspect-[4/3] flex items-center justify-center">
            {!imgErr ? (
              <img
                src="/src/assets/images/guide_caring_parent_1794694105953.jpg"
                alt={t.guides.title}
                referrerPolicy="no-referrer"
                onError={() => setImgErr(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <HeartHandshake className="w-12 h-12 text-[#6D5DF6]" aria-hidden="true" />
            )}
          </div>
        </div>
      </section>

      {/* Pediatric Emergency Red Flags */}
      <section className="rounded-3xl bg-rose-50/80 border border-rose-200 p-6 sm:p-7 space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-rose-950 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0" aria-hidden="true" />
            <span>{t.guides.safetySectionTitle}</span>
          </h2>
          <p className="text-sm text-rose-900">{t.guides.safetySectionDesc}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_SAFETY_RED_FLAGS.map((flagId) => (
            <div key={flagId} className="rounded-2xl bg-white border border-rose-200/80 p-4 space-y-1.5">
              <h3 className="text-sm font-bold text-rose-950">{t.safetyFlags[flagId].label}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.safetyFlags[flagId].detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 9 Cry Categories */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">{t.guides.categoriesTitle}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_CRY_CATEGORIES.map((cat) => (
            <article
              key={cat}
              className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-2.5"
            >
              <h3 className="text-base font-bold text-slate-900">{t.categories[cat].label}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.categories[cat].description}</p>
              <ul className="space-y-1 pt-2 border-t border-slate-100 text-xs text-slate-700">
                {t.categories[cat].quickTips.map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* 7 Vocal Traits + AI Architecture Guide */}
      <div className="grid lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AudioWaveform className="w-5 h-5 text-sky-600" aria-hidden="true" />
            <span>{t.guides.traitsTitle}</span>
          </h2>
          <div className="divide-y divide-slate-100">
            {ALL_TRAITS.map((trait) => (
              <div key={trait} className="py-2.5">
                <h3 className="text-sm font-semibold text-slate-900">{t.traits[trait].label}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{t.traits[trait].description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#6D5DF6]" aria-hidden="true" />
            <span>{t.guides.aiModelTitle}</span>
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">{t.guides.aiModelDesc}</p>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">{t.guides.specializedModelTitle}</h3>
            <ol className="space-y-2.5">
              {t.guides.specializedModelSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="font-mono font-bold text-[#6D5DF6] mt-0.5 shrink-0">0{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
};
