import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuthPIN } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'

const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

const STATUS_LABEL = { pago: 'Novo', cozinha: 'Cozinha', pronto: 'Pronto', entregue: 'Entregue', cancelado: 'Cancelado', parcial: 'Parcial' }
const STATUS_COLOR = { pago: '#00B4D8', cozinha: '#F59E0B', pronto: '#06D6A0', entregue: '#8AAABB', cancelado: '#FF6B6B', parcial: '#F59E0B' }

export default function Caixa() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { session, isLoading, logout } = useAuthPIN()
  const { showToast } = useToast()
  const [tab, setTab] = useState('hoje')
  const [filtro, setFiltro] = useState('todos')
  const [pedidoAberto, setPedidoAberto] = useState(null)

  const kiosque = useQuery(api.kiosques.getBySlug, { slug })
  const pedidosActifs = useQuery(api.pedidos.getPedidosActifs, kiosque ? { kiosqueId: kiosque._id } : 'skip')
  const historico = useQuery(api.pedidos.getHistorico, kiosque ? { kiosqueId: kiosque._id } : 'skip')
  const stats = useQuery(api.pedidos.getEstatisticas, kiosque ? { kiosqueId: kiosque._id } : 'skip')

  if (isLoading) return <Loading />
  if (!session || session.role !== 'caixa') { navigate(`/login/${slug}`); return null }

  // Fusionar pedidos ativos + histórico sem duplicatas
  const todosPedidos = (() => {
    const mapa = new Map()
    ;(historico ?? []).forEach(p => mapa.set(p._id, p))
    ;(pedidosActifs ?? []).forEach(p => mapa.set(p._id, p))
    return Array.from(mapa.values()).sort((a, b) => b.criadoEm - a.criadoEm)
  })()

  const pedidosFiltrados = todosPedidos.filter(p =>
    filtro === 'todos' ? true : p.statut === filtro
  )

  const totalFiltrado = pedidosFiltrados
    .filter(p => p.statut !== 'cancelado')
    .reduce((s, p) => s + p.total - p.totalRembourse, 0)

  const novos = pedidosActifs?.filter(p => p.statut === 'pago') ?? []
  const emPreparo = pedidosActifs?.filter(p => p.statut === 'cozinha') ?? []
  const prontos = pedidosActifs?.filter(p => p.statut === 'pronto') ?? []

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0D3B66 0%, #1A5C9A 100%)', padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: '#F5E6C8' }}>
              💰 Caixa
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              {kiosque?.nom} · {session?.nom}
            </p>
          </div>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            Sair
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { id: 'hoje', label: '📊 Hoje' },
            { id: 'pedidos', label: `🧾 Pedidos${novos.length > 0 ? ` (${novos.length} novos)` : ''}` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'none', border: 'none', padding: '10px 16px',
              color: tab === t.id ? 'white' : 'rgba(255,255,255,0.5)',
              fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
              cursor: 'pointer', fontFamily: 'Inter,sans-serif',
              borderBottom: tab === t.id ? '2px solid #06D6A0' : '2px solid transparent',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 80px' }}>

        {/* ── TAB HOJE ── */}
        {tab === 'hoje' && (
          <>
            {/* Cards stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Faturamento', val: fmt(stats?.faturamentoHoje ?? 0), icon: '💰', color: '#0D3B66' },
                { label: 'Pedidos Hoje', val: stats?.totalHoje ?? 0, icon: '🧾', color: '#0D3B66' },
                { label: 'Ticket Médio', val: fmt(stats?.ticketMedio ?? 0), icon: '📊', color: '#0D3B66' },
                { label: 'Aguardando', val: novos.length, icon: '⏳', color: '#00B4D8' },
              ].map(s => (
                <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Status tempo real */}
            <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
              <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#0D3B66', marginBottom: 14 }}>
                Status em tempo real
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { label: 'Novos', val: novos.length, color: '#00B4D8', bg: '#EFF9FF' },
                  { label: 'Cozinha', val: emPreparo.length, color: '#F59E0B', bg: '#FFFBEB' },
                  { label: 'Prontos', val: prontos.length, color: '#06D6A0', bg: '#F0FDF4' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Novos pedidos */}
            {novos.length > 0 && (
              <>
                <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: '#00B4D8', marginBottom: 10 }}>
                  🔵 Aguardando preparo
                </p>
                {novos.map(p => <PedidoCard key={p._id} p={p} onClick={() => setPedidoAberto(p)} />)}
              </>
            )}

            {/* Prontos */}
            {prontos.length > 0 && (
              <>
                <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: '#06D6A0', marginBottom: 10, marginTop: 16 }}>
                  🟢 Prontos para entrega
                </p>
                {prontos.map(p => <PedidoCard key={p._id} p={p} onClick={() => setPedidoAberto(p)} />)}
              </>
            )}

            {novos.length === 0 && prontos.length === 0 && emPreparo.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#94A3B8' }}>
                <div style={{ fontSize: 48 }}>✅</div>
                <p style={{ marginTop: 8, fontSize: 15 }}>Tudo em dia!</p>
              </div>
            )}

            {/* Histórico entregues/cancelados */}
            {(historico?.filter(p => ['entregue', 'cancelado', 'parcial'].includes(p.statut)) ?? []).length > 0 && (
              <>
                <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 14, fontWeight: 700, color: '#94A3B8', marginBottom: 10, marginTop: 20 }}>
                  Histórico de hoje
                </p>
                {historico.filter(p => ['entregue', 'cancelado', 'parcial'].includes(p.statut)).slice(0, 10).map(p => (
                  <PedidoCard key={p._id} p={p} onClick={() => setPedidoAberto(p)} />
                ))}
              </>
            )}
          </>
        )}

        {/* ── TAB PEDIDOS ── */}
        {tab === 'pedidos' && (
          <>
            {/* Filtros */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'pago', label: '🔵 Novos' },
                { id: 'cozinha', label: '🟡 Cozinha' },
                { id: 'pronto', label: '🟢 Prontos' },
                { id: 'entregue', label: '✅ Entregues' },
                { id: 'cancelado', label: '🚫 Cancelados' },
              ].map(f => (
                <button key={f.id} onClick={() => setFiltro(f.id)} style={{
                  background: filtro === f.id ? '#0D3B66' : 'white',
                  color: filtro === f.id ? 'white' : '#64748B',
                  border: '1px solid', borderColor: filtro === f.id ? '#0D3B66' : '#E2E8F0',
                  borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter,sans-serif',
                  flexShrink: 0,
                }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Resumo */}
            <div style={{ background: 'white', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: 13, color: '#64748B' }}>{pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''}</span>
              <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#0D3B66' }}>{fmt(totalFiltrado)}</span>
            </div>

            {pedidosFiltrados.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
                <p>Nenhum pedido encontrado</p>
              </div>
            )}

            {pedidosFiltrados.map(p => (
              <PedidoCard key={p._id} p={p} onClick={() => setPedidoAberto(p)} />
            ))}
          </>
        )}
      </div>

      {/* Modal detalhe pedido */}
      {pedidoAberto && (
        <div className="modal-overlay open" onClick={() => setPedidoAberto(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#0D3B66' }}>
                Pedido #{pedidoAberto.numero}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOR[pedidoAberto.statut], background: STATUS_COLOR[pedidoAberto.statut] + '22', padding: '4px 12px', borderRadius: 8 }}>
                {STATUS_LABEL[pedidoAberto.statut]}
              </span>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Guarda-sol</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0D3B66' }}>🏖️ {pedidoAberto.parasolNumero}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Pagamento</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0D3B66' }}>{pedidoAberto.metodoPagamento || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Horário</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0D3B66' }}>
                  {new Date(pedidoAberto.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <p style={{ fontSize: 13, fontWeight: 600, color: '#0D3B66', marginBottom: 10 }}>Itens</p>
            {pedidoAberto.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', opacity: item.annule ? 0.4 : 1 }}>
                <span style={{ fontSize: 14, color: '#374151' }}>
                  {item.annule && <span style={{ color: '#FF6B6B', marginRight: 4 }}>🚫</span>}
                  {item.qty}× {item.emoji} {item.nom}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0D3B66', textDecoration: item.annule ? 'line-through' : 'none' }}>
                  {fmt(item.qty * item.prixUnit)}
                </span>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '2px solid #E2E8F0' }}>
              <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#0D3B66' }}>Total</span>
              <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 800, color: '#0D3B66' }}>
                {fmt(pedidoAberto.total - pedidoAberto.totalRembourse)}
              </span>
            </div>

            {pedidoAberto.totalRembourse > 0 && (
              <div style={{ background: '#FEF3C7', borderRadius: 10, padding: '8px 12px', marginTop: 10, fontSize: 13, color: '#92400E' }}>
                ⚠️ Reembolso: {fmt(pedidoAberto.totalRembourse)}
              </div>
            )}

            <button onClick={() => setPedidoAberto(null)} style={{ width: '100%', background: 'none', border: 'none', color: '#94A3B8', fontSize: 14, cursor: 'pointer', padding: '14px 0 4px', fontFamily: 'Inter,sans-serif' }}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PedidoCard({ p, onClick }) {
  return (
    <div onClick={onClick} style={{ background: 'white', borderRadius: 14, padding: '12px 14px', marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, borderLeft: `4px solid ${STATUS_COLOR[p.statut]}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 15, color: '#0D3B66' }}>#{p.numero}</span>
          <span style={{ fontSize: 12, color: '#64748B' }}>🏖️ {p.parasolNumero}</span>
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>
          {p.items.filter(i => !i.annule).length} iten{p.items.filter(i => !i.annule).length !== 1 ? 's' : ''} · {new Date(p.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: '#0D3B66' }}>{fmt(p.total - p.totalRembourse)}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLOR[p.statut], marginTop: 2 }}>{STATUS_LABEL[p.statut]}</div>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#0D3B66', fontFamily: "'Baloo 2',cursive", fontSize: 18 }}>Carregando...</div>
    </div>
  )
}
