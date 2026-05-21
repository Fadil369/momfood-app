/**
 * useVoiceCapture — microphone capture with auto-stop VAD (Voice Activity
 * Detection). When silence is detected for `silenceMs`, recording stops
 * automatically and the recorded blob is returned via the optional
 * `onAutoStop` callback (since hooks can't easily resolve a promise here).
 *
 * Tunables (sane defaults for warm conversational use):
 *   silenceThreshold = 0.04   (level below which we count as silence)
 *   silenceMs        = 1300   (ms of continuous silence to stop)
 *   minRecordMs      = 700    (don't auto-stop before this)
 *   maxRecordMs      = 30000  (hard cap)
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export interface VoiceCaptureState {
  isRecording: boolean
  isSupported: boolean
  level: number
  bars: Uint8Array | null
  error: string | null
}

export interface VoiceCaptureOptions {
  silenceThreshold?: number
  silenceMs?: number
  minRecordMs?: number
  maxRecordMs?: number
  onAutoStop?: (blob: Blob | null) => void
}

export interface UseVoiceCapture extends VoiceCaptureState {
  start: () => Promise<void>
  stop: () => Promise<Blob | null>
  toggle: () => Promise<Blob | null | void>
}

const FFT_SIZE = 128

export function useVoiceCapture(opts: VoiceCaptureOptions = {}): UseVoiceCapture {
  const {
    silenceThreshold = 0.04,
    silenceMs = 1300,
    minRecordMs = 700,
    maxRecordMs = 30000,
    onAutoStop,
  } = opts

  const [state, setState] = useState<VoiceCaptureState>({
    isRecording: false,
    isSupported:
      typeof window !== 'undefined' &&
      !!navigator?.mediaDevices?.getUserMedia &&
      !!(window.MediaRecorder || (window as any).webkitMediaRecorder),
    level: 0,
    bars: null,
    error: null,
  })

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const stopResolveRef = useRef<((blob: Blob | null) => void) | null>(null)

  const startedAtRef = useRef<number>(0)
  const lastVoiceAtRef = useRef<number>(0)
  const autoStopFiredRef = useRef<boolean>(false)
  const onAutoStopRef = useRef<typeof onAutoStop>(onAutoStop)
  useEffect(() => { onAutoStopRef.current = onAutoStop }, [onAutoStop])

  const tick = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return
    const bars = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(bars)
    let sum = 0
    for (let i = 0; i < bars.length; i++) sum += bars[i]
    const level = Math.min(1, sum / bars.length / 180)
    setState((s) => ({ ...s, level, bars }))

    // VAD
    const now = performance.now()
    if (level > silenceThreshold) {
      lastVoiceAtRef.current = now
    }
    const elapsed = now - startedAtRef.current
    const silentFor = now - lastVoiceAtRef.current
    const shouldAutoStop =
      !autoStopFiredRef.current &&
      ((elapsed >= minRecordMs && silentFor >= silenceMs) || elapsed >= maxRecordMs)

    if (shouldAutoStop) {
      autoStopFiredRef.current = true
      const rec = recorderRef.current
      if (rec && rec.state !== 'inactive') {
        // Attach a callback to receive the blob via onAutoStop
        stopResolveRef.current = (blob) => {
          onAutoStopRef.current?.(blob)
        }
        rec.stop()
      }
      return // skip raf — will restart on next start()
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [silenceThreshold, silenceMs, minRecordMs, maxRecordMs])

  const cleanup = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
    }
    audioCtxRef.current = null
    analyserRef.current = null
    recorderRef.current = null
  }, [])

  const start = useCallback(async () => {
    try {
      setState((s) => ({ ...s, error: null }))
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      streamRef.current = stream

      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtor()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = FFT_SIZE
      analyser.smoothingTimeConstant = 0.7
      source.connect(analyser)
      analyserRef.current = analyser

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType: mime })
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = chunksRef.current.length
          ? new Blob(chunksRef.current, { type: mime })
          : null
        cleanup()
        stopResolveRef.current?.(blob)
        stopResolveRef.current = null
        setState({
          isRecording: false,
          isSupported: true,
          level: 0,
          bars: null,
          error: null,
        })
      }
      recorderRef.current = recorder
      recorder.start(100)

      startedAtRef.current = performance.now()
      lastVoiceAtRef.current = performance.now()
      autoStopFiredRef.current = false

      setState((s) => ({ ...s, isRecording: true }))
      rafRef.current = requestAnimationFrame(tick)
    } catch (err) {
      cleanup()
      const msg = (err as Error).message || 'mic_denied'
      setState((s) => ({ ...s, isRecording: false, error: msg }))
      throw err
    }
  }, [cleanup, tick])

  const stop = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const rec = recorderRef.current
      if (!rec || rec.state === 'inactive') {
        cleanup()
        resolve(null)
        return
      }
      stopResolveRef.current = resolve
      rec.stop()
    })
  }, [cleanup])

  const toggle = useCallback(async () => {
    if (state.isRecording) return stop()
    return start()
  }, [state.isRecording, start, stop])

  useEffect(() => cleanup, [cleanup])

  return { ...state, start, stop, toggle }
}
