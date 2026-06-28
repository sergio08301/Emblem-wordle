import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Infinite from './pages/Infinite'
import Barracks from './pages/Barracks'
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
            className="fixed top-0 left-0 w-full bg-cover bg-no-repeat sm:hidden"
            style={{ backgroundImage: "url('/FE_Expo_key_art_bg.png')", backgroundPosition: 'center 30%', height: '100lvh' }}
          />
          <div
            className="fixed top-0 left-0 w-full bg-cover bg-center bg-no-repeat hidden sm:block"
            style={{ backgroundImage: "url('/ending image.jpg')", height: '100lvh' }}
          />
          <div className="fixed top-0 left-0 w-full bg-black/80" style={{ height: '100lvh' }} />
          <div className="relative z-10 flex flex-col h-screen">
            <Navbar onHelpOpen={() => setShowHelp(true)} />
            <main className="flex-1 min-h-0 overflow-y-auto pt-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/infinite" element={<Infinite />} />
                <Route path="/barracks" element={<Barracks />} />
              </Routes>
            </main>
            {showHelp && <HowToPlayModal onClose={closeHelp} />}
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

