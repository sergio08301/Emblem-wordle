import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Infinite from './pages/Infinite'
import Navbar from './components/Navbar'
import HowToPlayModal from './components/HowToPlayModal'

const SEEN_KEY = 'emblem_wordle_seen_tutorial'

export default function App() {
  const [showHelp, setShowHelp] = useState(() => !localStorage.getItem(SEEN_KEY))

  function closeHelp() {
    localStorage.setItem(SEEN_KEY, '1')
    setShowHelp(false)
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="relative min-h-screen">
          <div
            className="fixed inset-0 bg-cover bg-no-repeat sm:hidden"
            style={{ backgroundImage: "url('/FE_Expo_key_art_bg.png')", backgroundPosition: 'center 30%' }}
          />
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat hidden sm:block"
            style={{ backgroundImage: "url('/ending image.jpg')" }}
          />
          <div className="fixed inset-0 bg-black/80" />
          <div className="relative z-10 flex flex-col h-screen">
            <Navbar onHelpOpen={() => setShowHelp(true)} />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/infinite" element={<Infinite />} />
              </Routes>
            </main>
            {showHelp && <HowToPlayModal onClose={closeHelp} />}
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

