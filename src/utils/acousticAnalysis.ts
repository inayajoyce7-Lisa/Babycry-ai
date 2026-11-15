import type { AcousticFeatures, CryCategory, CryHypothesis, SoundTrait } from '../types/babycry';

export type SyntheticCryPattern = 'hunger_rhythmic' | 'pain_high_pitch' | 'fatigue_low_groan' | 'silence_room';

/**
 * Pure DSP acoustic feature extraction over mono Float32 PCM samples.
 * Extracts real RMS loudness (dBFS), peak amplitude, autocorrelation fundamental frequency (f0),
 * spectral centroid approximation, zero-crossing rate, cry burst segmentation, and sudden shift detection.
 */
export function extractAcousticFeatures(samples: Float32Array, sampleRate: number): AcousticFeatures {
  const safeSampleRate = sampleRate > 0 ? sampleRate : 16000;
  const totalSamples = samples.length;
  const durationSec = Number((totalSamples / safeSampleRate).toFixed(2));

  if (totalSamples === 0) {
    return {
      durationSec: 0,
      rmsDb: -90,
      peakDb: -90,
      fundamentalFreqHz: 0,
      freqMinHz: 0,
      freqMaxHz: 0,
      spectralCentroidHz: 0,
      zeroCrossingRate: 0,
      cryBurstCount: 0,
      pauseRatio: 1,
      intensityVariance: 0,
      suddenShiftDetected: false,
      cryActivityRatio: 0,
      isCryDetected: false,
      waveformPreview: new Array(48).fill(0),
    };
  }

  let sumSq = 0;
  let peak = 0;
  let zeroCrossings = 0;

  for (let i = 0; i < totalSamples; i++) {
    const v = samples[i];
    sumSq += v * v;
    const absV = Math.abs(v);
    if (absV > peak) peak = absV;
    if (i > 0 && ((samples[i - 1] >= 0 && v < 0) || (samples[i - 1] < 0 && v >= 0))) {
      zeroCrossings++;
    }
  }

  const rms = Math.sqrt(sumSq / totalSamples);
  const rmsDb = Number((20 * Math.log10(Math.max(rms, 1e-5))).toFixed(1));
  const peakDb = Number((20 * Math.log10(Math.max(peak, 1e-5))).toFixed(1));
  const zeroCrossingRate = Number((zeroCrossings / totalSamples).toFixed(4));

  // Frame analysis (50ms windows, 25ms hop)
  const frameSize = Math.max(256, Math.floor(safeSampleRate * 0.05));
  const hopSize = Math.max(128, Math.floor(safeSampleRate * 0.025));
  const frameRmsList: number[] = [];
  const frameF0List: number[] = [];
  const frameZcrList: number[] = [];

  const minLag = Math.max(8, Math.floor(safeSampleRate / 950)); // up to 950 Hz infant cry
  const maxLag = Math.min(frameSize - 1, Math.floor(safeSampleRate / 180)); // down to 180 Hz

  for (let start = 0; start + frameSize <= totalSamples; start += hopSize) {
    let fSum = 0;
    let fZc = 0;
    for (let i = 0; i < frameSize; i++) {
      const s = samples[start + i];
      fSum += s * s;
      if (i > 0 && ((samples[start + i - 1] >= 0 && s < 0) || (samples[start + i - 1] < 0 && s >= 0))) {
        fZc++;
      }
    }
    const fRms = Math.sqrt(fSum / frameSize);
    frameRmsList.push(fRms);
    frameZcrList.push(fZc / frameSize);

    // Estimate fundamental frequency only on active voiced frames (normalized autocorrelation + octave-error prevention)
    if (fRms > 0.015 && maxLag > minLag) {
      const corrByLag = new Float32Array(maxLag + 1);
      let globalMaxCorr = 0;

      for (let lag = minLag; lag <= maxLag; lag++) {
        let corr = 0;
        let energyA = 0;
        let energyB = 0;
        const count = frameSize - lag;
        for (let i = 0; i < count; i++) {
          const a = samples[start + i];
          const b = samples[start + i + lag];
          corr += a * b;
          energyA += a * a;
          energyB += b * b;
        }
        const denom = Math.sqrt(energyA * energyB);
        const normCorr = denom > 1e-8 ? corr / denom : 0;
        corrByLag[lag] = normCorr;
        if (normCorr > globalMaxCorr) {
          globalMaxCorr = normCorr;
        }
      }

      if (globalMaxCorr > 0.45) {
        // Pick the smallest lag (highest frequency) whose local peak is >= 95% of globalMaxCorr
        const peakThreshold = globalMaxCorr * 0.95;
        let chosenLag = 0;
        for (let lag = minLag + 1; lag < maxLag; lag++) {
          if (
            corrByLag[lag] >= peakThreshold &&
            corrByLag[lag] >= corrByLag[lag - 1] &&
            corrByLag[lag] >= corrByLag[lag + 1]
          ) {
            chosenLag = lag;
            break;
          }
        }
        if (chosenLag > 0) {
          frameF0List.push(safeSampleRate / chosenLag);
        }
      }
    }
  }

  // Cry activity & burst segmentation
  const activityThreshold = Math.max(0.018, rms * 0.45);
  let activeFrames = 0;
  let burstCount = 0;
  let inBurst = false;
  let consecutiveActive = 0;

  for (let i = 0; i < frameRmsList.length; i++) {
    const isActive = frameRmsList[i] >= activityThreshold;
    if (isActive) {
      activeFrames++;
      consecutiveActive++;
      if (!inBurst && consecutiveActive >= 2) {
        inBurst = true;
        burstCount++;
      }
    } else {
      consecutiveActive = 0;
      inBurst = false;
    }
  }

  const totalFrames = Math.max(1, frameRmsList.length);
  const cryActivityRatio = Number((activeFrames / totalFrames).toFixed(2));
  const pauseRatio = Number((1 - cryActivityRatio).toFixed(2));

  // Intensity variance & sudden shift detection
  const meanFrameRms =
    frameRmsList.reduce((acc, v) => acc + v, 0) / Math.max(1, frameRmsList.length);
  const rmsVarianceRaw =
    frameRmsList.reduce((acc, v) => acc + (v - meanFrameRms) ** 2, 0) /
    Math.max(1, frameRmsList.length);
  const intensityVariance = Number((Math.sqrt(rmsVarianceRaw) * 100).toFixed(2));

  let suddenShiftDetected = false;
  for (let i = 3; i < frameRmsList.length; i++) {
    const prevAvg = (frameRmsList[i - 2] + frameRmsList[i - 3]) / 2;
    if (prevAvg > 0.002 && frameRmsList[i] > prevAvg * 2.5 && frameRmsList[i] - prevAvg > 0.06) {
      suddenShiftDetected = true;
      break;
    }
  }

  // Fundamental frequency summary
  let fundamentalFreqHz = 0;
  let freqMinHz = 0;
  let freqMaxHz = 0;
  if (frameF0List.length > 0) {
    const sorted = [...frameF0List].sort((a, b) => a - b);
    fundamentalFreqHz = Math.round(sorted[Math.floor(sorted.length / 2)]);
    freqMinHz = Math.round(sorted[Math.floor(sorted.length * 0.1)]);
    freqMaxHz = Math.round(sorted[Math.floor(sorted.length * 0.9)]);
  }

  // Spectral centroid approximation from zero-crossing rate + fundamental harmonic blend
  const zcrCentroid = Math.round((zeroCrossingRate * safeSampleRate) / 2);
  const spectralCentroidHz =
    fundamentalFreqHz > 0
      ? Math.round(fundamentalFreqHz * 0.55 + zcrCentroid * 0.45)
      : zcrCentroid;

  // Determine whether meaningful cry/vocal audio is present
  const isCryDetected =
    durationSec >= 0.6 &&
    rms > 0.014 &&
    activeFrames >= 3 &&
    (fundamentalFreqHz >= 180 || peak > 0.08);

  // 48-point normalized waveform preview
  const previewBins = 48;
  const binSize = Math.max(1, Math.floor(totalSamples / previewBins));
  const waveformPreview: number[] = [];
  for (let b = 0; b < previewBins; b++) {
    const start = b * binSize;
    const end = Math.min(totalSamples, start + binSize);
    let maxAmp = 0;
    for (let i = start; i < end; i++) {
      const a = Math.abs(samples[i]);
      if (a > maxAmp) maxAmp = a;
    }
    waveformPreview.push(Number(Math.min(1, maxAmp).toFixed(3)));
  }

  return {
    durationSec,
    rmsDb,
    peakDb,
    fundamentalFreqHz,
    freqMinHz,
    freqMaxHz,
    spectralCentroidHz,
    zeroCrossingRate,
    cryBurstCount: burstCount,
    pauseRatio,
    intensityVariance,
    suddenShiftDetected,
    cryActivityRatio,
    isCryDetected,
    waveformPreview,
  };
}

/**
 * Derives observed vocal traits purely from extracted DSP metrics.
 */
export function inferObservedTraitsFromDsp(features: AcousticFeatures): SoundTrait[] {
  if (!features.isCryDetected) return [];
  const traits: SoundTrait[] = [];

  if (features.fundamentalFreqHz >= 530 || features.freqMaxHz >= 640) {
    traits.push('high_pitched');
  } else if (features.fundamentalFreqHz > 0 && features.fundamentalFreqHz <= 315) {
    traits.push('groaning');
  }

  if (features.pauseRatio <= 0.25 && features.cryActivityRatio >= 0.72) {
    traits.push('continuous');
  } else if (features.cryBurstCount >= 2 || features.pauseRatio > 0.35) {
    traits.push('intermittent');
  }

  if (features.rmsDb >= -18 || features.peakDb >= -6) {
    traits.push('intense');
  } else if (features.rmsDb <= -30) {
    traits.push('weak');
  }

  if (features.suddenShiftDetected) {
    traits.push('sudden_change');
  }

  return traits;
}

/**
 * Heuristic baseline classifier over DSP metrics used as a transparent secondary signal
 * alongside Gemini multimodal audio classification or external specialized models.
 */
export function classifyAcousticHeuristics(features: AcousticFeatures): CryHypothesis[] {
  if (!features.isCryDetected) {
    return [
      { category: 'unusual', confidence: 35, rationale: 'No clear infant cry detected in audio signal.' },
    ];
  }

  const scores: Record<CryCategory, number> = {
    hunger: 25,
    fatigue: 20,
    discomfort: 20,
    diaper: 15,
    gas_colic: 20,
    comfort_holding: 20,
    pain: 15,
    temperature: 10,
    unusual: 10,
  };

  // Rhythmic mid-pitch bursts -> hunger
  if (features.fundamentalFreqHz >= 360 && features.fundamentalFreqHz <= 510 && features.cryBurstCount >= 2) {
    scores.hunger += 35;
  }
  // High pitch + sudden shift + intense -> pain or gas/colic
  if (features.fundamentalFreqHz >= 530 || features.freqMaxHz >= 650) {
    scores.pain += 34;
    scores.gas_colic += 28;
  }
  if (features.suddenShiftDetected) {
    scores.pain += 16;
    scores.gas_colic += 18;
  }
  // Low pitch + weak / intermittent -> fatigue or comfort
  if (features.fundamentalFreqHz > 0 && features.fundamentalFreqHz <= 330) {
    scores.fatigue += 35;
    scores.comfort_holding += 22;
  }
  if (features.rmsDb <= -26) {
    scores.fatigue += 16;
    scores.comfort_holding += 15;
  }
  // Continuous moderate -> discomfort / diaper
  if (features.cryActivityRatio >= 0.72 && features.fundamentalFreqHz < 520) {
    scores.discomfort += 24;
    scores.diaper += 18;
  }

  const sorted = (Object.entries(scores) as [CryCategory, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const maxScore = Math.max(1, sorted[0][1]);
  return sorted.map(([category, score], idx) => ({
    category,
    confidence: Math.min(82, Math.max(25, Math.round((score / maxScore) * (idx === 0 ? 74 : idx === 1 ? 52 : 38)))),
    rationale: `Acoustic DSP f0=${features.fundamentalFreqHz}Hz, bursts=${features.cryBurstCount}, rms=${features.rmsDb}dB`,
  }));
}

/**
 * Encodes mono Float32Array samples into a standard 16-bit PCM WAV byte buffer.
 */
export function encodeWavPcm(samples: Float32Array, sampleRate: number = 16000): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  writeString(28, ''); // noop
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return new Uint8Array(buffer);
}

/**
 * Decodes a 16-bit PCM WAV buffer into mono Float32Array samples and sampleRate.
 */
export function decodeWavPcm(wavBytes: Uint8Array): { samples: Float32Array; sampleRate: number } {
  if (wavBytes.byteLength < 44) {
    throw new Error('Invalid WAV buffer: too short');
  }
  const view = new DataView(wavBytes.buffer, wavBytes.byteOffset, wavBytes.byteLength);
  const riff = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  );
  if (riff !== 'RIFF') {
    throw new Error('Invalid WAV header');
  }
  const numChannels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const bitsPerSample = view.getUint16(34, true);

  // Locate data chunk
  let offset = 12;
  let dataOffset = 44;
  let dataLength = wavBytes.byteLength - 44;
  while (offset + 8 <= wavBytes.byteLength) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);
    if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataLength = Math.min(chunkSize, wavBytes.byteLength - dataOffset);
      break;
    }
    offset += 8 + chunkSize;
  }

  if (bitsPerSample !== 16) {
    throw new Error(`Unsupported WAV bit depth: ${bitsPerSample}`);
  }

  const frameBytes = numChannels * 2;
  const frameCount = Math.floor(dataLength / frameBytes);
  const samples = new Float32Array(frameCount);

  for (let i = 0; i < frameCount; i++) {
    let mono = 0;
    for (let ch = 0; ch < numChannels; ch++) {
      mono += view.getInt16(dataOffset + i * frameBytes + ch * 2, true) / 0x8000;
    }
    samples[i] = mono / numChannels;
  }

  return { samples, sampleRate };
}

/**
 * Generates real harmonic acoustic test WAV samples (never mocked results)
 * so parents or QA can feed genuine audio waveforms through DSP + AI analysis without a mic.
 */
export function synthesizeCryAcousticSample(
  pattern: SyntheticCryPattern,
  sampleRate: number = 16000,
  durationSec: number = 4.0
): { samples: Float32Array; wavBytes: Uint8Array; sampleRate: number } {
  const total = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(total);
  let phase = 0;

  for (let i = 0; i < total; i++) {
    const t = i / sampleRate;
    if (pattern === 'silence_room') {
      // Quiet ambient noise floor (~ -52 dB)
      samples[i] = Math.sin(2 * Math.PI * 60 * t) * 0.002 + ((i % 17) - 8) * 0.0003;
      continue;
    }

    if (pattern === 'hunger_rhythmic') {
      // Rhythmic bursts every 0.85s, f0 ~ 430 Hz with gentle harmonic vibrato
      const cycle = t % 0.85;
      const env = cycle < 0.55 ? Math.sin((cycle / 0.55) * Math.PI) : 0;
      const f0 = 430 + 18 * Math.sin(2 * Math.PI * 3.5 * t);
      phase += (2 * Math.PI * f0) / sampleRate;
      const wave =
        0.55 * Math.sin(phase) +
        0.25 * Math.sin(phase * 2) +
        0.12 * Math.sin(phase * 3);
      samples[i] = wave * env * 0.35;
    } else if (pattern === 'pain_high_pitch') {
      // Sudden intense high-pitched bursts, f0 ~ 660 Hz
      const burst = t >= 0.4 && (t < 1.8 || (t >= 2.1 && t < 3.6));
      const env = burst ? (t < 0.55 ? (t - 0.4) / 0.15 : 1) : 0.02;
      const f0 = 660 + 25 * Math.sin(2 * Math.PI * 5 * t);
      phase += (2 * Math.PI * f0) / sampleRate;
      const wave =
        0.5 * Math.sin(phase) +
        0.3 * Math.sin(phase * 2) +
        0.18 * Math.sin(phase * 3);
      samples[i] = wave * env * 0.52;
    } else {
      // fatigue_low_groan: softer intermittent low pitch ~ 275 Hz
      const cycle = t % 1.25;
      const env = cycle < 0.65 ? Math.sin((cycle / 0.65) * Math.PI) : 0;
      const f0 = 275 - 15 * (cycle / 0.65);
      phase += (2 * Math.PI * f0) / sampleRate;
      const wave = 0.65 * Math.sin(phase) + 0.2 * Math.sin(phase * 2);
      samples[i] = wave * env * 0.18;
    }
  }

  return {
    samples,
    wavBytes: encodeWavPcm(samples, sampleRate),
    sampleRate,
  };
}
