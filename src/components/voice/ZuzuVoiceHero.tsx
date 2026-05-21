/**
 * ZuzuVoiceHero — hero section with full Phase 2 voice loop.
 *
 *   - Tap orb during 'speaking' → barge-in (stop ZuZu, start listening)
 *   - Tap orb during 'idle' → start listening
 *   - VAD auto-stops on silence → STT → chat (with tools) → TTS
 *   - Session id persists in localStorage for cross-turn memory
 */

import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Languages, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { ZuzuOrb, type ZuzuOrbState } from '@/components/voice/ZuzuOrb'
import { useVoiceCapture } from '@/hooks/useVoiceCapture'
import { useZuzuChat } from '@/hooks/useZuzuChat'
import { useLanguage } from '@/contexts/LanguageContext'

const GREETINGS = {
  ar: 'أهلين بكِ في لُقْمَة يُمّه. أنا زوزو، مساعدتك. اضغطي على الدائرة وكلميني — أنا أسمعك.',
  en: "Welcome to Loqmat Yummah. I'm ZuZu, your assistant. Tap the circle and just talk — I'll hear you.",
}

const STATE_LABELS = {
  ar: {
    idle: 'اضغطي للكلام',
    listening: 'أسمعك… تكلمي',
    thinking: 'لحظة أفكر…',
    speaking: 'زوزو تتكلم — اضغطي للمقاطعة',
  },
  en: {
    idle: 'Tap to talk',
    listening: "I'm listening…",
    thinking: 'Thinking…',
    speaking: 'ZuZu speaking — tap to interrupt',
  },
} as const

const SUGGESTIONS = {
  ar: [
    'وش عندكم اليوم؟',
    'أبغى أسجل مطبخي',
    'عندكم كبسة بالرياض؟',
    'أبغى أكلم د. محمد',
  ],
  en: [
    'What do you have today?',
    'I want to register my kitchen',
    'Do you have kabsa in Riyadh?',
    'I want to talk to Dr. Mohammed',
  ],
} as const

export const ZuzuVoiceHero: React.FC = () => {
  const { lang, toggle: toggleLang } = useLanguage()
  const chat = useZuzuChat()
  const [muted, setMuted] = useState(true)
  const [greeted, setGreeted] = useState(false)

  // VAD auto-stop → process audio
  const onAutoStop = useCallback(
    (blob: Blob | null) => {
      if (blob) {
        chat.processAudio(blob, lang).catch(() => {})
      } else {
        chat.setMode('idle')
      }
    },
    [chat, lang],
  )

  const mic = useVoiceCapture({
    silenceMs: 1300,
    silenceThreshold: 0.04,
    minRecordMs: 700,
    maxRecordMs: 25000,
    onAutoStop,
  })

  const orbState: ZuzuOrbState = mic.isRecording
    ? 'listening'
    : chat.mode === 'thinking'
    ? 'thinking'
    : chat.mode === 'speaking'
    ? 'speaking'
    : 'idle'

  // Greeting on first unmute
  useEffect(() => {
    if (!muted && !greeted) {
      setGreeted(true)
      chat.speak(GREETINGS[lang], lang).catch(() => {})
    }
  }, [muted, greeted, lang, chat])

  const onOrbTap = async () => {
    if (muted) {
      setMuted(false)
      return
    }

    // Barge-in: tap while speaking → stop and start listening
    if (chat.mode === 'speaking') {
      chat.stopSpeaking()
      try {
        await mic.start()
      } catch {
        // mic denied
      }
      return
    }

    if (chat.mode === 'thinking') return

    if (mic.isRecording) {
      // Manual stop (user tapped to cut short before VAD)
      const blob = await mic.stop()
      if (blob) await chat.processAudio(blob, lang)
    } else {
      try {
        await mic.start()
      } catch {
        // mic denied
      }
    }
  }

  const onSuggestion = async (text: string) => {
    if (muted) {
      setMuted(false)
      // Defer 200ms so greeting starts; then send suggestion
      setTimeout(() => chat.sendText(text, lang).catch(() => {}), 200)
      return
    }
    if (chat.mode === 'speaking') chat.stopSpeaking()
    await chat.sendText(text, lang)
  }

  const visualLevel = mic.isRecording ? mic.level : chat.audioLevel

  return (
    <section
      id="zuzu-hero"
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-4 py-16"
      style={{
        background:
          'radial-gradient(ellipse at top, #faf6ee 0%, #f5ead4 35%, #e8dcc0 100%)',
      }}
    >
      {/* Decorative ambient glows */}
      <div
        aria-hidden
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, #c9a96155 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, #e8b4a055 0%, transparent 70%)' }}
      />

      {/* Top controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <button
          onClick={toggleLang}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/60 shadow text-sm font-medium text-olive-dark hover:bg-white transition"
        >
          <Languages className="w-4 h-4" />
          {lang === 'ar' ? 'EN' : 'AR'}
        </button>
        <button
          onClick={() => setMuted((m) => !m)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/60 shadow text-sm font-medium text-olive-dark hover:bg-white transition"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {muted
            ? lang === 'ar'
              ? 'الصوت مكتوم'
              : 'Muted'
            : lang === 'ar'
            ? 'مفتوح'
            : 'On'}
        </button>
      </div>

      {/* Brand line */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 z-10"
      >
        <p className="text-xs uppercase tracking-[0.4em] text-olive/70 mb-3 font-medium">
          {lang === 'ar' ? 'لُقْمَة يُمّه' : 'Loqmat Yummah'}
        </p>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-olive-dark leading-tight"
          style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
        >
          {lang === 'ar' ? (
            <>
              أنا <span className="text-gold">زوزو</span>
            </>
          ) : (
            <>
              I'm <span className="text-gold">ZuZu</span>
            </>
          )}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-olive/80 max-w-xl mx-auto">
          {lang === 'ar'
            ? 'سُمّيت على أُمّ د. محمد 💚 — حاضنة الطبّاخات، صوت لُقمتك الدافية'
            : "Named after Dr. Mohammed's mother 💚 — the voice of warm home cooking"}
        </p>
      </motion.div>

      {/* The Orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="z-10"
      >
        <ZuzuOrb
          state={orbState}
          level={visualLevel}
          bars={mic.bars}
          onTap={onOrbTap}
          size={typeof window !== 'undefined' && window.innerWidth < 480 ? 280 : 340}
          labelAr={STATE_LABELS.ar[orbState]}
          labelEn={STATE_LABELS.en[orbState]}
          lang={lang}
        />
      </motion.div>

      {/* Captions */}
      <div className="mt-20 z-10 w-full max-w-2xl px-2">
        <AnimatePresence mode="wait">
          {(chat.transcript || chat.reply) && (
            <motion.div
              key={chat.reply || chat.transcript}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl bg-white/75 backdrop-blur-xl border border-white/60 shadow-xl p-5"
              style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
            >
              {chat.transcript && (
                <p className="text-sm text-olive/70 mb-2">
                  <span className="font-medium">{lang === 'ar' ? 'أنت:' : 'You:'}</span>{' '}
                  {chat.transcript}
                </p>
              )}
              {chat.reply && (
                <p className="text-lg text-olive-dark leading-relaxed">
                  <span className="font-medium text-gold">
                    {lang === 'ar' ? 'زوزو:' : 'ZuZu:'}
                  </span>{' '}
                  {chat.reply}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestion chips when idle */}
        {!chat.transcript && !chat.reply && (
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {SUGGESTIONS[lang].map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                disabled={chat.mode === 'thinking'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-gold/30 text-sm text-olive-dark hover:bg-white hover:border-gold transition disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {(mic.error || chat.error) && (
          <div className="mt-4 text-center text-sm text-rose-600/80">
            {mic.error?.includes('denied') || mic.error === 'mic_denied'
              ? lang === 'ar'
                ? 'يرجى السماح بالميكروفون لتحدثي مع زوزو 🎙️'
                : 'Please allow microphone access 🎙️'
              : mic.error || chat.error}
          </div>
        )}

        {/* Hint */}
        {!chat.transcript && !chat.reply && (
          <p className="mt-6 text-center text-xs text-olive/50">
            {muted
              ? lang === 'ar'
                ? '🔇 اضغطي على الدائرة لتفعيل الصوت'
                : '🔇 Tap the orb to unmute'
              : lang === 'ar'
              ? '🎙️ تتوقف تلقائياً عند الصمت • اضغطي وقت كلام زوزو لمقاطعتها'
              : '🎙️ Auto-stops on silence • Tap while ZuZu speaks to interrupt'}
          </p>
        )}
      </div>
    </section>
  )
}

export default ZuzuVoiceHero
