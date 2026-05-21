/**
 * useVoiceCapture — microphone capture + Web Audio analysis.
 *
 * Provides:
 *   - start()/stop() recording
 *   - live `level` (0..1) for orb pulsing
 *   - live `bars` (Uint8Array) for frequency visualization
 *   - on stop, returns a Blob (audio/webm) for STT upload
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export interface VoiceCaptureState {
  isRecording: boolean
  isSupported: boolean
  level: number
  bars: Uint8Array | null
  error: string | null
}

export interface UseVoiceCapture extends VoiceCaptureState {
  start: () => Promise<void>
  stop: () => Promise<Blob | null>
  toggle: () => Promise<Blob | null | void>
}

const FFT_SIZE = 128

export function useVoiceCapture(): UseVoiceCapture {
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

  const tick = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return
    const bars = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(bars)
    let sum = 0
    for (let i = 0; i < bars.length; i++) sum += bars[i]
    const level = Math.min(1, sum / bars.length / 180)
    setState((s) => ({ ...s, level, bars }))
    rafRef.current = requestAnimationFrame(tick)
  }, [])

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
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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
