import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  Square,
  Upload,
  ShieldAlert,
  AlertTriangle,
  Activity,
  AudioWaveform,
  Loader2,
} from 'lucide-react';
import type {
  AcousticFeatures,
  BabyProfile,
  Language,
  SafetyRedFlagId,
  ScreenId,
} from '../types/babycry';
import { TRANSLATIONS } from '../i18n/translations';
import { ALL_SAFETY_RED_FLAGS, calculateBabyAge, evaluateSafetyRedFlags } from '../utils/babyDomain';
import { synthesizeCryAcousticSample, type SyntheticCryPattern } from '../utils/acousticAnalysis';
import {
  buildWavResultFromSamples,
  processAudioBlobToWav,
  type DecodedAudioResult,
} from '../utils/browserAudio';

interface RecordScreenProps {
  language: Language;
  activeBaby: BabyProfile | null;
  analyzing: boolean;
  analysisError: string | null;
  onSubmitAudioForAnalysis: (payload: {
    audioBase64: string;
    mimeType: string;
    acousticFeatures: AcousticFeatures;
    contextNote?: string;
  }) => Promise<void>;
  onNavigate: (screen: ScreenId) => void;
}

export const RecordScreen: React.FC<RecordScreenProps> = ({
  language,
  activeBaby,
  analyzing,
  analysisError,
  onSubmitAudioForAnalysis,
  onNavigate,
}) => {
  const t = TRANSLATIONS[language];
  const babyAgeDays = activeBaby ? calculateBabyAge(activeBaby.birthDate).days : null;

  const [selectedFlags, setSelectedFlags] = useState<SafetyRedFlagId[]>([]);
  const [temperatureInput, setTemperatureInput] = useState('');
  const [contextNote, setContextNote] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [loadedAudio, setLoadedAudio] = useState<DecodedAudioResult | null>(null);
  const [loadedLabel, setLoadedLabel] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const parsedTemp = temperatureInput.trim() ? Number(temperatureInput.replace(',', '.')) : null;
  const safetyEval = evaluateSafetyRedFlags(selectedFlags, babyAgeDays, parsedTemp);

  const cleanupMedia = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, []);

  // Draw static idle or loaded waveform preview on canvas
  useEffect(() => {
    if (isRecording) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const preview = loadedAudio?.features.waveformPreview;
    if (preview && preview.length > 0) {
      const barWidth = w / preview.length;
      preview.forEach((amp, idx) => {
        const barH = Math.max(4, amp * (h * 0.8));
        const x = idx * barWidth + 2;
        const y = (h - barH) / 2;
        ctx.fillStyle = idx % 2 === 0 ? '#6D5DF6' : '#3B82F6';
        ctx.beginPath();
        ctx.roundRect(x, y, Math.max(2, barWidth - 4), barH, 3);
        ctx.fill();
      });
    } else {
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(16, h / 2);
      ctx.lineTo(w - 16, h / 2);
      ctx.stroke();
    }
  }, [isRecording, loadedAudio]);

  const drawLiveWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const render = () => {
      analyser.getByteTimeDomainData(data);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#6D5DF6';
      ctx.beginPath();

      const sliceWidth = w / data.length;
      let x = 0;
      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      rafRef.current = requestAnimationFrame(render);
    };
    render();
  };

  const toggleFlag = (flag: SafetyRedFlagId) => {
    setSelectedFlags((prev) =>
      prev.includes(flag) ? prev.filter((item) => item !== flag) : [...prev, flag]
    );
  };

  const startRecording = async () => {
    setMicError(null);
    setLoadedAudio(null);
    setLoadedLabel(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError(t.record.micErrorTitle);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        cleanupMedia();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        try {
          const decoded = await processAudioBlobToWav(blob);
          setLoadedAudio(decoded);
          await onSubmitAudioForAnalysis({
            audioBase64: decoded.wavBase64,
            mimeType: decoded.mimeType,
            acousticFeatures: decoded.features,
            contextNote,
          });
        } catch (err) {
          setMicError(err instanceof Error ? err.message : t.record.micErrorFallback);
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setElapsedSec(0);
      const startedAt = Date.now();
      timerRef.current = window.setInterval(() => {
        setElapsedSec((Date.now() - startedAt) / 1000);
      }, 100);
      drawLiveWaveform();
    } catch (err) {
      cleanupMedia();
      setIsRecording(false);
      setMicError(err instanceof Error ? err.message : t.record.micErrorTitle);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMicError(null);
    try {
      const decoded = await processAudioBlobToWav(file);
      setLoadedAudio(decoded);
      setLoadedLabel(file.name);
    } catch (err) {
      setMicError(err instanceof Error ? err.message : 'Unsupported audio file');
    }
  };

  const handleGenerateTestWav = (pattern: SyntheticCryPattern, label: string) => {
    setMicError(null);
    const synth = synthesizeCryAcousticSample(pattern, 16000, 4.0);
    const decoded = buildWavResultFromSamples(synth.samples, synth.sampleRate);
    setLoadedAudio(decoded);
    setLoadedLabel(label);
  };

  const handleAnalyzeLoaded = async () => {
    if (!loadedAudio || analyzing) return;
    await onSubmitAudioForAnalysis({
      audioBase64: loadedAudio.wavBase64,
      mimeType: loadedAudio.mimeType,
      acousticFeatures: loadedAudio.features,
      contextNote,
    });
  };

  if (analyzing) {
    return (
      <div
        className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto space-y-6"
        data-testid="analyzing-screen"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#F3E8FF] text-[#6D5DF6] mx-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{t.record.analyzingTitle}</h1>
        <div className="space-y-3 text-left max-w-md mx-auto">
          {[t.record.analyzingStep1, t.record.analyzingStep2, t.record.analyzingStep3].map(
            (step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl bg-[#F8FBFF] border border-slate-200/60 px-4 py-3 text-sm text-slate-700"
              >
                <Activity className="w-4 h-4 text-[#6D5DF6] shrink-0" aria-hidden="true" />
                <span>{step}</span>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.record.title}</h1>
        <p className="text-sm text-slate-600 mt-1">{t.record.subtitle}</p>
      </div>

      {/* Pediatric Safety Triage Pre-Check */}
      <section className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
              <span>{t.record.safetyCheckTitle}</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">{t.record.safetyCheckDesc}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="baby-temp-input" className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              {t.record.temperatureLabel}
            </label>
            <input
              id="baby-temp-input"
              type="number"
              step="0.1"
              min="34"
              max="43"
              value={temperatureInput}
              onChange={(e) => setTemperatureInput(e.target.value)}
              placeholder={t.record.temperaturePlaceholder}
              className="w-28 min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-mono tabular-nums"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {ALL_SAFETY_RED_FLAGS.map((flagId) => {
            const checked = selectedFlags.includes(flagId) || (flagId === 'fever_under_3m' && safetyEval.feverRuleTriggered);
            return (
              <label
                key={flagId}
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                  checked
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFlag(flagId)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs font-medium leading-snug">{t.safetyFlags[flagId].label}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Emergency Override Banner OR Recording Studio */}
      {safetyEval.isEmergency ? (
        <section
          role="alert"
          data-testid="emergency-triage-alert"
          className="rounded-3xl bg-rose-50 border-2 border-rose-300 p-6 sm:p-8 shadow-sm space-y-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-rose-950">{t.record.emergencyTitle}</h2>
              <p className="text-sm text-rose-900 leading-relaxed">{t.record.emergencyDesc}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('guides')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold transition-colors"
            >
              {t.record.emergencyActionPrimary}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedFlags([]);
                setTemperatureInput('');
              }}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-rose-100 text-rose-900 border border-rose-200 text-sm font-medium transition-colors"
            >
              {t.record.emergencyClearBtn}
            </button>
          </div>
        </section>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Main Central Microphone & Live Waveform */}
          <section className="lg:col-span-7 rounded-3xl bg-gradient-to-b from-[#EAF4FF]/60 to-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-700">
                {isRecording ? t.record.recordingStatus : t.record.readyStatus}
              </p>
              <span className="font-mono tabular-nums text-lg font-bold text-[#6D5DF6]">
                {elapsedSec.toFixed(1)}s
              </span>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200/80 p-3">
              <canvas
                ref={canvasRef}
                width={560}
                height={120}
                data-testid="waveform-canvas"
                className="w-full h-[120px] block"
              />
            </div>

            <div className="flex flex-col items-center gap-4">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-full sm:w-auto min-h-[60px] px-9 py-4 rounded-2xl bg-[#6D5DF6] hover:bg-[#5B4CE4] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-violet-500/20 flex items-center justify-center gap-3 transition-all whitespace-nowrap"
                >
                  <Mic className="w-6 h-6 shrink-0" aria-hidden="true" />
                  <span>{t.record.mainButtonStart}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-full sm:w-auto min-h-[60px] px-9 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-lg shadow-rose-500/20 flex items-center justify-center gap-3 transition-all whitespace-nowrap"
                >
                  <Square className="w-5 h-5 fill-current shrink-0" aria-hidden="true" />
                  <span>{t.record.mainButtonStop}</span>
                </button>
              )}

              {loadedAudio && (
                <div
                  className="w-full rounded-2xl bg-[#F8FBFF] border border-[#6D5DF6]/35 p-4 space-y-3"
                  data-testid="loaded-audio-card"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-900 truncate">{loadedLabel}</span>
                    <span className="font-mono tabular-nums shrink-0">
                      {loadedAudio.features.durationSec.toFixed(1)}s · {loadedAudio.features.fundamentalFreqHz} Hz · {loadedAudio.features.rmsDb} dBFS
                    </span>
                  </div>
                  <audio controls src={loadedAudio.objectUrl} className="w-full h-10" />
                  <button
                    type="button"
                    onClick={handleAnalyzeLoaded}
                    className="w-full min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6D5DF6] hover:bg-[#5B4CE4] text-white text-sm font-semibold transition-colors"
                  >
                    {t.record.analyzeLoadedBtn}
                  </button>
                </div>
              )}

              <div className="w-full space-y-1.5 pt-1">
                <label htmlFor="context-note-input" className="block text-xs font-semibold text-slate-700">
                  {t.record.contextNoteLabel}
                </label>
                <input
                  id="context-note-input"
                  type="text"
                  value={contextNote}
                  onChange={(e) => setContextNote(e.target.value)}
                  placeholder={t.record.contextNotePlaceholder}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-[#6D5DF6] focus:outline-none"
                />
              </div>
            </div>

            {micError && (
              <div role="alert" className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-950 space-y-1">
                <p className="font-semibold">{micError}</p>
                <p className="text-xs text-amber-900">{t.record.micErrorFallback}</p>
              </div>
            )}

            {analysisError && (
              <div role="alert" className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-900">
                {analysisError}
              </div>
            )}
          </section>

          {/* Upload & Real Acoustic Test WAV Panel */}
          <section className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
              <label htmlFor="audio-file-upload" className="block text-sm font-bold text-slate-900">
                {t.record.uploadLabel}
              </label>
              <p className="text-xs text-slate-500">{t.record.uploadHint}</p>
              <label
                htmlFor="audio-file-upload"
                className="min-h-[48px] px-4 py-3 rounded-xl border border-dashed border-sky-300 bg-[#EAF4FF]/40 hover:bg-[#EAF4FF] text-sky-950 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.home.uploadShortcut}</span>
              </label>
              <input
                id="audio-file-upload"
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </div>

            <div className="rounded-3xl bg-[#F3E8FF]/45 border border-violet-200/80 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <AudioWaveform className="w-5 h-5 text-[#6D5DF6]" aria-hidden="true" />
                <h2 className="text-sm font-bold text-slate-900">{t.record.testLabTitle}</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{t.record.testLabDesc}</p>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerateTestWav('hunger_rhythmic', t.record.testSampleHunger)}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white hover:bg-violet-50 border border-slate-200/80 text-left text-xs font-semibold text-slate-800 transition-colors"
                >
                  {t.record.testSampleHunger}
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateTestWav('pain_high_pitch', t.record.testSamplePain)}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white hover:bg-violet-50 border border-slate-200/80 text-left text-xs font-semibold text-slate-800 transition-colors"
                >
                  {t.record.testSamplePain}
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateTestWav('fatigue_low_groan', t.record.testSampleFatigue)}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white hover:bg-violet-50 border border-slate-200/80 text-left text-xs font-semibold text-slate-800 transition-colors"
                >
                  {t.record.testSampleFatigue}
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateTestWav('silence_room', t.record.testSampleSilence)}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white hover:bg-violet-50 border border-slate-200/80 text-left text-xs font-semibold text-slate-800 transition-colors"
                >
                  {t.record.testSampleSilence}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
