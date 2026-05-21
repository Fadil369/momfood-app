import React from "react"
import { Heart, Github, Mail, Phone } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/LanguageContext"

export const SiteFooter: React.FC = () => {
  const { lang } = useLanguage()
  const isAr = lang === "ar"
  return (
    <footer className="relative border-t border-border/60 bg-gradient-to-b from-background to-cream-50/40 dark:to-olive-900/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-white">
                <Heart className="h-4 w-4 fill-current" />
              </span>
              <span className="text-base font-display font-bold">
                {isAr ? "لُقْمَة يُمّه" : "Loqmat Yummah"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {isAr
                ? "حاضنة المطابخ السحابية للطبّاخات المنزليات. كل لُقمة قصة أُم."
                : "A cloud-kitchen incubator for home cooks. Every bite is a mother's story."}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {isAr ? "روابط" : "Links"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a className="text-foreground/80 hover:text-foreground transition" href="#zuzu-hero">
                  {isAr ? "تحدثي مع زوزو" : "Talk to ZuZu"}
                </a>
              </li>
              <li>
                <a className="text-foreground/80 hover:text-foreground transition" href="#features">
                  {isAr ? "ما تقدمه المنصة" : "What we do"}
                </a>
              </li>
              <li>
                <a className="text-foreground/80 hover:text-foreground transition" href="#join">
                  {isAr ? "كوني طباخة" : "Become a cook"}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {isAr ? "تواصل" : "Contact"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gold-600" />
                <a href="tel:+966553134696" className="text-foreground/80 hover:text-foreground">
                  +966 55 313 4696
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gold-600" />
                <a href="mailto:hello@elfadil.com" className="text-foreground/80 hover:text-foreground">
                  hello@elfadil.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Github className="h-3.5 w-3.5 text-gold-600" />
                <a
                  href="https://github.com/Fadil369/momfood-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-foreground"
                >
                  Fadil369/momfood-app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {isAr ? "لُقْمَة يُمّه" : "Loqmat Yummah"} ·
            {isAr ? " صُنع بـ" : " Built with"}{" "}
            <Heart className="inline h-3 w-3 fill-rose-500 text-rose-500" />{" "}
            {isAr ? "في الرياض" : "in Riyadh"}
          </p>
          <p>
            {isAr
              ? "زوزو سُمّيت على والدة د. محمد الفاضل 💚"
              : "ZuZu is named after Dr. Mohammed Al-Fadil's mother 💚"}
          </p>
        </div>
      </div>
    </footer>
  )
}
