import { useState } from 'react'
import { useToast } from '../context/ToastContext'

const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

const METODOS = [
  { id: 'pix',      icon: '💰', label: 'PIX',              desc: 'Aprovação instantânea',  badge: 'Recomendado' },
  { id: 'credit',   icon: '💳', label: 'Cartão de Crédito', desc: 'Até 12x sem juros' },
  { id: 'debit',    icon: '🏦', label: 'Cartão de Débito',  desc: 'Débito automático' },
  { id: 'dinheiro', icon: '💵', label: 'Dinheiro',          desc: 'Garçom vem buscar o pagamento' },
]

export default function Pagamento({ total, cart, onBack, onConfirm }) {
  const [metodo, setMetodo] = useState('pix')
  const [loading, setLoading] = useState(false)
  const [dinheiroOferecido, setDinheiroOferecido] = useState('')
  const { showToast } = useToast()

  const valorOferecido = parseFloat(dinheiroOferecido) || 0
  const troco = valorOferecido >= total ? valorOferecido - total : null
  const trocoNegativo = dinheiroOferecido !== '' && valorOferecido < total

  async function handlePagar() {
    if (metodo === 'dinheiro') {
      if (!dinheiroOferecido || valorOferecido < total) {
        showToast('⚠️ Informe um valor maior ou igual ao total'); return
      }
      onConfirm('dinheiro', { dinheiroOferecido: valorOferecido, troco: troco ?? 0 })
      return
    }
    setLoading(true)
    showToast('⏳ Processando pagamento...')
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
    onConfirm(metodo)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--ocean)', padding: '20px 20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 20 }}>←</button>
        <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: 'var(--sand)' }}>Pagamento</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 140px' }}>
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
            border: `2px solid ${metodo === m.id ? 'var(--wave)' : 'transparent'}`,
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
            {m.badge && <span style={{ background: '#00B4D8', color: 'white', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{m.badge}</span>}
          </div>
        ))}

        {metodo === 'pix' && <PixSection total={total} />}
        {(metodo === 'credit' || metodo === 'debit') && <CardSection />}
        {metodo === 'dinheiro' && (
          <DinheiroSection
            total={total}
            dinheiroOferecido={dinheiroOferecido}
            setDinheiroOferecido={setDinheiroOferecido}
            troco={troco}
            trocoNegativo={trocoNegativo}
          />
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 600, background: '#F0F7FF', padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', boxShadow: '0 -4px 24px rgba(13,33,55,0.1)' }}>
        {metodo === 'dinheiro' && troco !== null && (
          <div style={{ background: '#06D6A0', borderRadius: 12, padding: '10px 16px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 14, fontWeight: 700, color: '#0D2137' }}>Troco a receber</span>
            <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#0D2137' }}>{fmt(troco)}</span>
          </div>
        )}
        <button className="btn-primary" onClick={handlePagar}
          disabled={loading || (metodo === 'dinheiro' && (trocoNegativo || !dinheiroOferecido))}>
          {loading ? '⏳ Aguarde...' :
           metodo === 'pix' ? '✅ Confirmar PIX' :
           metodo === 'dinheiro' ? '📣 Chamar Garçom para Pagar' :
           '💳 Pagar com Cartão'}
        </button>
      </div>
    </div>
  )
}

function DinheiroSection({ total, dinheiroOferecido, setDinheiroOferecido, troco, trocoNegativo }) {
  // Sugestões de valores
  const notas = [2, 5, 10, 20, 50, 100, 200]
  const sugeridas = []
  for (const n of notas) {
    const mult = Math.ceil(total / n) * n
    if (mult >= total && !sugeridas.includes(mult)) sugeridas.push(mult)
    if (sugeridas.length >= 5) break
  }

  return (
    <div style={{ background: 'white', borderRadius: 24, padding: 20, boxShadow: 'var(--shadow-card)', marginTop: 8 }}>
      <div style={{ background: '#FFF9E6', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>📣</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 2 }}>Pagamento em dinheiro</p>
          <p style={{ fontSize: 12, color: '#78350F', lineHeight: 1.5 }}>Um garçom virá até o seu guarda-sol para receber o pagamento e trazer o troco.</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Total a pagar</p>
        <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 36, fontWeight: 800, color: 'var(--ocean)' }}>{fmt(total)}</p>
      </div>

      <div className="form-group" style={{ marginBottom: 16 }}>
        <label className="form-label">Com quanto você vai pagar?</label>
        <input
          className="form-input"
          type="number"
          inputMode="decimal"
          placeholder="Ex: 50.00"
          value={dinheiroOferecido}
          onChange={e => setDinheiroOferecido(e.target.value)}
          style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', color: 'var(--ocean)' }}
        />
        {trocoNegativo && (
          <p style={{ fontSize: 12, color: '#FF6B6B', marginTop: 4, fontWeight: 600 }}>
            ⚠️ Valor insuficiente — faltam {fmt(total - (parseFloat(dinheiroOferecido) || 0))}
          </p>
        )}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Atalhos rápidos</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {sugeridas.map(v => (
          <button key={v} onClick={() => setDinheiroOferecido(v.toFixed(2))} style={{
            background: parseFloat(dinheiroOferecido) === v ? 'var(--ocean)' : 'var(--surface)',
            color: parseFloat(dinheiroOferecido) === v ? 'white' : 'var(--text-primary)',
            border: '1.5px solid', borderColor: parseFloat(dinheiroOferecido) === v ? 'var(--ocean)' : 'var(--border)',
            borderRadius: 10, padding: '8px 14px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Baloo 2',cursive"
          }}>{fmt(v)}</button>
        ))}
        <button onClick={() => setDinheiroOferecido(total.toFixed(2))} style={{
          background: parseFloat(dinheiroOferecido) === total ? 'var(--ocean)' : '#F0FDF4',
          color: parseFloat(dinheiroOferecido) === total ? 'white' : '#065F46',
          border: '1.5px solid', borderColor: parseFloat(dinheiroOferecido) === total ? 'var(--ocean)' : '#BBF7D0',
          borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: "'Baloo 2',cursive"
        }}>Exato ✓</button>
      </div>

      {troco !== null && troco > 0 && (
        <div style={{ background: '#F0FDF4', border: '2px solid #06D6A0', borderRadius: 14, padding: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#065F46', marginBottom: 4 }}>Troco que você vai receber</p>
          <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 32, fontWeight: 800, color: '#059669' }}>{fmt(troco)}</p>
          <TrocoDetalhado troco={troco} />
        </div>
      )}
      {troco === 0 && dinheiroOferecido && (
        <div style={{ background: '#EFF9FF', border: '2px solid #00B4D8', borderRadius: 14, padding: 14, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: 'var(--ocean)' }}>✅ Valor exato — sem troco!</p>
        </div>
      )}
    </div>
  )
}

function TrocoDetalhado({ troco }) {
  const denominacoes = [100, 50, 20, 10, 5, 2, 1, 0.50, 0.25, 0.10, 0.05, 0.01]
  const resultado = []
  let resto = Math.round(troco * 100) / 100
  for (const d of denominacoes) {
    const qtd = Math.floor(Math.round(resto / d * 100) / 100)
    if (qtd > 0) { resultado.push({ valor: d, qtd }); resto = Math.round((resto - d * qtd) * 100) / 100 }
    if (resto <= 0) break
  }
  if (!resultado.length) return null
  return (
    <div style={{ marginTop: 10, borderTop: '1px solid #BBF7D0', paddingTop: 10 }}>
      <p style={{ fontSize: 11, color: '#065F46', marginBottom: 6 }}>Composição do troco</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {resultado.map(({ valor, qtd }) => (
          <div key={valor} style={{ background: 'white', borderRadius: 8, padding: '4px 8px', fontSize: 12, fontWeight: 700, color: '#059669', border: '1px solid #BBF7D0' }}>
            {qtd}× {valor >= 1 ? `R$${valor}` : `${Math.round(valor * 100)}¢`}
          </div>
        ))}
      </div>
    </div>
  )
}

function PixSection({ total }) {
  const { showToast } = useToast()
  const pixKey = 'contato@quiosquepraia.com'
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
      <div className="form-group"><label className="form-label">Número do Cartão</label><input className="form-input" placeholder="0000 0000 0000 0000" maxLength={19} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group"><label className="form-label">Validade</label><input className="form-input" placeholder="MM/AA" maxLength={5} /></div>
        <div className="form-group"><label className="form-label">CVV</label><input className="form-input" placeholder="123" maxLength={3} type="number" /></div>
      </div>
      <div className="form-group"><label className="form-label">Nome no Cartão</label><input className="form-input" placeholder="Como impresso no cartão" /></div>
    </div>
  )
}
