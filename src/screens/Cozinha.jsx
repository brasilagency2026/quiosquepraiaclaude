import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuthPIN } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import CancelModal from '../components/CancelModal'

export default function Cozinha() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { session, isLoading, logout } = useAuthPIN()
  const { showToast } = useToast()
  const [cancelOrder, setCancelOrder] = useState(null)
  const [timers, setTimers] = useState({})

  const kiosque = useQuery(api.kiosques.getBySlug, { slug })
  const pedidos = useQuery(
    api.pedidos.getPedidosActifs,
    kiosque ? { kiosqueId: kiosque._id } : 'skip'
  )
  const atualizarStatut = useMutation(api.pedidos.atualizarStatut)
  const annulerItems = useMutation(api.pedidos.annulerItems)

  // Timer par pedido (em minutos desde criação)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!pedidos) return
      const now = Date.now()
      const t = {}
      pedidos.forEach(p => { t[p._id] = Math.floor((now - p.criadoEm) / 60000) })
      setTimers(t)
    }, 30000)
    return () => clearInterval(interval)
  }, [pedidos])

  // Auth check
  if (isLoading) return <Loading />
  if (!session || session.role !== 'cozinha') {
    navigate(`/login/${slug}`)
    return null
  }

  async function marcarPronto(pedidoId) {
    await atualizarStatut({ pedidoId, statut: 'pronto' })
    showToast('✅ Pedido marcado como pronto!')
  }

  async function handleCancel({ pedidoId, indices, motivo, nota }) {
    const result = await annulerItems({ pedidoId, itemsAnnulesIndex: indices, motivo, nota })
    showToast(result.tousAnnules ? '🚫 Pedido cancelado' : '⚠️ Cancelamento parcial registado')
    setCancelOrder(null)
  }

  const pending = pedidos?.filter(p => p.statut === 'pago' && p.metodoPagamento !== 'dinheiro') ?? []
  const making  = pedidos?.filter(p => p.statut === 'cozinha') ?? []
  const ready   = pedidos?.filter(p => p.statut === 'pronto') ?? []

  return (
    <div style={{ minHeight: '100vh', background: '#111827', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#1F2937', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #374151' }}>
        <div>
          <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: '#F9FAFB' }}>🍳 Cozinha</h2>
          <p style={{ fontSize: 12, color: '#6B7280' }}>{kiosque?.nom} · {slug}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#06D6A0', animation: 'blink 1.5s ease-in-out infinite' }} />
            Online
          </div>
          <button onClick={logout} style={{ background: '#374151', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#9CA3AF', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Sair</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '12px 16px', background: '#111827', borderBottom: '1px solid #1F2937', display: 'flex', gap: 8 }}>
        {[
          { label: 'Novos', val: pending.length, color: '#FF6B6B' },
          { label: 'Preparando', val: making.length, color: '#00B4D8' },
          { label: 'Prontos', val: ready.length, color: '#06D6A0' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#1F2937', borderRadius: 10, padding: 12, textAlign: 'center' }}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Orders */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {!pedidos && <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Carregando...</div>}
        {pedidos?.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p>Nenhum pedido no momento</p>
          </div>
        )}
        {[...pending, ...making, ...ready].map((pedido) => {
          const mins = timers[pedido._id] ?? Math.floor((Date.now() - pedido.criadoEm) / 60000)
          const urgent = mins >= 15
          return (
            <div key={pedido._id} style={{
              background: '#1F2937',
              border: `1px solid ${pedido.statut === 'pronto' ? '#06D6A0' : urgent ? '#FF6B6B' : '#374151'}`,
              borderRadius: 16, overflow: 'hidden', marginBottom: 16,
              opacity: pedido.statut === 'pronto' ? 0.7 : 1
            }}>
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #374151' }}>
                <div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 24, fontWeight: 800, color: urgent ? '#FF6B6B' : '#00B4D8' }}>#{pedido.numero}</div>
                  <div style={{ background: '#374151', padding: '3px 10px', borderRadius: 20, fontSize: 13, color: '#9CA3AF', display: 'inline-block', marginTop: 2 }}>
                    🏖️ {pedido.parasolNumero}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 700, color: urgent ? '#FF6B6B' : '#00B4D8', animation: urgent ? 'flash 0.7s ease-in-out infinite' : 'none' }}>
                    {mins}'
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                    {pedido.statut === 'pago' ? '🆕 Novo' : pedido.statut === 'cozinha' ? '🔥 Em preparo' : '✅ Pronto'}
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px 16px' }}>
                {pedido.items.filter(i => !i.annule).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #374151' }}>
                    <div style={{ background: '#00B4D8', color: '#0D2137', width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{item.qty}</div>
                    <div style={{ fontSize: 16, color: '#F3F4F6' }}>{item.emoji} {item.nom}</div>
                  </div>
                ))}
                {pedido.observacao && (
                  <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 8, padding: '8px 12px', background: '#374151', borderRadius: 8 }}>
                    📝 {pedido.observacao}
                  </div>
                )}
              </div>

              {pedido.statut !== 'pronto' && (
                <div style={{ padding: '12px 16px', display: 'flex', gap: 10 }}>
                  <button onClick={() => marcarPronto(pedido._id)} style={{
                    flex: 1, background: '#06D6A0', color: '#0D2137', border: 'none',
                    borderRadius: 12, padding: 12, fontFamily: "'Baloo 2',cursive",
                    fontSize: 17, fontWeight: 700, cursor: 'pointer'
                  }}>✅ Pronto para Entrega</button>
                  <button onClick={() => setCancelOrder(pedido)} style={{
                    background: '#374151', color: '#9CA3AF', border: 'none',
                    borderRadius: 12, padding: '12px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif'
                  }}>🚫 Cancelar</button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {cancelOrder && (
        <CancelModal
          pedido={cancelOrder}
          onConfirm={handleCancel}
          onClose={() => setCancelOrder(null)}
        />
      )}

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes flash{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>
    </div>
  )
}

function Loading() {
  return <div style={{ minHeight: '100vh', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>Carregando...</div>
}
