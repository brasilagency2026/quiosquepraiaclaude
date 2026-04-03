import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

const PEDIDOS_INIT = [
  {
    id: 'p1', numero: 1, parasolNumero: 'GS-03', statut: 'pago', criadoEm: Date.now() - 120000,
    items: [{ nom: 'Camarão Grelhado', emoji: '🦐', qty: 1, annule: false }, { nom: 'Cerveja Gelada', emoji: '🍺', qty: 2, annule: false }],
    total: 76.00, metodoPagamento: 'pix'
  },
  {
    id: 'p2', numero: 2, parasolNumero: 'GS-07', statut: 'pago', criadoEm: Date.now() - 60000,
    items: [{ nom: 'Batata Frita', emoji: '🍟', qty: 1, annule: false }, { nom: 'Água de Coco', emoji: '🥥', qty: 2, annule: false }],
    total: 52.00, metodoPagamento: 'dinheiro', dinheiroOferecido: 60, troco: 8
  },
  {
    id: 'p3', numero: 3, parasolNumero: 'GS-12', statut: 'pronto', criadoEm: Date.now() - 300000,
    items: [{ nom: 'Peixe Grelhado', emoji: '🐟', qty: 1, annule: false }, { nom: 'Caipirinha', emoji: '🍸', qty: 1, annule: false }],
    total: 90.00, metodoPagamento: 'pix'
  },
]

function getPedidos() {
  try { return JSON.parse(sessionStorage.getItem('demo_pedidos') || 'null') || PEDIDOS_INIT } catch { return PEDIDOS_INIT }
}
function savePedidos(p) { sessionStorage.setItem('demo_pedidos', JSON.stringify(p)) }

function tempo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000)
  return m < 1 ? 'agora' : `${m}min atrás`
}

export default function DemoGarcom() {
  const navigate = useNavigate()
  const [pedidos, setPedidosState] = useState(getPedidos)
  const [toast, setToast] = useState('')

  const session = JSON.parse(sessionStorage.getItem('demo_session') || '{"nom":"João Santos","role":"garcom"}')

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500) }

  function atualizar(id, statut) {
    setPedidosState(prev => {
      const next = prev.map(p => p.id === id ? { ...p, statut } : p)
      savePedidos(next)
      return next
    })
  }

  // Pedidos dinheiro aguardando pagamento (pago + dinheiro)
  const pedidosDinheiro = pedidos.filter(p => p.statut === 'pago' && p.metodoPagamento === 'dinheiro')
  // Pedidos prontos para entregar
  const pedidosProntos = pedidos.filter(p => p.statut === 'pronto')
  // Entregues hoje
  const entregues = pedidos.filter(p => p.statut === 'entregue')

  const totalPendente = pedidosDinheiro.length + pedidosProntos.length

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', fontFamily: 'Inter,sans-serif' }}>

      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#06D6A0', color: '#0D2137', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 700, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>{toast}</div>}

      {/* Header */}
      <div style={{ background: '#0D2137', padding: '16px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#F5E6C8' }}>
            🛵 Entregas
            {totalPendente > 0 && (
              <span style={{ background: '#FF6B6B', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', marginLeft: 8 }}>{totalPendente}</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            {session.nom} · Demo · {entregues.length} entregue(s) hoje
          </div>
        </div>
        <button onClick={() => navigate('/demo/equipe')} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>Sair</button>
      </div>

      {/* Info demo */}
      <div style={{ background: '#FFF9E6', border: '1px solid #FDE68A', margin: '12px 16px 0', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#92400E' }}>
        💡 Demo — simule o fluxo de entrega clicando nos botões abaixo
      </div>

      <div style={{ padding: '16px 16px 60px' }}>

        {/* ── Cobranças dinheiro ── */}
        {pedidosDinheiro.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#92400E' }}>💵 Cobrar em Dinheiro</p>
              <span style={{ background: '#F59E0B', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{pedidosDinheiro.length}</span>
            </div>
            {pedidosDinheiro.map(pedido => (
              <div key={pedido.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '2px solid #F59E0B' }}>
                <div style={{ background: '#F59E0B', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 800, color: '#0D2137' }}>💵 Pedido #{pedido.numero}</h4>
                  <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 800, color: '#0D2137' }}>🏖️ {pedido.parasolNumero}</span>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  {pedido.items.filter(i => !i.annule).map((item, i) => (
                    <div key={i} style={{ fontSize: 14, color: '#64748B', marginBottom: 4 }}>• {item.qty}× {item.emoji} {item.nom}</div>
                  ))}
                  <div style={{ background: '#FFF9E6', border: '1px solid #FDE68A', borderRadius: 12, padding: 12, marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: '#78350F' }}>A cobrar:</span>
                      <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 800, color: '#92400E' }}>{fmt(pedido.total)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: '#78350F' }}>Cliente paga com:</span>
                      <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: '#92400E' }}>{fmt(pedido.dinheiroOferecido)}</span>
                    </div>
                    {pedido.troco > 0 && (
                      <div style={{ background: '#06D6A0', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: '#0D2137' }}>💰 Dar troco:</span>
                        <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 26, fontWeight: 800, color: '#0D2137' }}>{fmt(pedido.troco)}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => { atualizar(pedido.id, 'cozinha'); showToast(`✅ Dinheiro recebido! Pedido #${pedido.numero} enviado à cozinha.`) }} style={{ width: '100%', background: '#F59E0B', color: '#0D2137', border: 'none', borderRadius: 10, padding: 14, fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 12 }}>
                    💵 Dinheiro Recebido — Enviar à Cozinha!
                  </button>
                </div>
              </div>
            ))}
            {pedidosProntos.length > 0 && <div style={{ height: 1, background: '#E2E8F0', margin: '8px 0 20px' }} />}
          </>
        )}

        {/* ── Prontos para entregar ── */}
        {pedidosProntos.length > 0 && (
          <>
            <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#0D2137', marginBottom: 12 }}>🟢 Prontos para entregar</p>
            {pedidosProntos.map(pedido => (
              <div key={pedido.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ background: '#06D6A0', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 800, color: '#0D2137' }}>Pedido #{pedido.numero}</h4>
                  <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 800, color: '#0D2137' }}>🏖️ {pedido.parasolNumero}</span>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  {pedido.items.filter(i => !i.annule).map((item, i) => (
                    <div key={i} style={{ fontSize: 14, color: '#64748B', marginBottom: 4 }}>• {item.qty}× {item.emoji} {item.nom}</div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 13, color: '#64748B' }}>Total:</span>
                    <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#0D2137' }}>{fmt(pedido.total)}</span>
                  </div>
                  <button onClick={() => { atualizar(pedido.id, 'entregue'); showToast(`🏖️ Pedido #${pedido.numero} entregue!`) }} style={{ width: '100%', background: '#0D2137', color: 'white', border: 'none', borderRadius: 10, padding: 12, fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 12 }}>
                    🏖️ Entregue no Guarda-Sol!
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Vazio */}
        {totalPendente === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Nenhuma entrega pendente!</p>
            {entregues.length > 0 && <p style={{ fontSize: 14, marginTop: 8, color: '#06D6A0' }}>{entregues.length} pedido(s) entregue(s) hoje 🎉</p>}
          </div>
        )}

        {/* Histórico entregas */}
        {entregues.length > 0 && (
          <div style={{ marginTop: 24, background: 'white', borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: 0.7 }}>
            <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 14, fontWeight: 700, color: '#64748B', marginBottom: 10 }}>📋 Entregues hoje</p>
            {entregues.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94A3B8', padding: '4px 0' }}>
                <span>#{p.numero} · {p.parasolNumero}</span>
                <span style={{ color: '#06D6A0', fontWeight: 600 }}>✓ {fmt(p.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
