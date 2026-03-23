const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

export default function Carrinho({ cart, total, onBack, onCheckout, onChangeQty }) {
  if (cart.length === 0) return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', flexDirection: 'column' }}>
      <Header onBack={onBack} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' }}>Carrinho vazio</p>
        <p style={{ fontSize: 14, marginTop: 8 }}>Adicione itens do cardápio</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', flexDirection: 'column' }}>
      <Header onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 160px' }}>
        <p className="section-title">Meus Itens</p>
        {cart.map((item, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ width: 52, height: 52, background: 'var(--surface)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{item.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{item.nom}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmt(item.prix)} × {item.qty} = <strong>{fmt(item.prix * item.qty)}</strong></div>
              {item.obs && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>📝 {item.obs}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderRadius: 50, padding: 4 }}>
              <button onClick={() => onChangeQty(item._id, item.obs, -1)} style={{ width: 32, height: 32, border: 'none', borderRadius: '50%', background: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ocean)' }}>−</button>
              <span style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 16, color: 'var(--ocean)', minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
              <button onClick={() => onChangeQty(item._id, item.obs, 1)} style={{ width: 32, height: 32, border: 'none', borderRadius: '50%', background: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ocean)' }}>+</button>
            </div>
          </div>
        ))}

        {/* Total */}
        <div style={{ background: 'var(--ocean)', borderRadius: 16, padding: 16, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
            <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} itens)</span>
            <span>{fmt(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
            <span>Entrega</span>
            <span style={{ color: '#06D6A0', fontWeight: 600 }}>Grátis 🎉</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 700, color: 'white', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 600, background: '#F0F7FF', padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', boxShadow: '0 -4px 24px rgba(13,33,55,0.1)' }}>
        <button className="btn-primary" onClick={onCheckout}>💳 Ir para Pagamento</button>
      </div>
    </div>
  )
}

function Header({ onBack }) {
  return (
    <div style={{ background: 'var(--ocean)', padding: '20px 20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 20 }}>←</button>
      <div>
        <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: 'var(--sand)' }}>Meu Pedido</h2>
      </div>
    </div>
  )
}
