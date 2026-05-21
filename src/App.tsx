import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import LandingPage from './pages/LandingPage'

const ZuZuAgent = lazy(() => import('./ai/ZuZuAgent'))

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/assistant"
            element={
              <Suspense fallback={<div className="p-8 text-center">جاري التحميل…</div>}>
                <ZuZuAgent />
              </Suspense>
            }
          />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App
