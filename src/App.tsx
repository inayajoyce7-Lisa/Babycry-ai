/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Home, Mic, History, BookOpen, Settings, Baby } from 'lucide-react';
import type {
  AcousticFeatures,
  BabyProfile,
  CryAnalysisRecord,
  CryCategory,
  FeedingType,
  Language,
  PrivacySettings,
  RetentionDays,
  ScreenId,
} from './types/babycry';
import { TRANSLATIONS } from './i18n/translations';
import { apiClient } from './utils/apiClient';
import { ConsentModal } from './components/ConsentModal';
import { HomeScreen } from './components/HomeScreen';
import { BabyProfileScreen } from './components/BabyProfileScreen';
import { RecordScreen } from './components/RecordScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { GuidesScreen } from './components/GuidesScreen';
import { SettingsScreen } from './components/SettingsScreen';

const ACTIVE_BABY_STORAGE_KEY = 'babycry_active_baby_id';

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('home');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PrivacySettings>({
    language: 'fr',
    parentalConsentAccepted: false,
    consentTimestamp: null,
    retentionDays: 30,
    allowModelImprovementDataset: false,
    encryptionAlgorithm: 'AES-256-GCM',
  });
  const [babies, setBabies] = useState<BabyProfile[]>([]);
  const [activeBabyId, setActiveBabyId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_BABY_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [analyses, setAnalyses] = useState<CryAnalysisRecord[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<CryAnalysisRecord | null>(null);
  const [datasetCount, setDatasetCount] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [autostartBypass, setAutostartBypass] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('autostart') === '1';
    } catch {
      return false;
    }
  });

  const loadAllState = useCallback(async () => {
    try {
      const [loadedSettings, loadedBabies, loadedAnalyses, stats] = await Promise.all([
        apiClient.getSettings(),
        apiClient.listBabies(),
        apiClient.listAnalyses(),
        apiClient.getDatasetStats(),
      ]);
      setSettings(loadedSettings);
      setBabies(loadedBabies);
      setAnalyses(loadedAnalyses);
      setDatasetCount(stats.totalContributions);
      setCategoryBreakdown(stats.categoryBreakdown);

      if (loadedBabies.length > 0) {
        setActiveBabyId((prev) => {
          const valid = loadedBabies.find((b) => b.id === prev);
          const nextId = valid ? valid.id : loadedBabies[0].id;
          try {
            localStorage.setItem(ACTIVE_BABY_STORAGE_KEY, nextId);
          } catch {
            // ignore storage errors
          }
          return nextId;
        });
      } else {
        setActiveBabyId(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllState();
  }, [loadAllState]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  const activeBaby = babies.find((b) => b.id === activeBabyId) || babies[0] || null;
  const t = TRANSLATIONS[settings.language];

  const handleSelectBaby = (id: string) => {
    setActiveBabyId(id);
    try {
      localStorage.setItem(ACTIVE_BABY_STORAGE_KEY, id);
    } catch {
      // ignore
    }
  };

  const handleUpdateSettings = async (
    patch: Partial<{
      language: Language;
      parentalConsentAccepted: boolean;
      retentionDays: RetentionDays;
      allowModelImprovementDataset: boolean;
    }>
  ) => {
    const updated = await apiClient.updateSettings(patch);
    setSettings(updated);
    if (patch.retentionDays !== undefined) {
      const refreshed = await apiClient.listAnalyses();
      setAnalyses(refreshed);
    }
  };

  const handleAcceptConsent = async (allowDataset: boolean) => {
    const updated = await apiClient.updateSettings({
      parentalConsentAccepted: true,
      allowModelImprovementDataset: allowDataset,
    });
    setSettings(updated);
    setAutostartBypass(false);
  };

  const handleCreateBaby = async (input: {
    name: string;
    birthDate: string;
    feedingType: FeedingType;
    notes: string;
  }) => {
    const created = await apiClient.createBaby(input);
    setBabies((prev) => [created, ...prev]);
    handleSelectBaby(created.id);
  };

  const handleUpdateBaby = async (
    id: string,
    patch: { name: string; birthDate: string; feedingType: FeedingType; notes: string }
  ) => {
    const updated = await apiClient.updateBaby(id, patch);
    setBabies((prev) => prev.map((b) => (b.id === id ? updated : b)));
  };

  const handleDeleteBaby = async (id: string) => {
    await apiClient.deleteBaby(id);
    setBabies((prev) => {
      const next = prev.filter((b) => b.id !== id);
      if (activeBabyId === id) {
        const nextId = next[0]?.id ?? null;
        setActiveBabyId(nextId);
        try {
          if (nextId) localStorage.setItem(ACTIVE_BABY_STORAGE_KEY, nextId);
          else localStorage.removeItem(ACTIVE_BABY_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  const handleSubmitAudioForAnalysis = async (payload: {
    audioBase64: string;
    mimeType: string;
    acousticFeatures: AcousticFeatures;
    contextNote?: string;
  }) => {
    setAnalyzing(true);
    setAnalysisError(null);
    setScreen('analyzing');
    try {
      const result = await apiClient.analyzeCry({
        ...payload,
        babyId: activeBaby?.id ?? null,
        language: settings.language,
      });
      setSelectedAnalysis(result);
      if (settings.retentionDays > 0) {
        setAnalyses((prev) => [result, ...prev]);
      }
      setScreen('results');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setAnalysisError(message);
      setScreen('record');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmitFeedback = async (
    id: string,
    feedback: { confirmedCategory?: CryCategory; helpful: boolean; notes?: string }
  ) => {
    const updated = await apiClient.submitFeedback(id, feedback);
    setSelectedAnalysis(updated);
    setAnalyses((prev) => prev.map((item) => (item.id === id ? updated : item)));
    const stats = await apiClient.getDatasetStats();
    setDatasetCount(stats.totalContributions);
    setCategoryBreakdown(stats.categoryBreakdown);
  };

  const handleDeleteAnalysis = async (id: string) => {
    await apiClient.deleteAnalysis(id);
    setAnalyses((prev) => prev.filter((item) => item.id !== id));
    if (selectedAnalysis?.id === id) {
      setSelectedAnalysis(null);
    }
  };

  const handleEraseAll = async () => {
    await apiClient.eraseAllData();
    setBabies([]);
    setAnalyses([]);
    setSelectedAnalysis(null);
    setActiveBabyId(null);
    setDatasetCount(0);
    setCategoryBreakdown({});
    try {
      localStorage.removeItem(ACTIVE_BABY_STORAGE_KEY);
    } catch {
      // ignore
    }
    const refreshedSettings = await apiClient.getSettings();
    setSettings(refreshedSettings);
    setScreen('home');
  };

  const navItems: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'record', label: t.nav.record, icon: Mic },
    { id: 'history', label: t.nav.history, icon: History },
    { id: 'guides', label: t.nav.guides, icon: BookOpen },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const isNavActive = (id: ScreenId) => {
    if (id === 'record' && (screen === 'analyzing' || screen === 'results')) return true;
    return screen === id;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FBFF] text-slate-900">
      {/* Desktop 3-Zone Top Bar (strictly 1-line brand, 5 links, 1 primary action) */}
      <header className="hidden md:block sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => setScreen('home')}
            className="font-display text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            {t.brandName}
          </button>

          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600" aria-label="Main">
            {navItems.map((item) => {
              const active = isNavActive(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScreen(item.id)}
                  className={`min-h-[40px] px-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    active
                      ? 'text-[#6D5DF6] border-[#6D5DF6] font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setScreen('profile')}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#EAF4FF] hover:bg-sky-100 text-sky-950 text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <Baby className="w-4 h-4 text-[#6D5DF6]" aria-hidden="true" />
              <span>{activeBaby ? activeBaby.name : t.nav.profile}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Compact Sticky Header (52px) */}
      <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-[52px] px-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setScreen('home')}
          className="font-display text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          {t.brandName}
        </button>

        <button
          type="button"
          onClick={() => setScreen('profile')}
          className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#EAF4FF] text-sky-950 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Baby className="w-3.5 h-3.5 text-[#6D5DF6]" aria-hidden="true" />
          <span className="max-w-[110px] truncate">{activeBaby ? activeBaby.name : t.nav.profile}</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">BABYCRY AI...</div>
        ) : (
          <>
            {screen === 'home' && (
              <HomeScreen
                language={settings.language}
                activeBaby={activeBaby}
                latestAnalysis={analyses[0] ?? null}
                onNavigate={setScreen}
                onSelectAnalysis={(rec) => {
                  setSelectedAnalysis(rec);
                  setScreen('results');
                }}
              />
            )}

            {screen === 'profile' && (
              <BabyProfileScreen
                language={settings.language}
                babies={babies}
                activeBabyId={activeBaby?.id ?? null}
                onSelectBaby={handleSelectBaby}
                onCreateBaby={handleCreateBaby}
                onUpdateBaby={handleUpdateBaby}
                onDeleteBaby={handleDeleteBaby}
              />
            )}

            {(screen === 'record' || screen === 'analyzing') && (
              <RecordScreen
                language={settings.language}
                activeBaby={activeBaby}
                analyzing={analyzing || screen === 'analyzing'}
                analysisError={analysisError}
                onSubmitAudioForAnalysis={handleSubmitAudioForAnalysis}
                onNavigate={setScreen}
              />
            )}

            {screen === 'results' && (
              <ResultsScreen
                language={settings.language}
                record={selectedAnalysis}
                allAnalyses={analyses}
                categoryBreakdown={categoryBreakdown}
                allowDatasetContribution={settings.allowModelImprovementDataset}
                onEnableDatasetContribution={() =>
                  handleUpdateSettings({ allowModelImprovementDataset: true })
                }
                onSubmitFeedback={handleSubmitFeedback}
                onNavigate={setScreen}
              />
            )}

            {screen === 'history' && (
              <HistoryScreen
                language={settings.language}
                babies={babies}
                analyses={analyses}
                onSelectAnalysis={(rec) => {
                  setSelectedAnalysis(rec);
                  setScreen('results');
                }}
                onDeleteAnalysis={handleDeleteAnalysis}
                onNavigate={setScreen}
              />
            )}

            {screen === 'guides' && <GuidesScreen language={settings.language} />}

            {screen === 'settings' && (
              <SettingsScreen
                settings={settings}
                datasetContributionsCount={datasetCount}
                onUpdateSettings={handleUpdateSettings}
                onEraseAllData={handleEraseAll}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Fixed Thumb-Zone Bottom Tab Bar (64px) */}
      <nav
        aria-label="Mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-safe"
      >
        <div className="grid grid-cols-5 items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? 'text-[#6D5DF6]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Explicit Parental Consent Modal */}
      {!loading && !settings.parentalConsentAccepted && !autostartBypass && (
        <ConsentModal
          language={settings.language}
          onLanguageChange={(lang) => handleUpdateSettings({ language: lang })}
          onAccept={handleAcceptConsent}
          onOpenPolicy={() => {
            setAutostartBypass(true);
            setScreen('settings');
          }}
        />
      )}
    </div>
  );
}
