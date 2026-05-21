/**
 * لُقْمَة يُمّه — Landing Page (Phase 2.5 — shadcn premium pass)
 *
 * Sections:
 *   1. SiteHeader (fixed glass pill)
 *   2. ZuzuVoiceHero (hero + orb)
 *   3. FeaturesGrid (what ZuZu does)
 *   4. HowItWorks (3-step strip)
 *   5. JoinCTA (cook / driver / care program)
 *   6. SiteFooter
 */

import React from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  ChefHat,
  Bike,
  CreditCard,
  ShieldCheck,
  HeartHandshake,
  Mic,
  Brain,
  Truck,
  ArrowRight,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import ZuzuVoiceHero from '@/components/voice/ZuzuVoiceHero'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// ─── Features grid ─────────────────────────────────────────────────────────
const FEATURES = {
  ar: [
    { icon: ShoppingBag, title: 'تأخذ الطلبات بالصوت', desc: 'العميل يتكلم كأنه يطلب من قريب — لا فورمات، لا تعقيد.' },
    { icon: ChefHat, title: 'تسجّل الطبّاخات', desc: 'بمكالمة واحدة، أم سارة تنضم وتفتح مطبخها السحابي.' },
    { icon: Bike, title: 'تنسّق مع السائقين', desc: 'تختار أقرب سائق، تتابع التوصيل، تتأكد من وصول اللُقمة دافية.' },
    { icon: CreditCard, title: 'تتابع المدفوعات', desc: 'حسابات شفافة لكل طبّاخة، فواتير لحظية، تحصيل آمن.' },
    { icon: ShieldCheck, title: 'تحمي الخصوصية', desc: 'هوياتٌ مُجزّأة، أرقامٌ مخفية، خصوصيةٌ صارمة.' },
    { icon: HeartHandshake, title: 'تساعد المحتاجين', desc: 'برنامج الخير يربط الطبّاخات بالأسر المحتاجة بكرامة.' },
  ],
  en: [
    { icon: ShoppingBag, title: 'Takes voice orders', desc: 'Customers speak naturally — no forms, no complexity.' },
    { icon: ChefHat, title: 'Onboards cooks', desc: 'One call, and Umm Sara joins to open her cloud kitchen.' },
    { icon: Bike, title: 'Coordinates drivers', desc: 'Picks the nearest driver, tracks delivery, ensures warm arrival.' },
    { icon: CreditCard, title: 'Tracks payments', desc: 'Transparent ledgers per cook, instant invoices, secure collection.' },
    { icon: ShieldCheck, title: 'Protects privacy', desc: 'Hashed IDs, masked phone numbers, strict data handling.' },
    { icon: HeartHandshake, title: 'Supports the needy', desc: 'Care Program connects cooks with families in need, with dignity.' },
  ],
} as const

const FeaturesGrid: React.FC = () => {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const items = FEATURES[lang]
  return (
    <section id="features" className="relative py-24 px-4">
      <div className="absolute inset-0 -z-10 bg-grid opacity-30" />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <Badge variant="olive" size="sm" className="mb-4">
            {isAr ? 'كيف تساعدك زوزو' : 'How ZuZu helps'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            {isAr ? 'وكيلٌ واحد، ستّ خدمات' : 'One agent, six superpowers'}
          </h2>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg leading-relaxed">
            {isAr
              ? 'كل ما تحتاجه حاضنة المطابخ السحابية، في صوتٍ دافئٍ واحد.'
              : 'Everything a cloud kitchen incubator needs — in one warm voice.'}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card variant="premium" className="h-full group hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 dark:from-gold-700/30 dark:to-gold-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5 text-gold-700 dark:text-gold-300" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2 text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How it works ──────────────────────────────────────────────────────────
const STEPS = {
  ar: [
    { icon: Mic, title: 'تكلّمي', desc: 'اضغطي على الدائرة وقولي لزوزو وش تبين.' },
    { icon: Brain, title: 'زوزو تفهم', desc: 'تختار المطبخ المناسب، تحجز، وتأكد التفاصيل.' },
    { icon: Truck, title: 'يوصلك دافي', desc: 'السائق يجي، اللُقمة تصل — كأنها من يد يُمّك.' },
  ],
  en: [
    { icon: Mic, title: 'Just speak', desc: 'Tap the orb and tell ZuZu what you want.' },
    { icon: Brain, title: 'ZuZu understands', desc: 'Picks the right kitchen, books it, confirms details.' },
    { icon: Truck, title: 'Warm to your door', desc: 'Driver arrives, bite arrives — as if from your mother.' },
  ],
} as const

const HowItWorks: React.FC = () => {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  return (
    <section className="relative py-24 px-4 bg-gradient-to-b from-background via-cream-50/40 to-background dark:via-olive-900/30">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 max-w-xl mx-auto"
        >
          <Badge variant="accent" size="sm" className="mb-4">
            {isAr ? 'بثلاث خطوات' : 'In three steps'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            {isAr ? 'كيف تشتغل لُقمة يُمّه؟' : 'How Loqmat Yummah works'}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line */}
          <div aria-hidden className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {STEPS[lang].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative text-center"
            >
              <div className="mx-auto w-24 h-24 mb-5 rounded-full glass-strong shadow-premium flex items-center justify-center relative">
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white text-xs font-bold flex items-center justify-center shadow">
                  {i + 1}
                </span>
                <Icon className="h-9 w-9 text-olive-700 dark:text-olive-300" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Join CTA ──────────────────────────────────────────────────────────────
const JOIN_CARDS = {
  ar: [
    {
      icon: ChefHat,
      title: 'طبّاخة منزلية',
      desc: 'افتحي مطبخك السحابي من بيتك. زوزو ترتّب التسجيل والمعدّات والتوصيل والمدفوعات.',
      cta: 'سجّليني',
      variant: 'accent' as const,
    },
    {
      icon: Bike,
      title: 'سائق توصيل',
      desc: 'انضم لشبكتنا، خذ طلبات قريبة منك، ادفع لعائلتك بكرامة.',
      cta: 'سجّلني',
      variant: 'outline' as const,
    },
    {
      icon: HeartHandshake,
      title: 'برنامج الخير',
      desc: 'وجبات مدعومة للطلبة، كبار السن، اللاجئين، والعمال — بعد التحقق.',
      cta: 'تعرّفي أكثر',
      variant: 'outline' as const,
    },
  ],
  en: [
    {
      icon: ChefHat,
      title: 'Home Cook',
      desc: 'Open your cloud kitchen from home. ZuZu handles signup, equipment, delivery, and payments.',
      cta: 'Sign me up',
      variant: 'accent' as const,
    },
    {
      icon: Bike,
      title: 'Delivery Driver',
      desc: 'Join our network. Take nearby orders. Provide for your family with dignity.',
      cta: 'Sign me up',
      variant: 'outline' as const,
    },
    {
      icon: HeartHandshake,
      title: 'Care Program',
      desc: 'Subsidised meals for students, elders, refugees, and workers — after verification.',
      cta: 'Learn more',
      variant: 'outline' as const,
    },
  ],
} as const

const JoinSection: React.FC = () => {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  return (
    <section id="join" className="relative py-24 px-4 overflow-hidden">
      <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] blob-gold opacity-50" />
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <Badge variant="glow" size="sm" className="mb-4">
            {isAr ? 'انضم إلينا' : 'Join us'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight">
            {isAr ? (
              <>
                كوني جزءاً من <span className="text-gradient-gold">العائلة</span>
              </>
            ) : (
              <>
                Become part of the <span className="text-gradient-gold">family</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg leading-relaxed">
            {isAr
              ? 'طبّاخة، سائق، أو شريك خير — زوزو ترحّب بكم'
              : 'Cook, driver, or partner-in-good — ZuZu welcomes you'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {JOIN_CARDS[lang].map(({ icon: Icon, title, desc, cta, variant }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Card variant="premium" className="h-full flex flex-col">
                <CardContent className="p-7 flex flex-col flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center mb-5 shadow-md">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-2xl mb-3">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">{desc}</p>
                  <Button variant={variant} className="rounded-full w-full group" asChild>
                    <a href="#zuzu-hero">
                      {cta}
                      <ArrowRight className={`h-4 w-4 transition-transform ${isAr ? 'group-hover:-translate-x-0.5 rotate-180' : 'group-hover:translate-x-0.5'}`} />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'

  // Sync dir attribute on body
  React.useEffect(() => {
    document.body.dir = isAr ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [isAr, lang])

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />
      <main>
        <ZuzuVoiceHero />
        <FeaturesGrid />
        <HowItWorks />
        <JoinSection />
      </main>
      <SiteFooter />
    </div>
  )
}

export default LandingPage
