import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ZuZuAgent from './ai/ZuZuAgent'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ZuZuAgent />} />
      </Routes>
    </Router>
  )
}

export default App
