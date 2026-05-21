import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import LandingPage from './pages/LandingPage'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

const ZuZuAgent = lazy(() => import('./ai/ZuZuAgent'))

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider delayDuration={200}>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/assistant"
                element={
                  <Suspense fallback={<div className="p-8 text-center text-muted-foreground">جاري التحميل…</div>}>
                    <ZuZuAgent />
                  </Suspense>
                }
              />
            </Routes>
          </Router>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
