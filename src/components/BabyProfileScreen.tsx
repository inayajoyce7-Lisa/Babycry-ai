import React, { useState } from 'react';
import { Baby, Check, Plus, Trash2 } from 'lucide-react';
import type { BabyProfile, FeedingType, Language } from '../types/babycry';
import { TRANSLATIONS } from '../i18n/translations';
import { calculateBabyAge, formatBabyAge, getAgeAdaptedTipFocus } from '../utils/babyDomain';

interface BabyProfileScreenProps {
  language: Language;
  babies: BabyProfile[];
  activeBabyId: string | null;
  onSelectBaby: (id: string) => void;
  onCreateBaby: (input: {
    name: string;
    birthDate: string;
    feedingType: FeedingType;
    notes: string;
  }) => Promise<void>;
  onUpdateBaby: (
    id: string,
    patch: { name: string; birthDate: string; feedingType: FeedingType; notes: string }
  ) => Promise<void>;
  onDeleteBaby: (id: string) => Promise<void>;
}

export const BabyProfileScreen: React.FC<BabyProfileScreenProps> = ({
  language,
  babies,
  activeBabyId,
  onSelectBaby,
  onCreateBaby,
  onUpdateBaby,
  onDeleteBaby,
}) => {
  const t = TRANSLATIONS[language];
  const initialActive = babies.find((b) => b.id === activeBabyId) || babies[0] || null;

  const [editingId, setEditingId] = useState<string | 'new'>(initialActive ? initialActive.id : 'new');
  const [name, setName] = useState(initialActive?.name ?? '');
  const [birthDate, setBirthDate] = useState(initialActive?.birthDate ?? '');
  const [feedingType, setFeedingType] = useState<FeedingType>(initialActive?.feedingType ?? 'mixed');
  const [notes, setNotes] = useState(initialActive?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadForEdit = (baby: BabyProfile) => {
    setEditingId(baby.id);
    setName(baby.name);
    setBirthDate(baby.birthDate);
    setFeedingType(baby.feedingType);
    setNotes(baby.notes);
    setError(null);
    setSavedNotice(null);
  };

  const startNew = () => {
    setEditingId('new');
    setName('');
    setBirthDate('');
    setFeedingType('mixed');
    setNotes('');
    setError(null);
    setSavedNotice(null);
  };

  const previewAge = birthDate ? calculateBabyAge(birthDate) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedNotice(null);

    if (!name.trim()) {
      setError(t.profile.validationName);
      return;
    }
    if (!birthDate || Number.isNaN(new Date(`${birthDate}T00:00:00`).getTime())) {
      setError(t.profile.validationDate);
      return;
    }

    setSaving(true);
    try {
      if (editingId === 'new') {
        await onCreateBaby({ name: name.trim(), birthDate, feedingType, notes });
      } else {
        await onUpdateBaby(editingId, { name: name.trim(), birthDate, feedingType, notes });
      }
      setSavedNotice(t.profile.savedToast);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.profile.title}</h1>
          <p className="text-sm text-slate-600 mt-1">{t.profile.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#EAF4FF] hover:bg-sky-100 text-sky-900 text-sm font-semibold inline-flex items-center gap-2 transition-colors self-start whitespace-nowrap"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>{t.profile.addNew}</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Existing profiles list */}
        <div className="lg:col-span-5 space-y-3">
          {babies.map((baby) => {
            const age = calculateBabyAge(baby.birthDate);
            const isSelected = baby.id === activeBabyId;
            return (
              <div
                key={baby.id}
                className={`rounded-2xl p-4 border transition-colors bg-white ${
                  isSelected ? 'border-[#6D5DF6] shadow-sm' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Baby className="w-4 h-4 text-[#6D5DF6]" aria-hidden="true" />
                      <h2 className="font-bold text-slate-900">{baby.name}</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 tabular-nums">
                      {formatBabyAge(age, language)} · {t.feedingTypes[baby.feedingType]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBaby(baby.id);
                        loadForEdit(baby);
                      }}
                      className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#6D5DF6] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isSelected ? t.profile.activeTag : t.profile.selectCta}
                    </button>
                    <button
                      type="button"
                      aria-label={`${t.profile.deleteCta} ${baby.name}`}
                      onClick={() => onDeleteBaby(baby.id)}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Profile Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="baby-name-input" className="block text-sm font-semibold text-slate-800">
                {t.profile.nameLabel}
              </label>
              <input
                id="baby-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.profile.namePlaceholder}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#6D5DF6] focus:outline-none text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="baby-birth-input" className="block text-sm font-semibold text-slate-800">
                {t.profile.birthDateLabel}
              </label>
              <input
                id="baby-birth-input"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#6D5DF6] focus:outline-none text-sm"
              />
            </div>
          </div>

          {previewAge && (
            <div className="rounded-2xl bg-[#EAF4FF]/70 border border-sky-200/70 p-4 space-y-1">
              <p className="text-xs font-semibold text-sky-900">
                {t.profile.ageLabel}: <span className="tabular-nums">{formatBabyAge(previewAge, language)}</span>
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                {getAgeAdaptedTipFocus(previewAge.stage, language)}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="baby-feeding-select" className="block text-sm font-semibold text-slate-800">
              {t.profile.feedingLabel}
            </label>
            <select
              id="baby-feeding-select"
              value={feedingType}
              onChange={(e) => setFeedingType(e.target.value as FeedingType)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#6D5DF6] focus:outline-none text-sm"
            >
              {(['breastfeeding', 'formula', 'mixed', 'solids'] as FeedingType[]).map((ft) => (
                <option key={ft} value={ft}>
                  {t.feedingTypes[ft]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="baby-notes-input" className="block text-sm font-semibold text-slate-800">
              {t.profile.notesLabel}
            </label>
            <textarea
              id="baby-notes-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.profile.notesPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#6D5DF6] focus:outline-none text-sm"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
          {savedNotice && (
            <p role="status" className="text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{savedNotice}</span>
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#6D5DF6] hover:bg-[#5B4CE4] text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {t.profile.saveCta}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
