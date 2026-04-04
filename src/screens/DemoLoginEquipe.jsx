import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PINS = {
  '1234': { role: 'cozinha', nom: 'Maria Silva', route: '/demo/cozinha' },
  '5678': { role: 'garcom', nom: 'João Santos', route: '/demo/garcom' },
}

export default function DemoLoginEquipe() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [erro, setErro] = useState('')
  const [shake, setShake] = useState(false)
  const [success, setSuccess] = useState(false)

  const keys = [1,2,3,4,5,6,7,8,9,'','0','⌫']

  function press(k) {
    if (success) return
    if (k === '⌫') { setPin(p => p.slice(0,-1)); return }
    const newPin = pin + k
    setPin(newPin)
    if (newPin.length === 4) {
      if (PINS[newPin]) {
        const { nom, role, route } = PINS[newPin]
        sessionStorage.setItem('demo_session', JSON.stringify({ nom, role }))
        setSuccess(true)
        setTimeout(() => navigate(route), 600)
      } else {
        setShake(true)
        setErro('PIN incorreto. Use 1234 ou 5678.')
        setTimeout(() => { setPin(''); setErro(''); setShake(false) }, 1500)
      }
    }
  }

  function fillPin(p) {
    setPin('')
    p.split('').forEach((d, i) => setTimeout(() => press(d), i * 150))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D2137', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }`}</style>

      <button onClick={() => navigate('/demo')} style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
        ← Demo
      </button>

      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 26, fontWeight: 800, color: '#F5E6C8', marginBottom: 4 }}>
        Quiosque <span style={{ color: '#00B4D8' }}>Praia</span>
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 36, fontFamily: 'Inter,sans-serif' }}>
        Acesso da Equipe · Demo
      </div>

      {/* Hints clicáveis */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { label: '👨‍🍳 Cozinha', pin: '1234', color: '#F59E0B' },
          { label: '🛵 Garçom', pin: '5678', color: '#06D6A0' },
        ].map(h => (
          <button key={h.pin} onClick={() => fillPin(h.pin)} style={{ background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${h.color}55`, borderRadius: 14, padding: '12px 20px', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit', transition: 'transform 0.15s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            <div style={{ fontSize: 13, color: h.color, fontWeight: 700, fontFamily: 'Inter,sans-serif', marginBottom: 4 }}>{h.label}</div>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '0.15em' }}>{h.pin}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontFamily: 'Inter,sans-serif' }}>clique para preencher</div>
          </button>
        ))}
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, animation: shake ? 'shake 0.4s ease' : 'none' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', background: i < pin.length ? (success ? '#06D6A0' : '#00B4D8') : 'rgba(255,255,255,0.1)', transition: 'background 0.15s', boxShadow: i < pin.length ? `0 0 12px ${success ? '#06D6A0' : '#00B4D8'}88` : 'none' }} />
        ))}
      </div>

      {erro && <div style={{ fontSize: 13, color: '#FF6B6B', marginBottom: 12, fontFamily: 'Inter,sans-serif', fontWeight: 600 }}>{erro}</div>}
      {success && <div style={{ fontSize: 13, color: '#06D6A0', marginBottom: 12, fontFamily: 'Inter,sans-serif', fontWeight: 600 }}>✅ Entrando...</div>}
      {!erro && !success && <div style={{ height: 24, marginBottom: 0 }} />}

      {/* Teclado */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%', maxWidth: 280, marginTop: 8 }}>
        {keys.map((k, i) => (
          <button key={i} onClick={() => k !== '' && press(String(k))} style={{
            height: 68, background: k === '' ? 'transparent' : 'rgba(255,255,255,0.07)',
            border: 'none', borderRadius: 14,
            fontFamily: k === '⌫' ? 'Inter,sans-serif' : "'Baloo 2',cursive",
            fontSize: k === '⌫' ? 22 : 28, fontWeight: 700,
            color: k === '' ? 'transparent' : 'white',
            cursor: k === '' ? 'default' : 'pointer',
            transition: 'background 0.1s',
          }}
            onMouseDown={e => { if (k !== '') e.currentTarget.style.background = 'rgba(0,180,216,0.25)' }}
            onMouseUp={e => { if (k !== '') e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}>
            {k}
          </button>
        ))}
      </div>
    </div>
  )
}
