"use client"

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

/**
 * Theme provider for لُقمة يُمّه.
 * Wraps next-themes with our defaults:
 *   - attribute="class"  → toggles `class="dark"` on <html>
 *   - defaultTheme="system" → respect OS preference on first visit
 *   - enableSystem=true
 *   - storageKey="loqma-theme"
 *   - disableTransitionOnChange to avoid color flash on toggle
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="loqma-theme"
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
