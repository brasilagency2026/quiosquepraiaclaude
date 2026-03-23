import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

const KIOSQUES_DEMO = [
  { slug: 'brisa-do-mar-guaruja-sp', nom: 'Brisa do Mar', ville: 'Guarujá · SP' },
  { slug: 'areia-branca-ubatuba-sp', nom: 'Areia Branca', ville: 'Ubatuba · SP' },
  { slug: 'sol-nascente-florianopolis-sc', nom: 'Sol Nascente', ville: 'Florianópolis · SC' },
]

const PARASOLS_DEMO = Array.from({ length: 15 }, (_, i) =>
  `GS-${String(i + 1).padStart(2, '0')}`
)

export default function ScanQR() {
  const navigate = useNavigate()
  const [detected, setDetected] = useState(false)
  const [detectedInfo, setDetectedInfo] = useState(null)
  const [showManual, setShowManual] = useState(false)
  const [kiosqueSlug, setKiosqueSlug] = useState('')
  const [parasol, setParasol] = useState('')
  const gridRef = useRef(null)
  const timerRef = useRef(null)

  // Générer grille QR animée
  useEffect(() => {
    if (gridRef.current) {
      const cells = Array.from({ length: 121 }, (_, i) => {
        const corners = [0, 1, 2, 10, 11, 12, 22, 110, 120, 108, 109, 118]
        return corners.includes(i) || Math.random() > 0.48
      })
      gridRef.current.innerHTML = cells
        .map(f => `<div style="border-radius:1px;background:rgba(255,255,255,${f ? 0.88 : 0})"></div>`)
        .join('')
    }
    // Simuler détection auto après 3s
    timerRef.current = setTimeout(() => {
      triggerDetection('brisa-do-mar-guaruja-sp', 'GS-12', 'Brisa do Mar', 'Guarujá · SP')
    }, 3000)
    return () => clearTimeout(timerRef.current)
  }, [])

  function triggerDetection(slug, parasol, nom, ville) {
    clearTimeout(timerRef.current)
    setDetected(true)
    setDetectedInfo({ slug, parasol, nom, ville })
  }

  function enterKiosque() {
    if (!detectedInfo) return
    navigate(`/${detectedInfo.slug}/${detectedInfo.parasol}`)
  }

  function confirmManual() {
    if (!kiosqueSlug || !parasol) return
    const k = KIOSQUES_DEMO.find(k => k.slug === kiosqueSlug)
    triggerDetection(kiosqueSlug, parasol, k?.nom || kiosqueSlug, k?.ville || '')
    setShowManual(false)
    setTimeout(enterKiosque, 600)
  }

  const corners = [
    { pos: 'top:0;left:0', border: '3px 0 0 3px', radius: '12px 0 0 0' },
    { pos: 'top:0;right:0', border: '3px 3px 0 0', radius: '0 12px 0 0' },
    { pos: 'bottom:0;left:0', border: '0 0 3px 3px', radius: '0 0 0 12px' },
    { pos: 'bottom:0;right:0', border: '0 3px 3px 0', radius: '0 0 12px 0' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#061524 0%,#0D2137 45%,#1A3A5C 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden'
    }}>
      {/* Wave bg */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, opacity: 0.08 }}
        viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path fill="rgba(0,180,216,0.5)" d="M0,80 C360,160 1080,0 1440,80 L1440,200 L0,200 Z" />
        <path fill="rgba(0,180,216,0.3)" d="M0,120 C360,60 1080,180 1440,120 L1440,200 L0,200 Z" />
      </svg>

      {/* Logo */}
      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 32, fontWeight: 800, color: '#F5E6C8', marginBottom: 4, position: 'relative', zIndex: 1 }}>
        Praia<span style={{ color: '#00B4D8' }}>App</span>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 36, letterSpacing: '0.04em', position: 'relative', zIndex: 1 }}>
        Sistema de pedidos para quiosques de praia
      </div>

      {/* Viewfinder */}
      <div style={{ width: 220, height: 220, position: 'relative', margin: '0 auto 20px', zIndex: 1 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 22,
          background: detected ? 'rgba(6,214,160,0.13)' : 'rgba(255,255,255,0.04)',
          boxShadow: detected ? 'inset 0 0 0 2px #06D6A0' : 'none',
          overflow: 'hidden', transition: 'all 0.4s'
        }}>
          {/* Scan line */}
          {!detected && (
            <div style={{
              position: 'absolute', left: 14, right: 14, height: 2,
              background: 'linear-gradient(90deg,transparent,#00B4D8,#06D6A0,#00B4D8,transparent)',
              borderRadius: 2, boxShadow: '0 0 14px rgba(0,180,216,0.7)',
              animation: 'scan-sweep 2.4s ease-in-out infinite', top: 14, zIndex: 2
            }} />
          )}
          {detected && (
            <div style={{
              position: 'absolute', left: 14, right: 14, height: 2, top: '50%',
              background: 'linear-gradient(90deg,transparent,#06D6A0,#06D6A0,transparent)',
              boxShadow: '0 0 16px rgba(6,214,160,0.9)', borderRadius: 2
            }} />
          )}
          {/* QR grid */}
          <div ref={gridRef} style={{
            position: 'absolute', inset: 22,
            display: 'grid', gridTemplateColumns: 'repeat(11,1fr)', gap: '1.5px',
            opacity: detected ? 0.5 : 0,
            animation: detected ? 'none' : 'qr-appear 2.4s ease-in-out infinite'
          }} />
        </div>
        {/* Corners */}
        {corners.map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: 34, height: 34,
            borderColor: detected ? '#06D6A0' : '#00B4D8',
            borderStyle: 'solid', borderWidth: c.border,
            borderRadius: c.radius, zIndex: 3, transition: 'border-color 0.4s',
            ...Object.fromEntries(c.pos.split(';').map(p => p.split(':')))
          }} />
        ))}
      </div>

      {/* Status */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 20px', borderRadius: 50, fontSize: 13, fontWeight: 600,
        marginBottom: 20, zIndex: 1, position: 'relative',
        background: detected ? 'rgba(6,214,160,0.15)' : 'rgba(255,255,255,0.06)',
        color: detected ? '#06D6A0' : 'rgba(255,255,255,0.45)',
        border: `1px solid ${detected ? 'rgba(6,214,160,0.4)' : 'rgba(255,255,255,0.1)'}`,
        transition: 'all 0.4s'
      }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%', background: 'currentColor',
          animation: detected ? 'none' : 'blink 1.2s ease-in-out infinite'
        }} />
        {detected ? 'QR Code reconhecido!' : 'Aponte para o QR do guarda-sol'}
      </div>

      {/* Simulate button */}
      {!detected && (
        <button
          onClick={() => triggerDetection('brisa-do-mar-guaruja-sp', 'GS-12', 'Brisa do Mar', 'Guarujá · SP')}
          style={{
            background: 'rgba(0,180,216,0.18)', border: '1.5px solid rgba(0,180,216,0.4)',
            color: '#48CAE4', borderRadius: 50, padding: '10px 22px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter,sans-serif', marginBottom: 16,
            position: 'relative', zIndex: 1
          }}>
          ▶ Simular leitura do QR Code
        </button>
      )}

      {/* Detected card */}
      {detected && detectedInfo && (
        <div style={{
          background: 'rgba(6,214,160,0.12)', border: '1px solid rgba(6,214,160,0.3)',
          borderRadius: 18, padding: '16px 20px', margin: '0 auto 20px',
          maxWidth: 320, zIndex: 1, position: 'relative', animation: 'fade-up 0.35s ease',
          width: '100%'
        }}>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#F5E6C8', marginBottom: 4 }}>
            🌊 {detectedInfo.nom}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{detectedInfo.ville}</div>
          <div style={{ fontSize: 14, color: '#06D6A0', fontWeight: 600 }}>
            🏖️ Guarda-Sol {detectedInfo.parasol} detectado
          </div>
        </div>
      )}

      {/* CTA */}
      {detected && (
        <button className="btn-primary" onClick={enterKiosque}
          style={{ maxWidth: 320, position: 'relative', zIndex: 1 }}>
          🍻 Abrir Cardápio
        </button>
      )}

      {/* Manual */}
      <button onClick={() => setShowManual(v => !v)}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.33)',
          fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif',
          textDecoration: 'underline', textUnderlineOffset: 3,
          marginTop: 12, zIndex: 1, position: 'relative'
        }}>
        Digitar manualmente ↓
      </button>

      {showManual && (
        <div style={{ width: '100%', maxWidth: 320, margin: '18px auto 0', zIndex: 1, position: 'relative', animation: 'fade-up 0.3s ease' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.38)', textAlign: 'left', marginBottom: 6, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Selecione o quiosque</div>
          <select value={kiosqueSlug} onChange={e => { setKiosqueSlug(e.target.value); setParasol('') }}
            style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(0,180,216,0.25)', borderRadius: 14, padding: '13px 16px', color: 'white', fontSize: 15, fontFamily: 'Inter,sans-serif', marginBottom: 10, outline: 'none', appearance: 'none' }}>
            <option value="">— escolha o quiosque —</option>
            {KIOSQUES_DEMO.map(k => (
              <option key={k.slug} value={k.slug}>{k.nom} · {k.ville}</option>
            ))}
          </select>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.38)', textAlign: 'left', marginBottom: 6, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Guarda-sol</div>
          <select value={parasol} onChange={e => setParasol(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(0,180,216,0.25)', borderRadius: 14, padding: '13px 16px', color: 'white', fontSize: 15, fontFamily: 'Inter,sans-serif', marginBottom: 10, outline: 'none', appearance: 'none' }}>
            <option value="">— escolha o guarda-sol —</option>
            {kiosqueSlug && PARASOLS_DEMO.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={confirmManual} style={{ marginTop: 4 }}>
            ✅ Confirmar e Ver Cardápio
          </button>
        </div>
      )}

      <style>{`
        @keyframes scan-sweep { 0%{top:14px;opacity:1} 86%{top:198px;opacity:1} 100%{top:198px;opacity:0} }
        @keyframes qr-appear { 0%,65%{opacity:0} 78%,90%{opacity:0.3} 100%{opacity:0} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fade-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        select option { background: #0D2137; color: white; }
      `}</style>
    </div>
  )
}
