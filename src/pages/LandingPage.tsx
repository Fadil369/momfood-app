/**
 * لُقْمَة يُمّه — Landing Page
 * A son's gift to his mother. Every pixel carries love. 💚
 */

import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  ChevronDown,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Languages,
  X,
} from 'lucide-react'
import { menuItems, buildWhatsAppLink, WHATSAPP_NUMBER, type MenuItem } from '@/data/menu'
import { useLanguage } from '@/contexts/LanguageContext'

const ZuZuAgent = lazy(() => import('@/ai/ZuZuAgent'))

// ─── i18n helpers ───────────────────────────────────────────────────────────
// لُقْمَة يُمّه — Cloud Kitchen Incubator, hosted by ZuZu (the agent named after Mama 💚)
const T = {
  brand: { ar: 'لُقْمَة يُمّه', en: 'Loqmat Yummah' },
  tagline: { ar: 'حاضنة المطابخ السحابية، تديرها زوزو', en: 'A cloud kitchen incubator — hosted by ZuZu' },
  bismillah: { ar: 'بسم الله ما شاء الله', en: 'In the name of God' },
  slogan: {
    ar: 'من حبوباتنا سرّ طعم بلادنا',
    en: "From our grandmothers' hands — the secret of our homeland's taste",
  },

  // ZuZu hero
  zuzuGreet: { ar: 'أهلين، أنا زوزو 👋', en: "Hi, I'm ZuZu 👋" },
  heroLine1: { ar: 'أنا زوزو — مساعدتك في', en: "I'm ZuZu — your host at" },
  heroLine2: { ar: 'لُقْمَة يُمّه', en: 'Loqmat Yummah' },
  heroSub: {
    ar: 'منصة بسم أمي — تحضن الطباخات، توصل اللُّقمة الدافية لبيتك، وتفتح أبواب الرزق بأيدي ماهرة.',
    en: "A platform named after my mother — incubating home cooks, delivering warm bites to your door, opening doors of livelihood for skilled hands.",
  },
  heroVoiceCta: { ar: '🎙️ تكلّم مع زوزو', en: '🎙️ Talk to ZuZu' },
  heroOrderCta: { ar: 'اطلبي طعام', en: 'Order Food' },
  heroJoinCta: { ar: 'انضمي كطبّاخة', en: 'Join as a Cook' },

  // ZuZu capabilities strip
  capsTitle: { ar: 'زوزو تفعل كل شيء', en: 'ZuZu handles everything' },
  capsSub: { ar: 'وكيلٌ ذكيّ، يتكلّم ويسمع، ويُنسّق كأنّه واحد من العيلة', en: 'A smart, voice-first agent who feels like family' },
  cap1: { ar: '🛒 يأخذ طلبات العملاء بالصوت', en: '🛒 Takes customer orders by voice' },
  cap2: { ar: '👩\u200d🍳 يسجّل المطابخ والشركاء', en: '👩\u200d🍳 Onboards kitchens & partners' },
  cap3: { ar: '🛵 ينسّق مع السائقين', en: '🛵 Coordinates with drivers' },
  cap4: { ar: '💳 يتابع المدفوعات والفواتير', en: '💳 Tracks payments & invoices' },
  cap5: { ar: '🪪 يتحقّق من الهويات بسرّية', en: '🪪 Verifies identities privately' },
  cap6: { ar: '🤲 يساعد الأسر المحتاجة', en: '🤲 Supports families in need' },

  // Story (now about the platform + Mama)
  storyTitle: { ar: 'لماذا زوزو؟', en: 'Why ZuZu?' },
  story1Title: { ar: 'الاسم', en: 'The Name' },
  story1Body: {
    ar: 'زوزو هو اسم أمي. كل ابتسامة في هذه المنصة، وكل لُقمة دافية تصل إليك، اسمها يحملها.',
    en: "ZuZu is my mother's name. Every smile on this platform, every warm bite reaching you, carries her name.",
  },
  story2Title: { ar: 'الحاضنة', en: 'The Incubator' },
  story2Body: {
    ar: 'نحتضن الطبّاخات في بيوتهن — معدّات، تدريب، توصيل، ومنصة دفع. الحبوبة تطبخ، ونحن نتكفّل بالباقي.',
    en: 'We incubate home cooks — equipment, training, delivery, and payments. She cooks; we handle the rest.',
  },
  story3Title: { ar: 'الوكيل الذكي', en: 'The Agent' },
  story3Body: {
    ar: 'زوزو — الوكيل — يستقبلك بصوته، يأخذ طلبك، يتابع طبخه، ويُحضره دافياً لباب بيتك. كأنه واحد من العيلة.',
    en: 'ZuZu — the agent — greets you with her voice, takes your order, watches it cook, and delivers it warm. Like family.',
  },

  menuTitle: { ar: 'من مطابخنا اليوم', en: "From Today's Kitchens" },
  menuSub: { ar: 'كل طبق يحكي قصة — وزوزو توصلها لك', en: 'Every dish tells a story — ZuZu delivers it to you' },
  catMains: { ar: 'الأطباق الرئيسية', en: 'Main Dishes' },
  catSalads: { ar: 'السلطات', en: 'Salads' },
  catExtras: { ar: 'الإضافات', en: 'Extras' },
  riyal: { ar: 'ريال', en: 'SAR' },
  orderItem: { ar: 'اطلب من زوزو', en: 'Order via ZuZu' },

  galleryTitle: { ar: 'من مطابخ يُمّه', en: "From Mama's Kitchens" },
  gallerySub: { ar: 'بصمات الحب في كل صحن', en: 'Fingerprints of love in every plate' },

  // Partner programs (incubator)
  partnersTitle: { ar: 'انضمي إلى عائلة لُقْمَة يُمّه', en: 'Join the Loqmat Yummah Family' },
  partnersSub: { ar: 'سواء كنتِ طبّاخة، سائق، أو شريك خير — زوزو ترحّب بكم', en: 'Cook, driver, or partner-in-good — ZuZu welcomes you' },
  cookCard: { ar: 'طبّاخة منزلية', en: 'Home Cook' },
  cookDesc: { ar: 'حبوبتك تطبخ من بيتها، ونحن نوصّل وندفع لها. زوزو ترتّب كل شيء.', en: 'She cooks from home; we deliver and pay her. ZuZu handles everything.' },
  driverCard: { ar: 'سائق توصيل', en: 'Delivery Driver' },
  driverDesc: { ar: 'انضم لشبكتنا، خذ طلبات قريبة منك، ادفع لعائلتك بكرامة.', en: 'Join our network. Take nearby orders. Provide for your family.' },
  socialCard: { ar: 'برنامج الخير', en: 'Care Program' },
  socialDesc: { ar: 'للطلبة، كبار السن، اللاجئين والعمال — وجبات مدعومة بعد التحقق.', en: 'For students, elders, refugees, workers — subsidised meals after verification.' },
  joinCta: { ar: 'سجّلني مع زوزو', en: 'Register with ZuZu' },

  contactTitle: { ar: 'تواصلي معنا', en: 'Reach ZuZu' },
  hours: { ar: 'زوزو متاحة على مدار الساعة', en: 'ZuZu is available 24/7' },
  location: { ar: 'الرياض، المملكة العربية السعودية', en: 'Riyadh, Saudi Arabia' },
  callNow: { ar: 'اتصل الآن', en: 'Call now' },

  dedication: {
    ar: 'سُمّيت هذه المنصة باسم أُمّي زوزو — حفظها الله 💚\nمن يدِ يُمّه إلى كل سفرة في وطننا',
    en: "This platform is named after my mother, ZuZu — may God protect her 💚\nFrom Mama's hands to every table in our homeland",
  },
  chatWithMama: { ar: 'تكلّم مع زوزو', en: 'Talk to ZuZu' },
  closeChat: { ar: 'إغلاق', en: 'Close' },
} as const

type TKey = keyof typeof T

// ─── Typewriter ─────────────────────────────────────────────────────────────
function useTypewriter(text: string, speedMs = 90): string {
  const [out, setOut] = useState('')
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) {
      setOut(text)
      return
    }
    setOut('')
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setOut(text.slice(0, i))
      if (i >= text.length) window.clearInterval(id)
    }, speedMs)
    return () => window.clearInterval(id)
  }, [text, speedMs, reduce])
  return out
}

// ─── Components ─────────────────────────────────────────────────────────────

const Header: React.FC = () => {
  const { lang, toggle } = useLanguage()
  const t = (k: TKey) => T[k][lang]
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-cream/70 border-b border-gold/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-olive to-olive-dark flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-gold heartbeat" fill="currentColor" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-xl text-olive-dark font-bold">{t('brand')}</span>
            <span className="text-[10px] text-olive/70 tracking-wide">{t('bismillah')}</span>
          </div>
        </div>
        <button
          onClick={toggle}
          aria-label="Toggle language"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 hover:bg-white border border-gold/30 text-olive-dark text-sm font-medium transition"
        >
          <Languages className="w-4 h-4" />
          {lang === 'ar' ? 'EN' : 'عربي'}
        </button>
      </div>
    </header>
  )
}

const Hero: React.FC = () => {
  const { lang } = useLanguage()
  const t = (k: TKey) => T[k][lang]
  const line1 = useTypewriter(T.heroLine1[lang], 110)

  return (
    <section className="relative overflow-hidden min-h-[88vh] flex items-center">
      {/* mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-cream-warm to-rose-50" />
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-olive/15 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 w-[40vw] h-[40vw] rounded-full bg-rose-200/30 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-gold/30 text-olive-dark text-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-gold" />
          {t('slogan')}
        </motion.div>

        <h1 className="font-display font-bold leading-tight">
          <span className="block text-5xl md:text-7xl lg:text-8xl bg-gradient-to-br from-olive-dark via-olive to-gold bg-clip-text text-transparent min-h-[1.2em]">
            {line1}
            <span className="inline-block w-[2px] h-[0.9em] bg-olive align-middle ms-1 typewriter-caret" />
          </span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: T.heroLine1[lang].length * 0.11 + 0.3, duration: 1 }}
            className="block text-4xl md:text-6xl lg:text-7xl text-gold-dark mt-2"
          >
            {t('heroLine2')}
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-8 text-lg md:text-2xl text-olive-dark/80 max-w-2xl mx-auto"
        >
          {t('heroSub')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-l from-olive-dark to-olive text-cream font-medium text-lg shadow-lg shadow-olive/30 hover:shadow-xl hover:scale-[1.02] transition focus:outline-none focus:ring-4 focus:ring-olive/30"
          >
            <MessageCircle className="w-5 h-5 group-hover:rotate-[-6deg] transition" />
            {t('heroOrderCta')}
          </a>
          <a
            href="#menu"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white/80 border-2 border-gold text-olive-dark font-medium text-lg hover:bg-white transition focus:outline-none focus:ring-4 focus:ring-gold/30"
          >
            {t('heroVoiceCta')}
            <ChevronDown className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

const StorySection: React.FC = () => {
  const { lang } = useLanguage()
  const t = (k: TKey) => T[k][lang]
  const steps: Array<{ titleKey: TKey; bodyKey: TKey; emoji: string }> = [
    { titleKey: 'story1Title', bodyKey: 'story1Body', emoji: '🌾' },
    { titleKey: 'story2Title', bodyKey: 'story2Body', emoji: '🤲' },
    { titleKey: 'story3Title', bodyKey: 'story3Body', emoji: '🍽️' },
  ]
  return (
    <section className="py-24 bg-gradient-to-b from-cream-warm to-cream">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display text-4xl md:text-5xl text-center text-olive-dark mb-4 font-bold"
        >
          {t('storyTitle')}
        </motion.h2>
        <div className="w-24 h-1 bg-gradient-to-r from-gold to-olive mx-auto mb-16 rounded-full" />
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.titleKey}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-gold/20 shadow-sm hover:shadow-xl transition"
            >
              <div className="text-6xl mb-4 text-center">{s.emoji}</div>
              <h3 className="font-display text-2xl text-olive-dark font-bold text-center mb-3">
                {t(s.titleKey)}
              </h3>
              <p className="text-olive-dark/80 text-center leading-relaxed">{t(s.bodyKey)}</p>
              <div className="absolute -top-3 start-6 w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark text-cream flex items-center justify-center text-sm font-bold shadow">
                {i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const MenuCard: React.FC<{ item: MenuItem }> = ({ item }) => {
  const { lang } = useLanguage()
  const t = (k: TKey) => T[k][lang]
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gold/20 shadow-sm hover:shadow-2xl hover:border-gold/50 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-5xl select-none" aria-hidden>
          {item.emoji}
        </div>
        <div className="text-end">
          <div className="text-3xl font-display font-bold text-olive-dark">
            {item.price}
            <span className="text-base text-gold-dark ms-1">﷼</span>
          </div>
          <div className="text-[11px] text-olive/60 uppercase tracking-wider">{t('riyal')}</div>
        </div>
      </div>
      <h3 className="font-display text-2xl font-bold text-olive-dark mb-1">{item.nameAr}</h3>
      <p className="text-sm text-gold-dark/80 italic mb-3">{item.nameEn}</p>
      <p className="text-olive-dark/75 text-sm leading-relaxed mb-5 min-h-[2.5rem]">
        {item.descAr}
      </p>
      <a
        href={buildWhatsAppLink(item.nameAr)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t('orderItem')}: ${item.nameAr}`}
        className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-full bg-olive-dark/90 hover:bg-olive-dark text-cream text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-gold"
      >
        <MessageCircle className="w-4 h-4" />
        {t('orderItem')}
      </a>
    </motion.article>
  )
}

const MenuSection: React.FC = () => {
  const { lang } = useLanguage()
  const t = (k: TKey) => T[k][lang]
  const grouped = useMemo(() => {
    return {
      mains: menuItems.filter((i) => i.category === 'mains'),
      salads: menuItems.filter((i) => i.category === 'salads'),
      extras: menuItems.filter((i) => i.category === 'extras'),
    }
  }, [])

  const renderGroup = (title: string, items: MenuItem[]) => (
    <div className="mb-16 last:mb-0">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
        <h3 className="font-display text-2xl md:text-3xl text-olive-dark font-bold whitespace-nowrap">
          {title}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it) => (
          <MenuCard key={it.id} item={it} />
        ))}
      </div>
    </div>
  )

  return (
    <section id="menu" className="py-24 bg-gradient-to-b from-cream to-cream-warm">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl text-olive-dark font-bold mb-3">
            {t('menuTitle')}
          </h2>
          <p className="text-olive-dark/70 text-lg">{t('menuSub')}</p>
          <div className="w-24 h-1 bg-gradient-to-r from-gold to-olive mx-auto mt-4 rounded-full" />
        </motion.div>

        {renderGroup(t('catMains'), grouped.mains)}
        {renderGroup(t('catSalads'), grouped.salads)}
        {renderGroup(t('catExtras'), grouped.extras)}
      </div>
    </section>
  )
}

// Gallery — placeholders using gradient tiles.
// TODO(real-photos): drop real photos into /public/gallery/ and update this array.
const galleryTiles = [
  { id: 'g1', emoji: '🥬', label: 'ملوخية', gradient: 'from-emerald-700 via-emerald-500 to-lime-400' },
  { id: 'g2', emoji: '🍅', label: 'محشي', gradient: 'from-red-600 via-orange-500 to-amber-400' },
  { id: 'g3', emoji: '🍲', label: 'كمونية', gradient: 'from-amber-700 via-yellow-600 to-amber-400' },
  { id: 'g4', emoji: '🥒', label: 'سلطة روب', gradient: 'from-sky-300 via-cyan-200 to-emerald-200' },
  { id: 'g5', emoji: '🍆', label: 'سلطة أسود', gradient: 'from-purple-900 via-purple-700 to-fuchsia-500' },
  { id: 'g6', emoji: '🫓', label: 'كسرة', gradient: 'from-amber-200 via-yellow-100 to-orange-200' },
]

const GallerySection: React.FC = () => {
  const { lang } = useLanguage()
  const t = (k: TKey) => T[k][lang]
  const [open, setOpen] = useState<string | null>(null)
  const current = galleryTiles.find((g) => g.id === open)

  return (
    <section className="py-24 bg-olive-dark text-cream">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-3">{t('galleryTitle')}</h2>
          <p className="text-cream/70">{t('gallerySub')}</p>
          <div className="w-24 h-1 bg-gradient-to-r from-gold to-cream mx-auto mt-4 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryTiles.map((g, i) => (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => setOpen(g.id)}
              className={`aspect-square rounded-3xl bg-gradient-to-br ${g.gradient} flex flex-col items-center justify-center shadow-xl focus:outline-none focus:ring-4 focus:ring-gold/50`}
              aria-label={g.label}
            >
              <span className="text-6xl md:text-7xl">{g.emoji}</span>
              <span className="mt-2 text-cream font-display text-lg drop-shadow">{g.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(null)}
        >
          <button
            onClick={() => setOpen(null)}
            aria-label="Close"
            className="absolute top-6 end-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`max-w-2xl w-full aspect-square rounded-3xl bg-gradient-to-br ${current.gradient} flex flex-col items-center justify-center shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[12rem] leading-none">{current.emoji}</span>
            <span className="mt-4 text-cream font-display text-3xl">{current.label}</span>
          </motion.div>
        </div>
      )}
    </section>
  )
}

const ContactSection: React.FC = () => {
  const { lang } = useLanguage()
  const t = (k: TKey) => T[k][lang]
  return (
    <section className="py-24 bg-gradient-to-b from-cream-warm to-rose-50">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display text-4xl md:text-5xl text-olive-dark font-bold mb-3"
        >
          {t('contactTitle')}
        </motion.h2>
        <div className="w-24 h-1 bg-gradient-to-r from-gold to-olive mx-auto mb-10 rounded-full" />

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-gold/20">
            <Clock className="w-6 h-6 text-gold-dark mx-auto mb-2" />
            <div className="text-olive-dark/80 text-sm">{t('hours')}</div>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-gold/20">
            <MapPin className="w-6 h-6 text-gold-dark mx-auto mb-2" />
            <div className="text-olive-dark/80 text-sm">{t('location')}</div>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-gold/20">
            <Phone className="w-6 h-6 text-gold-dark mx-auto mb-2" />
            <a href={`tel:+${WHATSAPP_NUMBER}`} className="text-olive-dark font-semibold tracking-wide" dir="ltr">
              055 313 4696
            </a>
          </div>
        </div>

        <a
          href={buildWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-gradient-to-l from-olive-dark to-olive text-cream font-display text-xl shadow-2xl shadow-olive/40 hover:scale-[1.03] transition focus:outline-none focus:ring-4 focus:ring-olive/30"
        >
          <MessageCircle className="w-6 h-6" />
          {t('heroOrderCta')}
        </a>
      </div>
    </section>
  )
}

const Footer: React.FC = () => {
  const { lang } = useLanguage()
  const t = (k: TKey) => T[k][lang]
  return (
    <footer className="bg-olive-dark text-cream py-16">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.2 }}
          className="max-w-xl mx-auto"
        >
          <Heart className="w-10 h-10 mx-auto text-rose-300 heartbeat mb-4" fill="currentColor" />
          <p className="font-display text-lg md:text-xl leading-relaxed whitespace-pre-line">
            {t('dedication')}
          </p>
          <div className="mt-8 pt-6 border-t border-cream/10 text-cream/50 text-sm">
            © {new Date().getFullYear()} {t('brand')} · {t('slogan')}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

const FloatingMamaButton: React.FC = () => {
  const { lang } = useLanguage()
  const t = (k: TKey) => T[k][lang]
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.5, type: 'spring' }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 start-6 z-30 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-l from-gold to-gold-dark text-olive-dark font-display font-semibold shadow-2xl shadow-gold/40 hover:scale-105 transition focus:outline-none focus:ring-4 focus:ring-gold/30"
        aria-label={t('chatWithMama')}
      >
        <Sparkles className="w-5 h-5" />
        {t('chatWithMama')}
      </motion.button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full md:max-w-3xl h-[88vh] md:h-[80vh] bg-cream rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 bg-olive-dark text-cream">
              <div className="flex items-center gap-2 font-display">
                <Sparkles className="w-4 h-4 text-gold" />
                {t('chatWithMama')}
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label={t('closeChat')}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <Suspense fallback={<div className="p-8 text-center text-olive-dark/60">جاري التحميل…</div>}>
                <ZuZuAgent />
              </Suspense>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream text-olive-dark font-sans">
      <Header />
      <main>
        <Hero />
        <StorySection />
        <MenuSection />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingMamaButton />
    </div>
  )
}

export default LandingPage
