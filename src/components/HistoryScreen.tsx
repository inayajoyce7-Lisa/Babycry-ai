import React, { useMemo, useState } from 'react';
import { Clock, Play, Pause, Trash2, ArrowRight, Mic } from 'lucide-react';
import type { BabyProfile, CryAnalysisRecord, CryCategory, Language, ScreenId } from '../types/babycry';
import { TRANSLATIONS } from '../i18n/translations';
import { ALL_CRY_CATEGORIES } from '../utils/babyDomain';

interface HistoryScreenProps {
  language: Language;
  babies: BabyProfile[];
  analyses: CryAnalysisRecord[];
  onSelectAnalysis: (record: CryAnalysisRecord) => void;
  onDeleteAnalysis: (id: string) => Promise<void>;
  onNavigate: (screen: ScreenId) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  language,
  babies,
  analyses,
  onSelectAnalysis,
  onDeleteAnalysis,
  onNavigate,
}) => {
  const t = TRANSLATIONS[language];
  const [babyFilter, setBabyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [emptyImgErr, setEmptyImgErr] = useState(false);

  const filtered = useMemo(() => {
    return analyses.filter((item) => {
      if (babyFilter !== 'all' && item.babyId !== babyFilter) return false;
      if (categoryFilter !== 'all' && item.primaryHypothesis.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [analyses, babyFilter, categoryFilter]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<CryCategory, number>();
    filtered.forEach((rec) => {
      const c = rec.primaryHypothesis.category;
      counts.set(c, (counts.get(c) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const timelinePoints = useMemo(() => {
    const slice = [...filtered].slice(0, 12).reverse();
    return slice;
  }, [filtered]);

  const handleTogglePlay = (id: string) => {
    if (playingId === id && audioEl) {
      audioEl.pause();
      setPlayingId(null);
      return;
    }
    if (audioEl) {
      audioEl.pause();
    }
    const nextAudio = new Audio(`/api/analyses/${encodeURIComponent(id)}/audio`);
    nextAudio.onended = () => setPlayingId(null);
    nextAudio.onerror = () => setPlayingId(null);
    nextAudio.play().catch(() => setPlayingId(null));
    setAudioEl(nextAudio);
    setPlayingId(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.history.title}</h1>
          <p className="text-sm text-slate-600 mt-1">{t.history.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label={t.history.filterAllBabies}
            value={babyFilter}
            onChange={(e) => setBabyFilter(e.target.value)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm"
          >
            <option value="all">{t.history.filterAllBabies}</option>
            {babies.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            aria-label={t.history.filterAllCategories}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm"
          >
            <option value="all">{t.history.filterAllCategories}</option>
            {ALL_CRY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t.categories[cat].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <section className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-10 shadow-sm text-center max-w-xl mx-auto space-y-5">
          <div className="w-56 mx-auto rounded-2xl overflow-hidden aspect-[4/3] bg-[#EAF4FF]/40 flex items-center justify-center">
            {!emptyImgErr ? (
              <img
                src="/src/assets/images/empty_history_calm_1794694105895.jpg"
                alt={t.history.emptyTitle}
                referrerPolicy="no-referrer"
                onError={() => setEmptyImgErr(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <Mic className="w-10 h-10 text-[#6D5DF6]" aria-hidden="true" />
            )}
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900">{t.history.emptyTitle}</h2>
            <p className="text-sm text-slate-600">{t.history.emptyDesc}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('record')}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#6D5DF6] hover:bg-[#5B4CE4] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Mic className="w-4 h-4" aria-hidden="true" />
            <span>{t.history.emptyCta}</span>
          </button>
        </section>
      ) : (
        <>
          {/* Sound Evolution Chart + Category Breakdown */}
          <div className="grid lg:grid-cols-12 gap-6">
            <section className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">{t.history.evolutionTitle}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{t.history.evolutionDesc}</p>
              </div>

              <div className="w-full overflow-x-auto">
                <svg
                  viewBox="0 0 540 160"
                  className="w-full h-40 min-w-[320px]"
                  role="img"
                  aria-label={t.history.evolutionTitle}
                >
                  <line x1="36" y1="20" x2="520" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="36" y1="75" x2="520" y2="75" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="36" y1="130" x2="520" y2="130" stroke="#CBD5E1" />
                  <text x="6" y="24" fontSize="10" fill="#64748B">
                    800Hz
                  </text>
                  <text x="6" y="79" fontSize="10" fill="#64748B">
                    450Hz
                  </text>
                  <text x="6" y="134" fontSize="10" fill="#64748B">
                    150Hz
                  </text>

                  {timelinePoints.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#6D5DF6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={timelinePoints
                        .map((pt, idx) => {
                          const x = 48 + (idx * 450) / Math.max(1, timelinePoints.length - 1);
                          const freq = Math.max(150, Math.min(800, pt.acousticFeatures.fundamentalFreqHz || 350));
                          const y = 130 - ((freq - 150) / 650) * 110;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  )}

                  {timelinePoints.map((pt, idx) => {
                    const x =
                      timelinePoints.length === 1
                        ? 270
                        : 48 + (idx * 450) / Math.max(1, timelinePoints.length - 1);
                    const freq = Math.max(150, Math.min(800, pt.acousticFeatures.fundamentalFreqHz || 350));
                    const y = 130 - ((freq - 150) / 650) * 110;
                    return (
                      <g key={pt.id}>
                        <circle cx={x} cy={y} r="5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                        <text x={x} y="150" fontSize="9" textAnchor="middle" fill="#64748B">
                          {new Date(pt.createdAt).toLocaleTimeString(
                            language === 'fr' ? 'fr-FR' : 'en-US',
                            { hour: '2-digit', minute: '2-digit' }
                          )}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </section>

            <section className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">{t.history.categoryDistributionTitle}</h2>
              <div className="space-y-3">
                {categoryCounts.map(([cat, count]) => {
                  const pct = Math.round((count / filtered.length) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{t.categories[cat].label}</span>
                        <span className="font-mono tabular-nums text-slate-500">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#6D5DF6]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Recordings List */}
          <section className="rounded-3xl bg-white border border-slate-200/80 shadow-sm divide-y divide-slate-100">
            {filtered.map((item) => {
              const isPlaying = playingId === item.id;
              const confirming = confirmDeleteId === item.id;
              return (
                <div
                  key={item.id}
                  data-testid="history-item"
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{item.babyName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {new Date(item.createdAt).toLocaleString(
                          language === 'fr' ? 'fr-FR' : 'en-US',
                          { dateStyle: 'medium', timeStyle: 'short' }
                        )}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {item.durationSec.toFixed(1)}s
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {item.acousticFeatures.fundamentalFreqHz} Hz
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <h3 className="text-base font-bold text-slate-900">
                        {t.categories[item.primaryHypothesis.category].label}
                      </h3>
                      <span className="text-sm font-mono tabular-nums font-bold text-[#6D5DF6]">
                        {item.confidence}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1">{item.simpleExplanation}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {item.hasAudioBlob && (
                      <button
                        type="button"
                        onClick={() => handleTogglePlay(item.id)}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#EAF4FF] hover:bg-sky-100 text-sky-900 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <Play className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        <span>{isPlaying ? t.history.pauseBtn : t.history.playBtn}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectAnalysis(item)}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#F3E8FF] hover:bg-violet-200/70 text-violet-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>{t.history.inspectBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    {!confirming ? (
                      <button
                        type="button"
                        aria-label={`${t.history.deleteBtn} ${t.categories[item.primaryHypothesis.category].label}`}
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="min-h-[40px] min-w-[40px] px-3 py-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                        <span>{t.history.deleteBtn}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeleteAnalysis(item.id);
                            setConfirmDeleteId(null);
                          }}
                          className="min-h-[40px] px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                        >
                          {t.settings.eraseAllConfirmBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-[40px] px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                        >
                          {t.profile.cancelCta}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
};
