import { encodeWavPcm, extractAcousticFeatures } from './acousticAnalysis';
import type { AcousticFeatures } from '../types/babycry';

export interface DecodedAudioResult {
  wavBytes: Uint8Array;
  wavBase64: string;
  mimeType: string;
  features: AcousticFeatures;
  objectUrl: string;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/**
 * Downsamples mono/stereo AudioBuffer to 16kHz mono Float32Array for clean acoustic DSP & WAV encoding.
 */
function resampleToMono16k(audioBuffer: AudioBuffer): { samples: Float32Array; sampleRate: number } {
  const targetRate = 16000;
  const numChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const mono = new Float32Array(length);

  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = audioBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      mono[i] += channelData[i] / numChannels;
    }
  }

  if (audioBuffer.sampleRate === targetRate) {
    return { samples: mono, sampleRate: targetRate };
  }

  const ratio = audioBuffer.sampleRate / targetRate;
  const newLength = Math.max(1, Math.floor(mono.length / ratio));
  const resampled = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIdx = i * ratio;
    const idx0 = Math.floor(srcIdx);
    const idx1 = Math.min(mono.length - 1, idx0 + 1);
    const frac = srcIdx - idx0;
    resampled[i] = mono[idx0] * (1 - frac) + mono[idx1] * frac;
  }

  return { samples: resampled, sampleRate: targetRate };
}

export async function processAudioBlobToWav(blob: Blob): Promise<DecodedAudioResult> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const { samples, sampleRate } = resampleToMono16k(audioBuffer);
    const features = extractAcousticFeatures(samples, sampleRate);
    const wavBytes = encodeWavPcm(samples, sampleRate);
    const wavBase64 = uint8ArrayToBase64(wavBytes);
    const wavBlob = new Blob([wavBytes.buffer as ArrayBuffer], { type: 'audio/wav' });
    const objectUrl = URL.createObjectURL(wavBlob);
    return {
      wavBytes,
      wavBase64,
      mimeType: 'audio/wav',
      features,
      objectUrl,
    };
  } finally {
    await ctx.close().catch(() => undefined);
  }
}

export function buildWavResultFromSamples(
  samples: Float32Array,
  sampleRate: number = 16000
): DecodedAudioResult {
  const features = extractAcousticFeatures(samples, sampleRate);
  const wavBytes = encodeWavPcm(samples, sampleRate);
  const wavBase64 = uint8ArrayToBase64(wavBytes);
  const wavBlob = new Blob([wavBytes.buffer as ArrayBuffer], { type: 'audio/wav' });
  const objectUrl = URL.createObjectURL(wavBlob);
  return {
    wavBytes,
    wavBase64,
    mimeType: 'audio/wav',
    features,
    objectUrl,
  };
}
