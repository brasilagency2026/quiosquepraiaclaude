import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

const ROLE_ROUTES = { cozinha: '/cozinha/', garcom: '/garcom/', caixa: '/caixa/', gestor: '/admin/' }

export default function LoginPIN() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)
  const loginPIN = useMutation(api.pinAuth.loginPIN)

  async function press(k) {
    if (loading) return
    if (k === '⌫') { setPin(p => p.slice(0, -1)); return }
    const newPin = pin + k
    setPin(newPin)
    if (newPin.length === 4) {
      setLoading(true)
      try {
        const result = await loginPIN({
          kiosqueSlug: slug,
          pin: newPin,
          dispositivo: navigator.userAgent.substring(0, 100),
        })
        localStorage.setItem('quiosquepraia_pin_token', result.token)
        localStorage.setItem('quiosquepraia_role', result.role)
        navigate(ROLE_ROUTES[result.role] + slug)
      } catch (e) {
        setErreur('PIN incorreto')
        setPin('')
        setTimeout(() => setErreur(''), 2000)
      } finally {
        setLoading(false)
      }
    }
  }

  const keys = [1,2,3,4,5,6,7,8,9,'','0','⌫']

  return (
    <div style={{
      minHeight: '100vh', background: '#0D2137',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px'
    }}>
      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 32, fontWeight: 800, color: '#F5E6C8', marginBottom: 4 }}>
        Quiosque <span style={{ color: '#00B4D8' }}>Praia</span>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Acesso da equipe</div>
      <div style={{ fontSize: 14, color: '#48CAE4', marginBottom: 40, background: 'rgba(0,180,216,0.1)', padding: '6px 16px', borderRadius: 20 }}>
        {slug}
      </div>

      {/* PIN dots */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 18, height: 18, borderRadius: '50%',
            background: i < pin.length ? '#06D6A0' : 'rgba(255,255,255,0.2)',
            transition: 'background 0.15s',
            transform: i < pin.length ? 'scale(1.2)' : 'scale(1)',
          }} />
        ))}
      </div>

      {erreur && (
        <div style={{ color: '#FF6B6B', fontSize: 14, marginBottom: 12, animation: 'shake 0.3s ease' }}>
          {erreur}
        </div>
      )}

      {loading && (
        <div style={{ color: '#48CAE4', fontSize: 14, marginBottom: 12 }}>Verificando...</div>
      )}

      {/* Keypad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, maxWidth: 240, width: '100%', marginBottom: 32 }}>
        {keys.map((k, i) => (
          <button key={i} onClick={() => k !== '' && press(String(k))}
            style={{
              height: 64, background: k === '' ? 'transparent' : 'rgba(255,255,255,0.08)',
              border: k === '' ? 'none' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, color: 'white',
              fontSize: k === '⌫' ? 20 : 26, fontWeight: 600,
              cursor: k === '' ? 'default' : 'pointer',
              transition: 'all 0.15s', fontFamily: 'Inter,sans-serif',
            }}>
            {k}
          </button>
        ))}
      </div>

      <a href={`/admin/${slug}/login`} style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
        Gestor? Entrar com email →
      </a>

      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
    </div>
  )
}
