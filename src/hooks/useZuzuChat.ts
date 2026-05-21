/**
 * useZuzuChat — orchestrates ZuZu's voice loop.
 *
 *   audio Blob ──► /api/zuzu/stt   ──► transcript
 *                                      │
 *                                      ▼
 *                  /api/zuzu/chat  ──► assistant text
 *                                      │
 *                                      ▼
 *                  /api/zuzu/tts   ──► audio playback
 *
 * Also exposes a `speak(text)` helper for the welcome greeting.
 */

import { useCallback, useRef, useState } from 'react'

export type ZuzuMode = 'idle' | 'listening' | 'thinking' | 'speaking'

export interface ZuzuTurn {
  role: 'user' | 'assistant'
  text: string
  ts: number
}

export interface UseZuzuChat {
  mode: ZuzuMode
  setMode: (m: ZuzuMode) => void
  transcript: string
  reply: string
  history: ZuzuTurn[]
  audioLevel: number
  error: string | null
  /** Send an audio blob through the full STT → LLM → TTS loop */
  processAudio: (blob: Blob, lang: 'ar' | 'en') => Promise<void>
  /** Just speak (used for greeting) */
  speak: (text: string, lang: 'ar' | 'en') => Promise<void>
  /** Send a typed message (skip STT) */
  sendText: (text: string, lang: 'ar' | 'en') => Promise<void>
  reset: () => void
}

const API_BASE = '/api/zuzu'

export function useZuzuChat(): UseZuzuChat {
  const [mode, setMode] = useState<ZuzuMode>('idle')
  const [transcript, setTranscript] = useState('')
  const [reply, setReply] = useState('')
  const [history, setHistory] = useState<ZuzuTurn[]>([])
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const audioAnalyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)

  const cleanupAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (audioElRef.current) {
      audioElRef.current.pause()
      audioElRef.current.src = ''
      audioElRef.current = null
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
    }
    audioCtxRef.current = null
    audioAnalyserRef.current = null
    setAudioLevel(0)
  }, [])

  const reset = useCallback(() => {
    cleanupAudio()
    setMode('idle')
    setTranscript('')
    setReply('')
    setHistory([])
    setError(null)
  }, [cleanupAudio])

  /** Plays MP3 from a fetch Response while pumping `audioLevel` for orb visuals. */
  const playStream = useCallback(
    async (resp: Response) => {
      const audioBlob = await resp.blob()
      const url = URL.createObjectURL(audioBlob)
      const el = new Audio(url)
      audioElRef.current = el

      // Hook up analyser for live amplitude on the orb
      try {
        const AudioCtor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const ctx = new AudioCtor()
        audioCtxRef.current = ctx
        const src = ctx.createMediaElementSource(el)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 64
        src.connect(analyser)
        analyser.connect(ctx.destination)
        audioAnalyserRef.current = analyser
        const data = new Uint8Array(analyser.frequencyBinCount)
        const tick = () => {
          analyser.getByteFrequencyData(data)
          let s = 0
          for (let i = 0; i < data.length; i++) s += data[i]
          setAudioLevel(Math.min(1, s / data.length / 180))
          rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
      } catch {
        // analyser optional
      }

      await new Promise<void>((resolve) => {
        el.onended = () => resolve()
        el.onerror = () => resolve()
        el.play().catch(() => resolve())
      })
      URL.revokeObjectURL(url)
      cleanupAudio()
    },
    [cleanupAudio],
  )

  const speak = useCallback(
    async (text: string, lang: 'ar' | 'en') => {
      if (!text.trim()) return
      try {
        setMode('speaking')
        setReply(text)
        const resp = await fetch(`${API_BASE}/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, lang }),
        })
        if (!resp.ok) throw new Error(`tts ${resp.status}`)
        await playStream(resp)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setMode('idle')
      }
    },
    [playStream],
  )

  const sendText = useCallback(
    async (text: string, lang: 'ar' | 'en') => {
      if (!text.trim()) return
      const userTurn: ZuzuTurn = { role: 'user', text, ts: Date.now() }
      setTranscript(text)
      setHistory((h) => [...h, userTurn])

      try {
        setMode('thinking')
        const chatResp = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            lang,
            history: history.slice(-8).map((t) => ({ role: t.role, content: t.text })),
          }),
        })
        if (!chatResp.ok) throw new Error(`chat ${chatResp.status}`)
        const { reply: assistantText } = (await chatResp.json()) as {
          ok: boolean
          reply?: string
          data?: { reply: string }
        } & { reply: string }
        const replyText =
          (assistantText as string) ||
          (lang === 'ar' ? 'أهلين، أنا زوزو. كيف أقدر أساعدك؟' : "Hi, I'm ZuZu. How can I help?")
        setReply(replyText)
        setHistory((h) => [...h, { role: 'assistant', text: replyText, ts: Date.now() }])
        await speak(replyText, lang)
      } catch (e) {
        setError((e as Error).message)
        setMode('idle')
      }
    },
    [history, speak],
  )

  const processAudio = useCallback(
    async (blob: Blob, lang: 'ar' | 'en') => {
      try {
        setMode('thinking')
        setError(null)
        const fd = new FormData()
        fd.append('audio', blob, 'speech.webm')
        fd.append('lang', lang)
        const sttResp = await fetch(`${API_BASE}/stt`, { method: 'POST', body: fd })
        if (!sttResp.ok) throw new Error(`stt ${sttResp.status}`)
        const sttData = (await sttResp.json()) as {
          ok: boolean
          text?: string
          data?: { text: string }
        }
        const text = sttData.text || sttData.data?.text || ''
        if (!text.trim()) {
          setMode('idle')
          return
        }
        await sendText(text, lang)
      } catch (e) {
        setError((e as Error).message)
        setMode('idle')
      }
    },
    [sendText],
  )

  return {
    mode,
    setMode,
    transcript,
    reply,
    history,
    audioLevel,
    error,
    processAudio,
    speak,
    sendText,
    reset,
  }
}
