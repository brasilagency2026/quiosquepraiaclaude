import { useState } from 'react'
import { useToast } from '../context/ToastContext'

const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

const METODOS = [
  { id: 'pix', icon: '💰', label: 'PIX', desc: 'Aprovação instantânea', badge: 'Recomendado' },
  { id: 'credit', icon: '💳', label: 'Cartão de Crédito', desc: 'Até 12x sem juros' },
  { id: 'debit', icon: '🏦', label: 'Cartão de Débito', desc: 'Débito automático' },
]

export default function Pagamento({ total, cart, onBack, onConfirm }) {
  const [metodo, setMetodo] = useState('pix')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  async function handlePagar() {
    setLoading(true)
    showToast('⏳ Processando pagamento...')
    // Simula aprovação (integrar MercadoPago real aqui)
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
    onConfirm(metodo)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--ocean)', padding: '20px 20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 20 }}>←</button>
        <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: 'var(--sand)' }}>Pagamento</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 100px' }}>
        {/* Resumo */}
        <div className="card" style={{ marginBottom: 20 }}>
          {cart.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 6 }}>
              <span>{item.qty}× {item.emoji} {item.nom}</span>
              <span>{fmt(item.prix * item.qty)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: 'var(--ocean)' }}>
            <span>Total</span><span>{fmt(total)}</span>
          </div>
        </div>

        <p className="section-title">Forma de Pagamento</p>
        {METODOS.map(m => (
          <div key={m.id} onClick={() => setMetodo(m.id)} style={{
            background: 'white', border: `2px solid ${metodo === m.id ? 'var(--wave)' : 'transparent'}`,
            borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer', transition: 'all 0.2s', marginBottom: 12,
            boxShadow: 'var(--shadow-card)',
            background: metodo === m.id ? '#EBF9FD' : 'white'
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{m.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.desc}</div>
            </div>
            {m.badge && (
              <span style={{ background: '#00B4D8', color: 'white', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{m.badge}</span>
            )}
          </div>
        ))}

        {metodo === 'pix' && <PixSection total={total} />}
        {(metodo === 'credit' || metodo === 'debit') && <CardSection />}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 600, background: '#F0F7FF', padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', boxShadow: '0 -4px 24px rgba(13,33,55,0.1)' }}>
        <button className="btn-primary" onClick={handlePagar} disabled={loading}>
          {loading ? '⏳ Processando...' : metodo === 'pix' ? '✅ Confirmar Pagamento PIX' : '💳 Pagar com MercadoPago'}
        </button>
      </div>
    </div>
  )
}

function PixSection({ total }) {
  const { showToast } = useToast()
  const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')
  const pixKey = '00020126580014br.gov.bcb.pix0136praiapp@pix.com.br'

  // Generate simple QR pattern
  const cells = Array.from({ length: 81 }, (_, i) => {
    const corners = [0,1,2,18,20,36,37,38,6,7,8,24,26,42,43,44,54,55,56,72,74,60,61,62,78,80,79]
    return corners.includes(i) || Math.random() > 0.45
  })

  return (
    <div style={{ background: 'white', borderRadius: 24, padding: 24, textAlign: 'center', boxShadow: 'var(--shadow-card)', marginTop: 8 }}>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Escaneie o QR Code ou copie a chave</p>
      <div style={{ width: 180, height: 180, background: 'var(--surface)', border: '3px solid var(--ocean)', borderRadius: 16, margin: '16px auto', display: 'grid', gridTemplateColumns: 'repeat(9,1fr)', gap: 2, padding: 12 }}>
        {cells.map((f, i) => <div key={i} style={{ borderRadius: 1, background: f ? 'var(--ocean)' : 'transparent' }} />)}
      </div>
      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: 'var(--ocean)' }}>{fmt(total)}</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PraiaApp · CNPJ 00.000.000/0001-00</p>
      <button onClick={() => { navigator.clipboard?.writeText(pixKey); showToast('📋 Chave PIX copiada!') }}
        style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: 'var(--ocean)', cursor: 'pointer', width: '100%', marginTop: 12, fontWeight: 600, fontFamily: 'Inter,sans-serif' }}>
        📋 Copiar Chave PIX
      </button>
    </div>
  )
}

function CardSection() {
  return (
    <div className="card" style={{ marginTop: 8 }}>
      <div className="form-group">
        <label className="form-label">Número do Cartão</label>
        <input className="form-input" placeholder="0000 0000 0000 0000" maxLength={19} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Validade</label>
          <input className="form-input" placeholder="MM/AA" maxLength={5} />
        </div>
        <div className="form-group">
          <label className="form-label">CVV</label>
          <input className="form-input" placeholder="123" maxLength={3} type="number" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Nome no Cartão</label>
        <input className="form-input" placeholder="Como impresso no cartão" />
      </div>
    </div>
  )
}
