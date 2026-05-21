/**
 * ZuzuOrb — the heart of the experience.
 * A vibrant, breathing voice-circle that represents ZuZu (named after Mama 💚).
 *
 * States:
 *   idle      — gentle breathing aurora
 *   listening — pulsing blue with live frequency bars
 *   thinking  — rotating golden shimmer
 *   speaking  — rippling rose waves
 *
 * Inputs:
 *   - state: ZuzuOrbState
 *   - level: 0..1 (live audio amplitude for listening; TTS amplitude for speaking)
 *   - bars:  Float32Array | Uint8Array (frequency data, optional)
 *   - onTap: tap-to-talk handler
 *   - size:  px (default 320)
 */

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Loader2, Volume2, Sparkles } from 'lucide-react'

export type ZuzuOrbState = 'idle' | 'listening' | 'thinking' | 'speaking'

export interface ZuzuOrbProps {
  state: ZuzuOrbState
  level?: number // 0..1
  bars?: Uint8Array | null
  onTap?: () => void
  size?: number
  labelAr?: string
  labelEn?: string
  lang?: 'ar' | 'en'
}

// Color rings per state — luxurious, vibrant, premium
const STATE_COLORS: Record<
  ZuzuOrbState,
  { from: string; via: string; to: string; ring: string; glow: string }
> = {
  idle: {
    from: '#3a4a2a', // olive-dark
    via: '#c9a961',  // gold
    to: '#e8b4a0',   // soft rose
    ring: 'rgba(201,169,97,0.5)',
    glow: 'rgba(201,169,97,0.35)',
  },
  listening: {
    from: '#1e3a5f',
    via: '#3a8fb7',
    to: '#9ec4d4',
    ring: 'rgba(58,143,183,0.6)',
    glow: 'rgba(58,143,183,0.45)',
  },
  thinking: {
    from: '#5a4a1a',
    via: '#c9a961',
    to: '#f5d98a',
    ring: 'rgba(245,217,138,0.7)',
    glow: 'rgba(201,169,97,0.5)',
  },
  speaking: {
    from: '#6b2c3d',
    via: '#d97b8e',
    to: '#ffd4c4',
    ring: 'rgba(217,123,142,0.6)',
    glow: 'rgba(217,123,142,0.45)',
  },
}

const NUM_BARS = 32

export const ZuzuOrb: React.FC<ZuzuOrbProps> = ({
  state,
  level = 0,
  bars = null,
  onTap,
  size = 320,
  labelAr,
  labelEn,
  lang = 'ar',
}) => {
  const c = STATE_COLORS[state]

  // Frequency bars laid in a circle
  const barElements = useMemo(() => {
    const out: React.ReactElement[] = []
    const cx = size / 2
    const cy = size / 2
    const innerR = size * 0.42
    const maxBarLen = size * 0.14
    for (let i = 0; i < NUM_BARS; i++) {
      const angle = (i / NUM_BARS) * Math.PI * 2 - Math.PI / 2
      const ampRaw = bars ? bars[Math.floor((i / NUM_BARS) * bars.length)] / 255 : 0
      // Smooth idle breathing wave when no real data
      const breathing = 0.18 + 0.12 * Math.sin(Date.now() / 600 + i * 0.4)
      const amp = state === 'idle'
        ? breathing
        : Math.max(0.08, ampRaw * (state === 'listening' ? 1.1 : 0.7) + level * 0.3)
      const len = innerR + maxBarLen * amp
      const x1 = cx + Math.cos(angle) * innerR
      const y1 = cy + Math.sin(angle) * innerR
      const x2 = cx + Math.cos(angle) * len
      const y2 = cy + Math.sin(angle) * len
      out.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={c.ring}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.85}
        />,
      )
    }
    return out
  }, [bars, level, state, size, c.ring])

  return (
    <div
      className="relative inline-flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Outer glow halo */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${c.glow} 0%, transparent 65%)`,
          filter: 'blur(28px)',
        }}
        animate={{
          scale: state === 'idle' ? [1, 1.08, 1] : [1, 1.18, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: state === 'idle' ? 4 : 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Concentric pulse rings */}
      {state !== 'idle' &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            aria-hidden
            className="absolute rounded-full border"
            style={{
              borderColor: c.ring,
              width: size,
              height: size,
            }}
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: i * 0.7,
              ease: 'easeOut',
            }}
          />
        ))}

      {/* Frequency-bar ring */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="absolute inset-0 pointer-events-none"
      >
        {barElements}
      </svg>

      {/* Main orb */}
      <motion.button
        type="button"
        onClick={onTap}
        aria-label={lang === 'ar' ? 'تكلّم مع زوزو' : 'Talk to ZuZu'}
        className="relative rounded-full focus:outline-none focus:ring-4 focus:ring-gold/40 group"
        style={{
          width: size * 0.62,
          height: size * 0.62,
          background: `conic-gradient(from 180deg at 50% 50%, ${c.from}, ${c.via}, ${c.to}, ${c.via}, ${c.from})`,
          boxShadow: `0 12px 60px ${c.glow}, inset 0 0 40px rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.18)`,
        }}
        animate={{
          rotate: state === 'thinking' ? 360 : 0,
          scale:
            state === 'speaking'
              ? [1, 1.05, 1.02, 1.06, 1]
              : state === 'listening'
              ? 1 + level * 0.08
              : [1, 1.02, 1],
        }}
        transition={{
          rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
          scale:
            state === 'speaking'
              ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
              : state === 'idle'
              ? { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 },
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Inner gloss */}
        <div
          aria-hidden
          className="absolute inset-2 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 35%, transparent 55%)',
          }}
        />

        {/* State icon center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-white/95"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.35))' }}
            >
              {state === 'idle' && <Sparkles className="w-10 h-10" strokeWidth={1.8} />}
              {state === 'listening' && <Mic className="w-12 h-12" strokeWidth={1.8} />}
              {state === 'thinking' && (
                <Loader2 className="w-10 h-10 animate-spin" strokeWidth={1.8} />
              )}
              {state === 'speaking' && <Volume2 className="w-12 h-12" strokeWidth={1.8} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Floating state label */}
      {(labelAr || labelEn) && (
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-lg text-sm font-medium text-olive-dark whitespace-nowrap"
          style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
        >
          {lang === 'ar' ? labelAr : labelEn}
        </motion.div>
      )}
    </div>
  )
}

export default ZuzuOrb
