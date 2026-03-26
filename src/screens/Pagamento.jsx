import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useToast } from '../context/ToastContext'

const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

const PROVIDER_LABEL = {
  mercadopago: 'MercadoPago',
  stripe: 'Stripe',
}
const PROVIDER_METHODS = {
  mercadopago: 'PIX · Cartão · Boleto',
  stripe: 'Cartão de Crédito · Débito',
}

export default function Pagamento({ total, cart, onBack, onConfirm, slug }) {
  const [metodo, setMetodo] = useState(null) // 'digital' | 'dinheiro'
  const [loading, setLoading] = useState(false)
  const [dinheiroOferecido, setDinheiroOferecido] = useState('')
  const { showToast } = useToast()

  const configPagamento = useQuery(api.pagamentos.getConfigPagamento, slug ? { kiosqueSlug: slug } : 'skip')

  const valorOferecido = parseFloat(dinheiroOferecido) || 0
  const troco = valorOferecido >= total ? valorOferecido - total : null
  const trocoNegativo = dinheiroOferecido !== '' && valorOferecido < total

  const provider = configPagamento?.provider
  const digitalDisponivel = configPagamento?.configurado

  async function handlePagar() {
    if (metodo === 'dinheiro') {
      if (!dinheiroOferecido || valorOferecido < total) {
        showToast('⚠️ Informe um valor maior ou igual ao total'); return
      }
      onConfirm('dinheiro', { dinheiroOferecido: valorOferecido, troco: troco ?? 0 })
      return
    }
    if (metodo === 'digital') {
      setLoading(true)
      showToast('⏳ Processando pagamento...')
      await new Promise(r => setTimeout(r, 1800))
      setLoading(false)
      onConfirm(provider ?? 'digital')
      return
    }
    showToast('⚠️ Escolha uma forma de pagamento')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--ocean)', padding: '20px 20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 20 }}>←</button>
        <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: 'var(--sand)' }}>Pagamento</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 140px' }}>

        {/* Resumo */}
        <div className="card" style={{ marginBottom: 24 }}>
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

        <p className="section-title">Escolha como pagar</p>

        {/* Opção 1 — Pagamento digital */}
        <div onClick={() => digitalDisponivel && setMetodo('digital')} style={{
          border: `2px solid ${metodo === 'digital' ? 'var(--wave)' : digitalDisponivel ? 'transparent' : '#E2E8F0'}`,
          borderRadius: 20, marginBottom: 14, overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
          background: !digitalDisponivel ? '#F8FAFC' : metodo === 'digital' ? '#EBF9FD' : 'white',
          cursor: digitalDisponivel ? 'pointer' : 'default',
          opacity: digitalDisponivel ? 1 : 0.6,
          transition: 'all 0.2s',
        }}>
          <div style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: metodo === 'digital' ? 'rgba(0,180,216,0.15)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                💳
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 17, fontWeight: 800, color: 'var(--ocean)', marginBottom: 3 }}>
                  Pagamento Digital
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {digitalDisponivel
                    ? PROVIDER_METHODS[provider] ?? 'PIX · Cartão'
                    : 'Não configurado pelo gestor'}
                </div>
              </div>
              {digitalDisponivel && provider && (
                <span style={{
                  background: provider === 'mercadopago' ? '#009EE3' : '#635BFF',
                  color: 'white', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, flexShrink: 0
                }}>
                  {PROVIDER_LABEL[provider]}
                </span>
              )}
            </div>

            {/* Métodos aceitos */}
            {digitalDisponivel && metodo === 'digital' && (
              <div style={{ marginTop: 14, borderTop: '1px solid #E2E8F0', paddingTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(provider === 'mercadopago'
                  ? ['💰 PIX', '💳 Crédito', '🏦 Débito', '📄 Boleto']
                  : ['💳 Crédito', '🏦 Débito']
                ).map(m => (
                  <span key={m} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Opção 2 — Dinheiro */}
        <div onClick={() => setMetodo('dinheiro')} style={{
          border: `2px solid ${metodo === 'dinheiro' ? '#F59E0B' : 'transparent'}`,
          borderRadius: 20, marginBottom: 14, overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
          background: metodo === 'dinheiro' ? '#FFFBEB' : 'white',
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          <div style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: metodo === 'dinheiro' ? 'rgba(245,158,11,0.15)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                💵
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 17, fontWeight: 800, color: metodo === 'dinheiro' ? '#92400E' : 'var(--text-primary)', marginBottom: 3 }}>
                  Dinheiro
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Garçom vem buscar o pagamento
                </div>
              </div>
            </div>

            {/* Formulário dinheiro */}
            {metodo === 'dinheiro' && (
              <div style={{ marginTop: 16, borderTop: '1px solid #FDE68A', paddingTop: 16 }} onClick={e => e.stopPropagation()}>

                <div style={{ background: '#FFF9E6', border: '1px solid #FDE68A', borderRadius: 12, padding: '10px 12px', marginBottom: 16, display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>📣</span>
                  <p style={{ fontSize: 12, color: '#78350F', lineHeight: 1.5 }}>
                    Um garçom virá ao seu guarda-sol para receber e trazer o troco.
                  </p>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Total a pagar</p>
                  <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 32, fontWeight: 800, color: '#92400E' }}>{fmt(total)}</p>
                </div>

                <label style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 6, display: 'block' }}>
                  Com quanto você vai pagar?
                </label>
                <input
                  className="form-input"
                  type="number"
                  inputMode="decimal"
                  placeholder="Ex: 50.00"
                  value={dinheiroOferecido}
                  onChange={e => setDinheiroOferecido(e.target.value)}
                  style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', color: '#92400E', marginBottom: 8 }}
                />
                {trocoNegativo && (
                  <p style={{ fontSize: 12, color: '#FF6B6B', marginBottom: 8, fontWeight: 600 }}>
                    ⚠️ Valor insuficiente — faltam {fmt(total - valorOferecido)}
                  </p>
                )}

                {/* Atalhos */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {(() => {
                    const notas = [2, 5, 10, 20, 50, 100, 200]
                    const sugeridas = []
                    for (const n of notas) {
                      const mult = Math.ceil(total / n) * n
                      if (mult >= total && !sugeridas.includes(mult)) sugeridas.push(mult)
                      if (sugeridas.length >= 4) break
                    }
                    return sugeridas.map(v => (
                      <button key={v} onClick={() => setDinheiroOferecido(v.toFixed(2))} style={{
                        background: valorOferecido === v ? '#F59E0B' : 'var(--surface)',
                        color: valorOferecido === v ? 'white' : 'var(--text-primary)',
                        border: '1.5px solid', borderColor: valorOferecido === v ? '#F59E0B' : 'var(--border)',
                        borderRadius: 10, padding: '7px 14px', fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', fontFamily: "'Baloo 2',cursive"
                      }}>{fmt(v)}</button>
                    ))
                  })()}
                  <button onClick={() => setDinheiroOferecido(total.toFixed(2))} style={{
                    background: valorOferecido === total ? '#F59E0B' : '#F0FDF4',
                    color: valorOferecido === total ? 'white' : '#065F46',
                    border: '1.5px solid', borderColor: valorOferecido === total ? '#F59E0B' : '#BBF7D0',
                    borderRadius: 10, padding: '7px 14px', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: "'Baloo 2',cursive"
                  }}>Exato ✓</button>
                </div>

                {/* Troco */}
                {troco !== null && troco > 0 && (
                  <div style={{ background: '#F0FDF4', border: '2px solid #06D6A0', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: '#065F46' }}>Troco a receber</span>
                    <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 28, fontWeight: 800, color: '#059669' }}>{fmt(troco)}</span>
                  </div>
                )}
                {troco === 0 && dinheiroOferecido && (
                  <div style={{ background: '#EFF9FF', border: '2px solid #00B4D8', borderRadius: 14, padding: '12px 16px', textAlign: 'center' }}>
                    <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: 'var(--ocean)' }}>✅ Valor exato — sem troco!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 600, background: '#F0F7FF', padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', boxShadow: '0 -4px 24px rgba(13,33,55,0.1)' }}>
        {!metodo && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
            Selecione uma forma de pagamento acima
          </p>
        )}
        <button className="btn-primary" onClick={handlePagar}
          disabled={!metodo || loading || (metodo === 'dinheiro' && (trocoNegativo || !dinheiroOferecido))}>
          {loading ? '⏳ Aguarde...' :
           !metodo ? 'Escolha como pagar' :
           metodo === 'dinheiro' ? '📣 Chamar Garçom para Pagar' :
           `💳 Pagar com ${PROVIDER_LABEL[provider] ?? 'Digital'}`}
        </button>
      </div>
    </div>
  )
}
