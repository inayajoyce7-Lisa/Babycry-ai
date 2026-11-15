import type {
  AcousticFeatures,
  BabyProfile,
  CryAnalysisRecord,
  CryCategory,
  FeedingType,
  Language,
  PrivacySettings,
  RetentionDays,
} from '../types/babycry';

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
  }
  return data as T;
}

export const apiClient = {
  getHealth: () =>
    requestJson<{
      status: string;
      geminiConfigured: boolean;
      specializedClassifierConfigured: boolean;
    }>('/api/health'),

  getSettings: () => requestJson<PrivacySettings>('/api/settings'),

  updateSettings: (
    patch: Partial<{
      language: Language;
      parentalConsentAccepted: boolean;
      retentionDays: RetentionDays;
      allowModelImprovementDataset: boolean;
    }>
  ) =>
    requestJson<PrivacySettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  listBabies: () => requestJson<BabyProfile[]>('/api/babies'),

  createBaby: (input: {
    name: string;
    birthDate: string;
    feedingType: FeedingType;
    notes: string;
  }) =>
    requestJson<BabyProfile>('/api/babies', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateBaby: (
    id: string,
    patch: Partial<{ name: string; birthDate: string; feedingType: FeedingType; notes: string }>
  ) =>
    requestJson<BabyProfile>(`/api/babies/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  deleteBaby: (id: string) =>
    requestJson<{ deleted: boolean }>(`/api/babies/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  analyzeCry: (payload: {
    audioBase64: string;
    mimeType: string;
    acousticFeatures: AcousticFeatures;
    babyId: string | null;
    language: Language;
    contextNote?: string;
  }) =>
    requestJson<CryAnalysisRecord>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listAnalyses: (babyId?: string) =>
    requestJson<CryAnalysisRecord[]>(
      babyId ? `/api/analyses?babyId=${encodeURIComponent(babyId)}` : '/api/analyses'
    ),

  submitFeedback: (
    id: string,
    feedback: { confirmedCategory?: CryCategory; helpful: boolean; notes?: string }
  ) =>
    requestJson<CryAnalysisRecord>(`/api/analyses/${encodeURIComponent(id)}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    }),

  deleteAnalysis: (id: string) =>
    requestJson<{ deleted: boolean }>(`/api/analyses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  eraseAllData: () =>
    requestJson<{ erased: boolean }>('/api/privacy/erase-all', {
      method: 'DELETE',
    }),

  getDatasetStats: () =>
    requestJson<{ totalContributions: number; categoryBreakdown: Record<string, number> }>(
      '/api/dataset/stats'
    ),
};
