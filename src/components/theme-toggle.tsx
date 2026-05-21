import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/LanguageContext"

/**
 * Cycles: light → dark → system → light...
 * Icon reflects RESOLVED theme (light/dark) plus a tiny dot when on "system".
 */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { lang } = useLanguage()
  const isAr = lang === "ar"

  // Avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const onClick = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" className={className} aria-label="Theme">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const isSystem = theme === "system"
  const isDark = resolvedTheme === "dark"

  const label = isAr
    ? isSystem
      ? "النظام"
      : isDark
      ? "ليلي"
      : "نهاري"
    : isSystem
    ? "System"
    : isDark
    ? "Dark"
    : "Light"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          className={className}
          aria-label={`Theme: ${label}`}
        >
          <span className="relative inline-flex items-center justify-center">
            {isSystem ? (
              <Monitor className="h-4 w-4" />
            ) : isDark ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isAr ? "المظهر" : "Theme"}: {label}
      </TooltipContent>
    </Tooltip>
  )
}
