import { useState } from 'react'

const CORRECT_PIN = (import.meta.env.VITE_ACCESS_PIN || '').trim()
const STORAGE_KEY = 'ip_authed'

function checkStored() {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export default function PinGate({ children }) {
  const [unlocked, setUnlocked] = useState(checkStored)
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  const handleDigit = (d) => {
    if (pin.length >= 6) return
    const next = pin + d
    setPin(next)
    if (next.length === CORRECT_PIN.length) {
      if (next === CORRECT_PIN) {
        localStorage.setItem(STORAGE_KEY, 'true')
        setUnlocked(true)
      } else {
        setShake(true)
        setTimeout(() => {
          setPin('')
          setShake(false)
        }, 600)
      }
    }
  }

  const handleDelete = () => setPin(p => p.slice(0, -1))

  if (unlocked) return children

  const dots = Array.from({ length: CORRECT_PIN.length }, (_, i) => i)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1117] px-6">
      <div className="mb-8 text-center">
        <p className="text-2xl font-bold text-white mb-1">Iannelli Photography</p>
        <p className="text-sm text-slate-500">Enter your access PIN to continue</p>
      </div>

      {/* Dots */}
      <div className={`flex gap-4 mb-10 ${shake ? 'animate-shake' : ''}`}>
        {dots.map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-colors duration-150 ${
              i < pin.length
                ? 'bg-blue-500 border-blue-500'
                : 'bg-transparent border-slate-600'
            }`}
          />
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
        {[1,2,3,4,5,6,7,8,9].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(String(d))}
            className="h-16 rounded-2xl bg-[#1a1d27] border border-[#2a2d3a] text-white text-2xl font-semibold active:bg-[#2a2d3a] transition-colors"
          >
            {d}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleDigit('0')}
          className="h-16 rounded-2xl bg-[#1a1d27] border border-[#2a2d3a] text-white text-2xl font-semibold active:bg-[#2a2d3a] transition-colors"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="h-16 rounded-2xl bg-[#1a1d27] border border-[#2a2d3a] text-slate-400 text-lg active:bg-[#2a2d3a] transition-colors flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
          90% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.6s ease-in-out; }
      `}</style>
    </div>
  )
}
