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

  const keys = [1,2,3,4,5,6,7,8,9,'','0','⌫']

  function press(k) {
    if (k === '⌫') { setPin(p => p.slice(0, -1)); return }
    const newPin = pin + k
    setPin(newPin)
    if (newPin.length === 4) {
      if (PINS[newPin]) {
        const { nom, role, route } = PINS[newPin]
        // Salvar sessão demo
        sessionStorage.setItem('demo_session', JSON.stringify({ nom, role }))
        setTimeout(() => navigate(route), 400)
      } else {
        setShake(true)
        setErro('PIN incorreto. Use 1234 ou 5678.')
        setTimeout(() => { setPin(''); setErro(''); setShake(false) }, 1500)
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D2137', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

      <button onClick={() => navigate('/demo')} style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
        ← Demo
      </button>

      {/* Logo */}
      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 26, fontWeight: 800, color: '#F5E6C8', marginBottom: 4 }}>
        Quiosque <span style={{ color: '#00B4D8' }}>Praia</span>
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 40, fontFamily: 'Inter,sans-serif' }}>
        Acesso da Equipe · Demo
      </div>

      {/* Hints */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { role: '👨‍🍳 Cozinha', pin: '1234', color: '#F59E0B' },
          { role: '🛵 Garçom', pin: '5678', color: '#06D6A0' },
        ].map(h => (
          <div key={h.pin} onClick={() => { setPin(''); setTimeout(() => { [h.pin[0],h.pin[1],h.pin[2],h.pin[3]].forEach((d, i) => setTimeout(() => press(d), i * 150)) }, 50) }} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${h.color}44`, borderRadius: 12, padding: '10px 18px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            <div style={{ fontSize: 13, color: h.color, fontWeight: 700, fontFamily: 'Inter,sans-serif' }}>{h.role}</div>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '0.1em', marginTop: 2 }}>{h.pin}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2, fontFamily: 'Inter,sans-serif' }}>clique para preencher</div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 32, animation: shake ? 'shake 0.4s ease' : 'none' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i < pin.length ? '#00B4D8' : 'rgba(255,255,255,0.1)', transition: 'background 0.15s', boxShadow: i < pin.length ? '0 0 10px rgba(0,180,216,0.5)' : 'none' }} />
        ))}
      </div>

      {/* Erro */}
      {erro && <div style={{ fontSize: 13, color: '#FF6B6B', marginBottom: 16, fontFamily: 'Inter,sans-serif', fontWeight: 600, textAlign: 'center' }}>{erro}</div>}

      {/* Teclado */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%', maxWidth: 280 }}>
        {keys.map((k, i) => (
          <button key={i} onClick={() => k !== '' && press(String(k))} style={{
            height: 68, background: k === '' ? 'transparent' : k === '⌫' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.07)',
            border: 'none', borderRadius: 14,
            fontFamily: k === '⌫' ? 'Inter,sans-serif' : "'Baloo 2',cursive",
            fontSize: k === '⌫' ? 20 : 26, fontWeight: 700,
            color: k === '' ? 'transparent' : 'white',
            cursor: k === '' ? 'default' : 'pointer',
            transition: 'background 0.1s',
          }}
            onMouseDown={e => { if (k !== '') e.currentTarget.style.background = 'rgba(0,180,216,0.2)' }}
            onMouseUp={e => { if (k !== '') e.currentTarget.style.background = k === '⌫' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.07)' }}>
            {k}
          </button>
        ))}
      </div>

      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }`}</style>
    </div>
  )
}
