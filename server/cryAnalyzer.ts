import { GoogleGenAI, Type } from '@google/genai';
import type {
  AcousticFeatures,
  BabyProfile,
  CryCategory,
  CryHypothesis,
  Language,
  SoundTrait,
} from '../src/types/babycry.ts';
import {
  classifyAcousticHeuristics,
  inferObservedTraitsFromDsp,
} from '../src/utils/acousticAnalysis.ts';
import { calculateBabyAge, formatBabyAge } from '../src/utils/babyDomain.ts';

export interface CryAnalysisInput {
  audioBase64: string;
  mimeType: string;
  acousticFeatures: AcousticFeatures;
  baby: BabyProfile | null;
  language: Language;
  contextNote?: string;
}

export interface CryAnalysisOutput {
  primaryHypothesis: CryHypothesis;
  secondaryHypotheses: CryHypothesis[];
  confidence: number;
  observedTraits: SoundTrait[];
  acousticSummary: string;
  simpleExplanation: string;
  practicalTips: string[];
  safetyReminders: string[];
  isInconclusive: boolean;
  modelSource: string;
}

interface SpecializedModelPrediction {
  predictions: Array<{ category: CryCategory; confidence: number }>;
  modelName: string;
}

const VALID_CATEGORIES = new Set<CryCategory>([
  'hunger',
  'fatigue',
  'discomfort',
  'diaper',
  'gas_colic',
  'comfort_holding',
  'pain',
  'temperature',
  'unusual',
]);

const VALID_TRAITS = new Set<SoundTrait>([
  'groaning',
  'high_pitched',
  'continuous',
  'intermittent',
  'intense',
  'weak',
  'sudden_change',
]);

/**
 * Optional adapter hook for an external specialized infant cry classification model
 * (e.g., ONNX/TFLite/Vertex AI endpoint trained on validated datasets such as Donate-a-Cry or BabyChillanto).
 */
async function callSpecializedClassifierIfConfigured(
  audioBase64: string,
  mimeType: string,
  features: AcousticFeatures
): Promise<SpecializedModelPrediction | null> {
  const endpoint = process.env.CRY_CLASSIFIER_ENDPOINT?.trim();
  if (!endpoint) return null;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType, acousticFeatures: features }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SpecializedModelPrediction;
    if (!Array.isArray(data.predictions) || data.predictions.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

function getLanguageName(lang: Language): string {
  if (lang === 'fr') return 'French (français)';
  if (lang === 'ht') return 'Haitian Creole (Kreyòl Ayisyen)';
  return 'English';
}

export async function analyzeCryWithGoogleAI(input: CryAnalysisInput): Promise<CryAnalysisOutput> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please configure your Gemini API key in Settings > Secrets.'
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const babyAge = input.baby ? calculateBabyAge(input.baby.birthDate) : null;
  const ageFormatted = babyAge ? formatBabyAge(babyAge, input.language) : 'unknown age';
  const dspTraits = inferObservedTraitsFromDsp(input.acousticFeatures);
  const dspHeuristics = classifyAcousticHeuristics(input.acousticFeatures);
  const specializedModel = await callSpecializedClassifierIfConfigured(
    input.audioBase64,
    input.mimeType,
    input.acousticFeatures
  );

  const targetLanguage = getLanguageName(input.language);

  const systemInstruction = `You are an expert pediatric acoustic analysis assistant for BABYCRY AI.
Your task is to analyze the provided baby audio recording alongside objective DSP acoustic measurements and return calm, practical, parent-friendly hypotheses.

STRICT CLINICAL, SAFETY & HONESTY RULES:
1. NEVER claim certainty or make a medical diagnosis. Frame every cause strictly as an acoustic hypothesis ("possible", "probable") with an honest confidence score (0-100).
2. NEVER state that a baby is healthy solely based on their cry.
3. ALWAYS evaluate whether an actual infant cry or vocalization is audible in the audio AND supported by DSP features (isCryDetected=${input.acousticFeatures.isCryDetected}). If the audio is silent, background noise only, or adult speech with no baby cry, set isInconclusive=true, primaryCategory="unusual", confidence <= 35, and clearly explain that no clear baby cry was detected so the parent can record closer to the baby.
4. Do NOT fabricate capabilities. Explain results in clear, warm, reassuring ${targetLanguage}.
5. Adapt practicalTips specifically to the baby's age (${ageFormatted}, ${babyAge ? `${babyAge.days} days` : 'unspecified'}) and feeding context (${input.baby?.feedingType ?? 'unspecified'}).
6. Include concise safetyReminders noting that BabyCry AI never replaces a pediatrician and reminding parents of urgent warning signs (trouble breathing, bluish lips/skin, unusual lethargy, or fever >= 38°C in infants under 3 months).
7. Allowed categories ONLY: hunger, fatigue, discomfort, diaper, gas_colic, comfort_holding, pain, temperature, unusual.
8. Allowed observedTraits ONLY: groaning, high_pitched, continuous, intermittent, intense, weak, sudden_change.
9. All human-readable text fields (rationale, acousticSummary, simpleExplanation, practicalTips, safetyReminders) MUST be written in ${targetLanguage}.`;

  const metadataPrompt = `Analyze this baby audio recording for parent understanding.

Baby Context:
- Name/Nickname: ${input.baby?.name ?? 'Baby'}
- Age: ${ageFormatted} (${babyAge ? `${babyAge.days} days, stage=${babyAge.stage}` : 'age not specified'})
- Feeding type: ${input.baby?.feedingType ?? 'unspecified'}
- Parent notes: ${input.baby?.notes ? input.baby.notes : 'none'}
- Additional situational context: ${input.contextNote?.trim() || 'none'}

Extracted Acoustic DSP Measurements:
- Duration: ${input.acousticFeatures.durationSec}s
- Cry detected by DSP VAD: ${input.acousticFeatures.isCryDetected}
- Fundamental frequency (median f0): ${input.acousticFeatures.fundamentalFreqHz} Hz (range ${input.acousticFeatures.freqMinHz}-${input.acousticFeatures.freqMaxHz} Hz)
- Spectral centroid: ${input.acousticFeatures.spectralCentroidHz} Hz
- RMS loudness: ${input.acousticFeatures.rmsDb} dBFS (Peak: ${input.acousticFeatures.peakDb} dBFS)
- Cry bursts: ${input.acousticFeatures.cryBurstCount}, Pause ratio: ${input.acousticFeatures.pauseRatio}, Active ratio: ${input.acousticFeatures.cryActivityRatio}
- Sudden intensity shift detected: ${input.acousticFeatures.suddenShiftDetected}
- DSP-derived traits: ${dspTraits.join(', ') || 'none'}
- DSP baseline acoustic ranking: ${JSON.stringify(dspHeuristics)}
${specializedModel ? `- External Specialized Cry Model (${specializedModel.modelName}) output: ${JSON.stringify(specializedModel.predictions)}` : '- External Specialized Cry Model: not connected (using Google AI Multimodal Audio + Acoustic DSP)'}

Respond with JSON matching the schema in ${targetLanguage}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: input.mimeType || 'audio/wav',
            data: input.audioBase64,
          },
        },
        { text: metadataPrompt },
      ],
    },
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isInconclusive: { type: Type.BOOLEAN },
          primaryCategory: { type: Type.STRING },
          primaryConfidence: { type: Type.INTEGER },
          primaryRationale: { type: Type.STRING },
          secondaryHypotheses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                confidence: { type: Type.INTEGER },
                rationale: { type: Type.STRING },
              },
              required: ['category', 'confidence', 'rationale'],
            },
          },
          observedTraits: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          acousticSummary: { type: Type.STRING },
          simpleExplanation: { type: Type.STRING },
          practicalTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          safetyReminders: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          'isInconclusive',
          'primaryCategory',
          'primaryConfidence',
          'primaryRationale',
          'secondaryHypotheses',
          'observedTraits',
          'acousticSummary',
          'simpleExplanation',
          'practicalTips',
          'safetyReminders',
        ],
      },
    },
  });

  const rawText = (response.text ?? '').trim();
  if (!rawText) {
    throw new Error('Empty response received from Google AI audio analysis model.');
  }

  const parsed = JSON.parse(rawText) as {
    isInconclusive: boolean;
    primaryCategory: string;
    primaryConfidence: number;
    primaryRationale: string;
    secondaryHypotheses: Array<{ category: string; confidence: number; rationale: string }>;
    observedTraits: string[];
    acousticSummary: string;
    simpleExplanation: string;
    practicalTips: string[];
    safetyReminders: string[];
  };

  const primaryCat: CryCategory = VALID_CATEGORIES.has(parsed.primaryCategory as CryCategory)
    ? (parsed.primaryCategory as CryCategory)
    : 'unusual';

  const clampedConfidence = Math.max(15, Math.min(92, Math.round(parsed.primaryConfidence || 50)));

  const secondary: CryHypothesis[] = (parsed.secondaryHypotheses || [])
    .slice(0, 3)
    .map((h) => ({
      category: VALID_CATEGORIES.has(h.category as CryCategory)
        ? (h.category as CryCategory)
        : 'comfort_holding',
      confidence: Math.max(10, Math.min(clampedConfidence - 5, Math.round(h.confidence || 30))),
      rationale: h.rationale || '',
    }));

  const mergedTraits = Array.from(
    new Set<SoundTrait>([
      ...dspTraits,
      ...(parsed.observedTraits || []).filter((t): t is SoundTrait =>
        VALID_TRAITS.has(t as SoundTrait)
      ),
    ])
  );

  return {
    primaryHypothesis: {
      category: primaryCat,
      confidence: clampedConfidence,
      rationale: parsed.primaryRationale,
    },
    secondaryHypotheses: secondary,
    confidence: clampedConfidence,
    observedTraits: mergedTraits,
    acousticSummary: parsed.acousticSummary,
    simpleExplanation: parsed.simpleExplanation,
    practicalTips: (parsed.practicalTips || []).slice(0, 5),
    safetyReminders: (parsed.safetyReminders || []).slice(0, 3),
    isInconclusive: Boolean(parsed.isInconclusive) || !input.acousticFeatures.isCryDetected,
    modelSource: specializedModel
      ? `${specializedModel.modelName} + Google AI (gemini-4-hydrogen)`
      : 'Google AI (gemini-4-hydrogen) + Acoustic DSP',
  };
}
