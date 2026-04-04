import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

const PEDIDOS_INIT = [
  { id: 'p1', numero: 1, parasolNumero: 'GS-03', statut: 'pago', criadoEm: Date.now() - 120000,
    items: [{ nom: 'Camarão Grelhado', emoji: '🦐', qty: 1, variacaoNom: 'Porção inteira', annule: false }, { nom: 'Cerveja Gelada', emoji: '🍺', qty: 2, annule: false }],
    total: 76.00, obs: 'Sem pimenta' },
  { id: 'p2', numero: 2, parasolNumero: 'GS-07', statut: 'pago', criadoEm: Date.now() - 60000,
    items: [{ nom: 'Batata Frita', emoji: '🍟', qty: 1, annule: false }, { nom: 'Água de Coco', emoji: '🥥', qty: 2, annule: false }],
    total: 52.00, obs: '' },
  { id: 'p3', numero: 3, parasolNumero: 'GS-12', statut: 'cozinha', criadoEm: Date.now() - 300000,
    items: [{ nom: 'Peixe Grelhado', emoji: '🐟', qty: 1, annule: false }, { nom: 'Caipirinha', emoji: '🍸', qty: 1, annule: false }],
    total: 90.00, obs: 'Peixe bem passado' },
]

function getPedidos() {
  try { return JSON.parse(sessionStorage.getItem('demo_pedidos') || 'null') || PEDIDOS_INIT } catch { return PEDIDOS_INIT }
}
function savePedidos(p) { sessionStorage.setItem('demo_pedidos', JSON.stringify(p)) }

function tempo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000)
  return m < 1 ? 'agora' : `${m}min atrás`
}

const STATUT_COLOR = { pago: '#FF6B6B', cozinha: '#00B4D8', pronto: '#06D6A0' }
const STATUT_LABEL = { pago: '🆕 Novo', cozinha: '🔥 Em preparo', pronto: '✅ Pronto' }

export default function DemoCozinha() {
  const navigate = useNavigate()
  const [pedidos, setPedidosState] = useState(getPedidos)
  const [toast, setToast] = useState('')
  const prevCountRef = useRef(pedidos.filter(p => p.statut === 'pago').length)

  const session = JSON.parse(sessionStorage.getItem('demo_session') || '{"nom":"Maria Silva","role":"cozinha"}')

  // Novo pedido automático após 8s
  useEffect(() => {
    const t = setTimeout(() => {
      setPedidosState(prev => {
        if (prev.find(p => p.id === 'p4')) return prev
        const next = [...prev, {
          id: 'p4', numero: 4, parasolNumero: 'GS-05', statut: 'pago', criadoEm: Date.now(),
          items: [{ nom: 'Açaí na Tigela', emoji: '🫐', qty: 2, annule: false }, { nom: 'Suco de Maracujá', emoji: '🍹', qty: 1, annule: false }],
          total: 62.00, obs: ''
        }]
        savePedidos(next)
        showToast('🔔 Novo pedido chegou! #4 · GS-05')
        return next
      })
    }, 8000)
    return () => clearTimeout(t)
  }, [])

  // Alerta sonoro
  useEffect(() => {
    const novoCount = pedidos.filter(p => p.statut === 'pago').length
    if (novoCount > prevCountRef.current) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        ;[880, 1100].forEach((freq, i) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain()
          osc.connect(gain); gain.connect(ctx.destination)
          osc.frequency.value = freq; osc.type = 'sine'
          const t = ctx.currentTime + i * 0.18
          gain.gain.setValueAtTime(0.3, t); gain.gain.linearRampToValueAtTime(0, t + 0.12)
          osc.start(t); osc.stop(t + 0.13)
        })
        setTimeout(() => ctx.close(), 600)
      } catch (e) {}
    }
    prevCountRef.current = novoCount
  }, [pedidos])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500) }

  function atualizar(id, statut) {
    setPedidosState(prev => {
      const next = prev.map(p => p.id === id ? { ...p, statut } : p)
      savePedidos(next); return next
    })
  }

  const pending = pedidos.filter(p => p.statut === 'pago')
  const making = pedidos.filter(p => p.statut === 'cozinha')
  const ready = pedidos.filter(p => p.statut === 'pronto')
  const all = [...pending, ...making, ...ready]

  return (
    <div style={{ minHeight: '100vh', background: '#111827', fontFamily: 'Inter,sans-serif' }}>

      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#06D6A0', color: '#0D2137', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 700, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>{toast}</div>}

      {/* Header */}
      <div style={{ background: '#1F2937', borderBottom: '1px solid #374151', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#F5E6C8' }}>👨‍🍳 Cozinha</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{session.nom} · Demo</div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            {[['Novos', pending.length, '#FF6B6B'], ['Preparo', making.length, '#00B4D8'], ['Prontos', ready.length, '#06D6A0']].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/demo/equipe')} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>Sair</button>
        </div>
      </div>

      {/* Demo hint */}
      <div style={{ background: 'rgba(246,173,85,0.1)', border: '1px solid rgba(246,173,85,0.3)', margin: '12px 16px 0', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#FCD34D' }}>
        ⚡ Em 8 segundos chegará um novo pedido automaticamente!
      </div>

      <div style={{ padding: '16px 16px 40px' }}>
        {all.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div>Nenhum pedido pendente</div>
          </div>
        )}
        {all.map(pedido => (
          <div key={pedido.id} style={{ background: '#1F2937', border: `1px solid ${STATUT_COLOR[pedido.statut]}44`, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ background: pedido.statut === 'pago' ? '#374151' : pedido.statut === 'cozinha' ? '#1E3A5F' : '#064E3B', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 800, color: '#F5E6C8' }}>#{pedido.numero}</span>
                <span style={{ background: STATUT_COLOR[pedido.statut] + '33', color: STATUT_COLOR[pedido.statut], padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{STATUT_LABEL[pedido.statut]}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: '#00B4D8' }}>🏖️ {pedido.parasolNumero}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{tempo(pedido.criadoEm)}</span>
              </div>
            </div>
            <div style={{ padding: '14px 16px' }}>
              {pedido.items.filter(i => !i.annule).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid #374151' }}>
                  <div style={{ background: '#00B4D8', color: '#0D2137', width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{item.qty}</div>
                  <div>
                    <div style={{ fontSize: 15, color: '#F3F4F6' }}>{item.emoji} {item.nom}</div>
                    {item.variacaoNom && <div style={{ fontSize: 12, color: '#F59E0B' }}>📐 {item.variacaoNom}</div>}
                  </div>
                </div>
              ))}
              {pedido.obs && <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 8, padding: '8px 12px', background: '#374151', borderRadius: 8 }}>📝 {pedido.obs}</div>}
              <div style={{ marginTop: 12 }}>
                {pedido.statut === 'pago' && (
                  <button onClick={() => { atualizar(pedido.id, 'cozinha'); showToast(`🔥 Pedido #${pedido.numero} em preparo!`) }}
                    style={{ width: '100%', background: '#00B4D8', color: '#0D2137', border: 'none', borderRadius: 12, padding: 12, fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                    🔥 Iniciar Preparo
                  </button>
                )}
                {pedido.statut === 'cozinha' && (
                  <button onClick={() => { atualizar(pedido.id, 'pronto'); showToast(`✅ Pedido #${pedido.numero} pronto para entrega!`) }}
                    style={{ width: '100%', background: '#06D6A0', color: '#0D2137', border: 'none', borderRadius: 12, padding: 12, fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                    ✅ Marcar como Pronto
                  </button>
                )}
                {pedido.statut === 'pronto' && (
                  <div style={{ background: '#064E3B', borderRadius: 12, padding: 12, textAlign: 'center', fontSize: 14, color: '#06D6A0', fontWeight: 600 }}>
                    ✅ Aguardando garçom entregar...
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
