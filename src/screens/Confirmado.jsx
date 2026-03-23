import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

const STEPS = [
  { id: 'pago', icon: '✓', title: 'Pagamento Aprovado', sub: 'Pagamento confirmado' },
  { id: 'cozinha', icon: '👨‍🍳', title: 'Preparando na Cozinha', sub: 'Estimativa: 15–20 min' },
  { id: 'pronto', icon: '🛵', title: 'A Caminho do Guarda-Sol', sub: 'Garçom a entregar em breve' },
  { id: 'entregue', icon: '🏖️', title: 'Entregue!', sub: 'Aproveite!' },
]

const ORDER = ['pago', 'cozinha', 'pronto', 'entregue']

export default function Confirmado({ pedidoId, numero, onNewOrder }) {
  const pedido = useQuery(api.pedidos.acompanharPedido, pedidoId ? { pedidoId } : 'skip')
  const statut = pedido?.statut ?? 'pago'
  const isCancelled = statut === 'cancelado' || statut === 'parcial'
  const currentStep = ORDER.indexOf(isCancelled ? 'pago' : statut)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg,#0D2137 0%,#1A3A5C 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '40px 24px'
    }}>
      {/* Icon */}
      <div style={{
        width: 120, height: 120, background: isCancelled ? '#FF6B6B' : '#06D6A0',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 56, margin: '0 auto 24px',
        boxShadow: `0 0 60px ${isCancelled ? 'rgba(255,107,107,0.4)' : 'rgba(6,214,160,0.4)'}`,
        animation: 'bounce-in 0.5s cubic-bezier(0.175,0.885,0.32,1.275)'
      }}>
        {isCancelled ? '✕' : '✓'}
      </div>

      <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 28, fontWeight: 800, color: '#F5E6C8' }}>
        {isCancelled ? 'Pedido Cancelado' : 'Pedido Confirmado!'}
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginTop: 8 }}>
        {isCancelled ? 'Veja o aviso abaixo' : 'Estamos preparando tudo com carinho 🌊'}
      </p>

      {/* Order number */}
      <div style={{
        background: 'rgba(0,180,216,0.15)', border: '1px solid rgba(0,180,216,0.3)',
        borderRadius: 16, padding: '16px 24px', margin: '24px 0',
        display: 'inline-block', width: '100%', maxWidth: 320
      }}>
        <div style={{ fontSize: 12, color: '#48CAE4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Seu número</div>
        <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 48, fontWeight: 800, color: '#F5E6C8', lineHeight: 1 }}>
          #{numero || '—'}
        </div>
      </div>

      {/* Cancel alert */}
      {isCancelled && pedido && (
        <div style={{
          background: statut === 'cancelado' ? 'linear-gradient(135deg,#7F1D1D,#991B1B)' : 'linear-gradient(135deg,#78350F,#92400E)',
          border: '1px solid rgba(255,100,100,0.4)', borderRadius: 18,
          padding: '18px 20px', marginBottom: 20, width: '100%', maxWidth: 360, textAlign: 'left'
        }}>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 17, fontWeight: 800, color: statut === 'cancelado' ? '#FCA5A5' : '#FCD34D', marginBottom: 8 }}>
            {statut === 'cancelado' ? '🚫 Pedido cancelado' : '⚠️ Pedido parcialmente cancelado'}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 12 }}>
            {pedido.motivoCancelamento || 'Motivo não informado'}
            {pedido.totalRembourse > 0 && <>
              <br /><strong>Reembolso: R$ {pedido.totalRembourse.toFixed(2).replace('.', ',')}</strong>
            </>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 8px', fontFamily: "'Baloo 2',cursive", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              💰 Reembolso
            </button>
            <button onClick={onNewOrder} style={{ background: '#06D6A0', color: '#0D2137', border: 'none', borderRadius: 10, padding: '10px 8px', fontFamily: "'Baloo 2',cursive", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              🔄 Novo Pedido
            </button>
          </div>
        </div>
      )}

      {/* Status tracker */}
      {!isCancelled && (
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 24, padding: 20, margin: '0 0 24px', width: '100%', maxWidth: 360, textAlign: 'left' }}>
          {STEPS.map((step, i) => {
            const done = i < currentStep
            const active = i === currentStep
            return (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < STEPS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  background: done ? '#06D6A0' : active ? '#00B4D8' : 'rgba(255,255,255,0.1)',
                  animation: active ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
                  transition: 'background 0.5s'
                }}>{done ? '✓' : step.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 2 }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{step.sub}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button className="btn-primary" onClick={onNewOrder} style={{ maxWidth: 320 }}>
        + Fazer Outro Pedido
      </button>

      <style>{`
        @keyframes bounce-in { 0%{transform:scale(0);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes pulse-dot { 0%,100%{box-shadow:0 0 0 0 rgba(0,180,216,0.5)} 50%{box-shadow:0 0 0 8px rgba(0,180,216,0)} }
      `}</style>
    </div>
  )
}
