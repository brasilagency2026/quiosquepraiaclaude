import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuthPIN } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { useAlerteSonore } from '../hooks/useAlerteSonore'

const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

export default function Garcom() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { session, isLoading, logout } = useAuthPIN()
  const { showToast } = useToast()

  const kiosque = useQuery(api.kiosques.getBySlug, { slug })
  const pedidosProntos = useQuery(api.pedidos.getPedidosProntos, kiosque ? { kiosqueId: kiosque._id } : 'skip')
  const pedidosDinheiro = useQuery(api.pedidos.getPedidosDinheiro, kiosque ? { kiosqueId: kiosque._id } : 'skip')
  const atualizarStatut = useMutation(api.pedidos.atualizarStatut)

  useAlerteSonore(pedidosProntos, 'garcom')
  useAlerteSonore(pedidosDinheiro, 'caixa')

  if (isLoading) return <Loading />
  if (!session || session.role !== 'garcom') { navigate(`/login/${slug}`); return null }

  async function marcarEntregue(pedidoId, numero) {
    await atualizarStatut({ pedidoId, statut: 'entregue', garcomNom: session?.nom })
    showToast(`🏖️ Pedido #${numero} entregue!`)
  }

  const totalPendente = (pedidosProntos?.length ?? 0) + (pedidosDinheiro?.length ?? 0)

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', flexDirection: 'column' }}>

      <div style={{ background: 'var(--ocean)', padding: '20px 20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: 'var(--sand)' }}>
            🛵 Entregas
            {totalPendente > 0 && (
              <span style={{ background: '#FF6B6B', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', marginLeft: 8 }}>
                {totalPendente}
              </span>
            )}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--wave-light)', marginTop: 4 }}>{session?.nom} · {kiosque?.nom}</p>
        </div>
        <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Sair</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 80px' }}>

        {/* Chamados dinheiro */}
        {pedidosDinheiro && pedidosDinheiro.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#92400E' }}>💵 Cobrar em Dinheiro</p>
              <span style={{ background: '#F59E0B', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{pedidosDinheiro.length}</span>
            </div>
            {pedidosDinheiro.map(pedido => (
              <div key={pedido._id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', marginBottom: 12, boxShadow: 'var(--shadow-card)', border: '2px solid #F59E0B' }}>
                <div style={{ background: '#F59E0B', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 800, color: '#0D2137' }}>💵 Pedido #{pedido.numero}</h4>
                  <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 800, color: '#0D2137' }}>🏖️ {pedido.parasolNumero}</span>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  {pedido.items.filter(i => !i.annule).map((item, i) => (
                    <div key={i} style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>• {item.qty}× {item.emoji} {item.nom}</div>
                  ))}
                  <div style={{ background: '#FFF9E6', border: '1px solid #FDE68A', borderRadius: 12, padding: 12, marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: '#78350F' }}>A cobrar:</span>
                      <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 800, color: '#92400E' }}>{fmt(pedido.total)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: '#78350F' }}>Cliente paga com:</span>
                      <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: '#92400E' }}>{fmt(pedido.dinheiroOferecido ?? pedido.total)}</span>
                    </div>
                    {pedido.troco > 0 ? (
                      <div style={{ background: '#06D6A0', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: '#0D2137' }}>💰 Dar troco:</span>
                        <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 26, fontWeight: 800, color: '#0D2137' }}>{fmt(pedido.troco)}</span>
                      </div>
                    ) : (
                      <div style={{ background: '#EFF9FF', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ocean)' }}>✅ Valor exato — sem troco</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => marcarEntregue(pedido._id, pedido.numero)} style={{ width: '100%', background: '#F59E0B', color: '#0D2137', border: 'none', borderRadius: 10, padding: 14, fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 12 }}>
                    💵 Dinheiro Recebido — Entregue!
                  </button>
                </div>
              </div>
            ))}
            {pedidosProntos && pedidosProntos.length > 0 && <div style={{ height: 1, background: '#E2E8F0', margin: '8px 0 20px' }} />}
          </>
        )}

        {/* Entregas prontas */}
        {pedidosProntos && pedidosProntos.length > 0 && (
          <>
            <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#0D2137', marginBottom: 12 }}>🟢 Prontos para entregar</p>
            {pedidosProntos.map(pedido => (
              <div key={pedido._id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', marginBottom: 12, boxShadow: 'var(--shadow-card)' }}>
                <div style={{ background: '#06D6A0', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 800, color: 'var(--ocean)' }}>Pedido #{pedido.numero}</h4>
                  <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 800, color: 'var(--ocean)' }}>🏖️ {pedido.parasolNumero}</span>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  {pedido.items.filter(i => !i.annule).map((item, i) => (
                    <div key={i} style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>• {item.qty}× {item.emoji} {item.nom}</div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total:</span>
                    <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: 'var(--ocean)' }}>{fmt(pedido.total - pedido.totalRembourse)}</span>
                  </div>
                  <button onClick={() => marcarEntregue(pedido._id, pedido.numero)} style={{ width: '100%', background: 'var(--ocean)', color: 'white', border: 'none', borderRadius: 10, padding: 12, fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 12 }}>
                    🏖️ Entregue no Guarda-Sol!
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {totalPendente === 0 && pedidosProntos !== undefined && pedidosDinheiro !== undefined && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 64 }}>✅</div>
            <p style={{ fontSize: 16, fontWeight: 600, marginTop: 12 }}>Nenhuma entrega pendente</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Loading() {
  return <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Carregando...</div>
}
