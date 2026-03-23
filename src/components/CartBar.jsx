// CartBar.jsx
export function CartBar({ count, total, onClick }) {
  if (count === 0) return null
  const fmt = v => 'R$ ' + v.toFixed(2).replace('.', ',')
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 600,
      background: '#0D2137', padding: '12px 16px',
      paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      boxShadow: '0 -4px 24px rgba(13,33,55,0.4)', zIndex: 200
    }}>
      <button onClick={onClick} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#06D6A0', color: '#0D2137', border: 'none', borderRadius: 50,
        padding: '14px 20px', width: '100%', cursor: 'pointer',
        fontFamily: "'Baloo 2',cursive", transition: 'all 0.2s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: '#0D2137', color: 'white', borderRadius: 10, padding: '3px 10px', fontSize: 14, fontWeight: 700 }}>{count}</span>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Ver Carrinho</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 800 }}>{fmt(total)}</span>
      </button>
    </div>
  )
}

export default CartBar
