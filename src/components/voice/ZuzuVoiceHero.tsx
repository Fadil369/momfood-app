/**
 * ZuzuVoiceHero — premium Phase 2.5 hero section.
 *
 * Layout:
 *   ┌──────────────────────────────────────┐
 *   │  [trust badges]   I'm ZuZu           │
 *   │                                       │
 *   │           [ ORB - 340px ]             │
 *   │             status pill                │
 *   │                                       │
 *   │   [ Suggestion chip Grid ]            │
 *   │   [ Live caption Card    ]            │
 *   │   [ Mute / Lang / History ]           │
 *   └──────────────────────────────────────┘
 */

import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Volume2,
  VolumeX,
  Sparkles,
  History,
  MessageCircle,
  Loader2,
  Mic as MicIcon,
  ShieldCheck,
} from 'lucide-react'
import { ZuzuOrb, type ZuzuOrbState } from '@/components/voice/ZuzuOrb'
import { useVoiceCapture } from '@/hooks/useVoiceCapture'
import { useZuzuChat } from '@/hooks/useZuzuChat'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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
    { icon: Sparkles, text: 'وش عندكم اليوم؟' },
    { icon: MessageCircle, text: 'أبغى أسجل مطبخي' },
    { icon: Sparkles, text: 'عندكم كبسة بالرياض؟' },
    { icon: MessageCircle, text: 'أبغى أكلم د. محمد' },
  ],
  en: [
    { icon: Sparkles, text: 'What do you have today?' },
    { icon: MessageCircle, text: 'I want to register my kitchen' },
    { icon: Sparkles, text: 'Do you have kabsa in Riyadh?' },
    { icon: MessageCircle, text: 'I want to talk to Dr. Mohammed' },
  ],
} as const

export const ZuzuVoiceHero: React.FC = () => {
  const { lang } = useLanguage()
  const chat = useZuzuChat()
  const [muted, setMuted] = useState(true)
  const [greeted, setGreeted] = useState(false)
  const isAr = lang === 'ar'

  const onAutoStop = useCallback(
    (blob: Blob | null) => {
      if (blob) chat.processAudio(blob, lang).catch(() => {})
      else chat.setMode('idle')
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
    if (chat.mode === 'speaking') {
      chat.stopSpeaking()
      try {
        await mic.start()
      } catch {
        /* mic denied */
      }
      return
    }
    if (chat.mode === 'thinking') return
    if (mic.isRecording) {
      const blob = await mic.stop()
      if (blob) await chat.processAudio(blob, lang)
    } else {
      try {
        await mic.start()
      } catch {
        /* mic denied */
      }
    }
  }

  const onSuggestion = async (text: string) => {
    if (muted) {
      setMuted(false)
      setTimeout(() => chat.sendText(text, lang).catch(() => {}), 200)
      return
    }
    if (chat.mode === 'speaking') chat.stopSpeaking()
    await chat.sendText(text, lang)
  }

  const visualLevel = mic.isRecording ? mic.level : chat.audioLevel
  const orbSize = typeof window !== 'undefined' && window.innerWidth < 480 ? 280 : 340

  return (
      <section
        id="zuzu-hero"
        dir={isAr ? 'rtl' : 'ltr'}
        className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16"
      >
        {/* Background layers */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream-50 via-background to-cream-100/40 dark:from-olive-900 dark:via-background dark:to-olive-800/40" />
        <div className="absolute inset-0 -z-10 bg-grid opacity-60" />
        <div aria-hidden className="absolute -top-32 -left-32 w-[28rem] h-[28rem] blob-gold" />
        <div aria-hidden className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] blob-olive" />
        <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] blob-rose opacity-40" />

        {/* Top trust badges */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-6"
        >
          <Badge variant="glow" size="sm" className="font-medium">
            <Sparkles className="h-3 w-3" />
            {isAr ? 'مدعوم بـ Cloudflare Workers AI' : 'Powered by Cloudflare Workers AI'}
          </Badge>
          <Badge variant="outline" size="sm" className="font-medium">
            <ShieldCheck className="h-3 w-3 text-olive-600" />
            {isAr ? 'خصوصية كاملة' : 'Privacy-first'}
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-10 max-w-2xl"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3 font-medium">
            {isAr ? 'لُقْمَة يُمّه' : 'Loqmat Yummah'}
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold leading-[1.05] tracking-tight">
            {isAr ? (
              <>
                أنا <span className="text-gradient-gold">زوزو</span>
              </>
            ) : (
              <>
                I'm <span className="text-gradient-gold">ZuZu</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {isAr
              ? 'سُمّيت على أُمّ د. محمد 💚 — صوتٌ دافئ يربط الطبّاخات المنزليات بزبائنهم.'
              : "Named after Dr. Mohammed's mother 💚 — a warm voice connecting home cooks with their customers."}
          </p>
        </motion.div>

        {/* The Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="relative"
        >
          <ZuzuOrb
            state={orbState}
            level={visualLevel}
            bars={mic.bars}
            onTap={onOrbTap}
            size={orbSize}
            labelAr={STATE_LABELS.ar[orbState]}
            labelEn={STATE_LABELS.en[orbState]}
            lang={lang}
          />
        </motion.div>

        {/* Caption / Suggestions / Controls */}
        <div className="mt-24 w-full max-w-2xl">
          {/* Live caption card */}
          <AnimatePresence mode="wait">
            {(chat.transcript || chat.reply) && (
              <motion.div
                key={chat.reply || chat.transcript}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.35 }}
              >
                <Card variant="glass" className="overflow-hidden">
                  <CardContent className="p-5 space-y-3">
                    {chat.transcript && (
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                          <MicIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
                            {isAr ? 'أنت' : 'You'}
                          </p>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {chat.transcript}
                          </p>
                        </div>
                      </div>
                    )}
                    {chat.reply && (
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] uppercase tracking-wider text-gold-700 dark:text-gold-300 font-semibold mb-0.5">
                            {isAr ? 'زوزو' : 'ZuZu'}
                          </p>
                          <p className="text-base text-foreground leading-relaxed">
                            {chat.reply}
                          </p>
                        </div>
                      </div>
                    )}
                    {chat.mode === 'thinking' && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {isAr ? 'زوزو تفكر…' : 'ZuZu is thinking…'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestion chips — only when idle */}
          {!chat.transcript && !chat.reply && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex flex-wrap gap-2 justify-center"
            >
              {SUGGESTIONS[lang].map(({ icon: Icon, text }) => (
                <Button
                  key={text}
                  variant="glass"
                  size="sm"
                  onClick={() => onSuggestion(text)}
                  disabled={chat.mode === 'thinking'}
                  className="rounded-full text-sm hover:scale-[1.02] hover:border-accent"
                >
                  <Icon className="h-3.5 w-3.5 text-gold-600" />
                  {text}
                </Button>
              ))}
            </motion.div>
          )}

          {/* Footer controls */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setMuted((m) => !m)}
                  className="rounded-full"
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-gold-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {muted
                  ? isAr
                    ? 'فعّلي الصوت'
                    : 'Enable sound'
                  : isAr
                  ? 'الصوت مفعل'
                  : 'Sound on'}
              </TooltipContent>
            </Tooltip>

            <Sheet>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full"
                      aria-label="History"
                      disabled={chat.history.length === 0}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  {isAr ? 'سجل المحادثة' : 'Conversation history'}
                </TooltipContent>
              </Tooltip>

              <SheetContent side={isAr ? 'left' : 'right'}>
                <SheetHeader>
                  <SheetTitle className="font-display">
                    {isAr ? 'سجل المحادثة مع زوزو' : 'Conversation with ZuZu'}
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="mt-4 h-[calc(100vh-8rem)] pr-2">
                  <div className="space-y-3 pb-12">
                    {chat.history.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        {isAr ? 'لا توجد محادثة بعد' : 'No conversation yet'}
                      </p>
                    ) : (
                      chat.history.map((turn, i) => (
                        <div
                          key={`${turn.ts}-${i}`}
                          className={
                            turn.role === 'user'
                              ? 'bg-muted/60 rounded-2xl rounded-br-sm p-3 text-sm ms-auto max-w-[85%]'
                              : 'bg-gradient-to-br from-gold-50 to-cream-50 dark:from-gold-700/10 dark:to-olive-900/40 border border-gold-200/50 dark:border-gold-700/30 rounded-2xl rounded-bl-sm p-3 text-sm max-w-[85%]'
                          }
                        >
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                            {turn.role === 'user'
                              ? isAr
                                ? 'أنت'
                                : 'You'
                              : 'ZuZu'}
                          </p>
                          <p className="leading-relaxed">{turn.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <div className="h-5 w-px bg-border mx-1" />

            <p className="text-xs text-muted-foreground">
              {muted
                ? isAr
                  ? '🔇 اضغطي على الدائرة'
                  : '🔇 Tap the orb'
                : isAr
                ? '🎙️ تتوقف تلقائياً عند الصمت'
                : '🎙️ Auto-stops on silence'}
            </p>
          </div>

          {/* Error toast strip */}
          {(mic.error || chat.error) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <Badge variant="destructive" size="lg" className="font-normal">
                {mic.error?.includes('denied') || mic.error === 'mic_denied'
                  ? isAr
                    ? 'يرجى السماح بالميكروفون 🎙️'
                    : 'Please allow microphone access 🎙️'
                  : mic.error || chat.error}
              </Badge>
            </motion.div>
          )}
        </div>
      </section>
  )
}

export default ZuzuVoiceHero
