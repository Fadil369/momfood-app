import React from "react"
import { motion } from "framer-motion"
import { Languages, Sparkles, Github, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/LanguageContext"

interface SiteHeaderProps {
  onScrollToHero?: () => void
}

export const SiteHeader: React.FC<SiteHeaderProps> = () => {
  const { lang, toggle } = useLanguage()
  const isAr = lang === "ar"

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-40"
    >
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="glass-strong rounded-full shadow-premium px-3 py-2 flex items-center justify-between">
          {/* Brand */}
          <a href="#zuzu-hero" className="flex items-center gap-2.5 pl-2">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-white shadow-sm">
              <Heart className="h-4 w-4 fill-current" />
              <span className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 opacity-30 blur-md" />
            </span>
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-display font-bold text-foreground">
                {isAr ? "لُقْمَة يُمّه" : "Loqmat Yummah"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {isAr ? "حاضنة المطابخ السحابية" : "Cloud kitchen incubator"}
              </span>
            </span>
          </a>

          {/* Center badge */}
          <Badge variant="glow" size="sm" className="hidden md:inline-flex">
            <Sparkles className="h-3 w-3" />
            {isAr ? "زوزو • الإصدار التجريبي" : "ZuZu • beta"}
          </Badge>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              className="rounded-full"
              aria-label="Toggle language"
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">{isAr ? "EN" : "العربية"}</span>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="rounded-full hidden sm:inline-flex"
              aria-label="GitHub"
            >
              <a
                href="https://github.com/Fadil369/momfood-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="accent" size="sm" className="rounded-full shadow-md" asChild>
              <a href="#zuzu-hero">{isAr ? "جربي زوزو" : "Try ZuZu"}</a>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
