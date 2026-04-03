import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

const CATEGORIAS = [
  { id: 'bebidas', nom: 'Bebidas', emoji: '🍺' },
  { id: 'frutos', nom: 'Frutos do Mar', emoji: '🦐' },
  { id: 'petiscos', nom: 'Petiscos', emoji: '🍟' },
  { id: 'porcoes', nom: 'Porções', emoji: '🍖' },
  { id: 'sobremesas', nom: 'Sobremesas', emoji: '🍨' },
]

const ITEMS = [
  { id: '1', cat: 'bebidas', nom: 'Cerveja Gelada', emoji: '🍺', prix: 9.00, desc: 'Long neck 355ml bem gelada' },
  { id: '2', cat: 'bebidas', nom: 'Água de Coco', emoji: '🥥', prix: 12.00, desc: 'Natural, servida na própria casca' },
  { id: '3', cat: 'bebidas', nom: 'Suco de Maracujá', emoji: '🍹', prix: 14.00, desc: 'Polpa natural com bastante gelo' },
  { id: '4', cat: 'bebidas', nom: 'Caipirinha', emoji: '🍸', prix: 22.00, desc: 'Cachaça artesanal, limão e açúcar' },
  { id: '5', cat: 'frutos', nom: 'Camarão Grelhado', emoji: '🦐', prix: 58.00, desc: 'Camarão VG grelhado na manteiga e alho', variacoes: [{ nom: 'Porção inteira', prix: 58.00 }, { nom: 'Meia porção', prix: 32.00 }] },
  { id: '6', cat: 'frutos', nom: 'Casquinha de Siri', emoji: '🦀', prix: 18.00, desc: 'Siri desfiado gratinado com catupiry' },
  { id: '7', cat: 'frutos', nom: 'Lula à Doré', emoji: '🦑', prix: 52.00, desc: 'Lula empanada frita com tartar caseiro' },
  { id: '8', cat: 'petiscos', nom: 'Batata Frita', emoji: '🍟', prix: 28.00, desc: 'Porção crocante com ketchup e maionese' },
  { id: '9', cat: 'petiscos', nom: 'Bolinho de Bacalhau', emoji: '🫓', prix: 35.00, desc: '8 unidades fritos na hora' },
  { id: '10', cat: 'petiscos', nom: 'Mix de Petiscos', emoji: '🍽️', prix: 65.00, desc: 'Batata, bolinho, isca de peixe e calabresa' },
  { id: '11', cat: 'porcoes', nom: 'Peixe Grelhado', emoji: '🐟', prix: 68.00, desc: 'Filé do dia grelhado com limão e ervas' },
  { id: '12', cat: 'porcoes', nom: 'Frango na Brasa', emoji: '🍗', prix: 45.00, desc: 'Meio frango caipira na brasa com farofa' },
  { id: '13', cat: 'sobremesas', nom: 'Açaí na Tigela', emoji: '🫐', prix: 24.00, desc: 'Açaí cremoso com granola e banana' },
  { id: '14', cat: 'sobremesas', nom: 'Picolé Artesanal', emoji: '🍦', prix: 8.00, desc: 'Sabores: coco, limão, maracujá ou morango' },
]

export default function DemoCliente() {
  const navigate = useNavigate()
  const [catAtiva, setCatAtiva] = useState('bebidas')
  const [cart, setCart] = useState([])
  const [screen, setScreen] = useState('menu') // menu | cart | payment | confirmed
  const [modalItem, setModalItem] = useState(null)
  const [obs, setObs] = useState('')
  const [variacaoIdx, setVariacaoIdx] = useState(null)
  const [pagamento, setPagamento] = useState('pix')

  const itemsDaCat = ITEMS.filter(i => i.cat === catAtiva)
  const total = cart.reduce((s, i) => s + i.prixEfetivo * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  function addToCart(item, qty, obs, variacao) {
    const prixEfetivo = variacao ? variacao.prix : item.prix
    const key = item.id + (variacao?.nom ?? '') + obs
    setCart(prev => {
      const ex = prev.find(c => c.key === key)
      if (ex) return prev.map(c => c.key === key ? { ...c, qty: c.qty + qty } : c)
      return [...prev, { ...item, key, qty, obs, variacaoNom: variacao?.nom, prixEfetivo }]
    })
    setModalItem(null); setObs(''); setVariacaoIdx(null)
  }

  function openModal(item) {
    setModalItem(item); setObs(''); setVariacaoIdx(null)
  }

  // ── CONFIRMADO ──
  if (screen === 'confirmed') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0D2137,#1A3A5C)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ width: 100, height: 100, background: '#06D6A0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: 24, boxShadow: '0 0 60px rgba(6,214,160,0.4)' }}>✓</div>
        <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 28, fontWeight: 800, color: '#F5E6C8', marginBottom: 8 }}>Pedido Confirmado!</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 8 }}>Estamos preparando tudo com carinho 🌊</p>
        <div style={{ background: 'rgba(0,180,216,0.15)', border: '1px solid rgba(0,180,216,0.3)', borderRadius: 14, padding: '14px 24px', margin: '16px 0 32px', fontSize: 22, fontFamily: "'Baloo 2',cursive", fontWeight: 800, color: '#F5E6C8' }}>
          Pedido #07 · 🏖️ GS-12
        </div>
        <div style={{ width: '100%', maxWidth: 360 }}>
          {[
            { id: 'pago', icon: '✓', label: 'Pagamento Aprovado', done: true },
            { id: 'cozinha', icon: '👨‍🍳', label: 'Preparando na Cozinha', done: false },
            { id: 'entrega', icon: '🛵', label: 'A caminho do guarda-sol', done: false },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.done ? '#06D6A0' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
              <span style={{ fontSize: 14, color: s.done ? '#06D6A0' : 'rgba(255,255,255,0.4)', fontWeight: s.done ? 600 : 400 }}>{s.label}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setCart([]); setScreen('menu') }} style={{ marginTop: 32, background: 'rgba(0,180,216,0.15)', border: '1.5px solid rgba(0,180,216,0.3)', borderRadius: 12, padding: '12px 24px', color: '#48CAE4', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
          🔄 Novo pedido
        </button>
        <button onClick={() => navigate('/demo')} style={{ marginTop: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
          ← Voltar à demo
        </button>
      </div>
    )
  }

  // ── PAGAMENTO ──
  if (screen === 'payment') {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'var(--ocean,#0D2137)', padding: '20px 20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setScreen('cart')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 20 }}>←</button>
          <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#F5E6C8' }}>Pagamento (Demo)</h2>
        </div>
        <div style={{ flex: 1, padding: '20px 16px 120px' }}>
          <div style={{ background: '#FFF9E6', border: '1px solid #FDE68A', borderRadius: 12, padding: 14, marginBottom: 20, display: 'flex', gap: 10 }}>
            <span>⚠️</span>
            <span style={{ fontSize: 13, color: '#92400E', fontFamily: 'Inter,sans-serif' }}>Modo demonstração — nenhum pagamento real será processado.</span>
          </div>
          <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
            {cart.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748B', marginBottom: 6 }}>
                <span>{item.qty}× {item.emoji} {item.nom}{item.variacaoNom ? ` (${item.variacaoNom})` : ''}</span>
                <span>{fmt(item.prixEfetivo * item.qty)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#0D2137' }}>
              <span>Total</span><span>{fmt(total)}</span>
            </div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 10, fontFamily: 'Inter,sans-serif' }}>Forma de Pagamento</p>
          {[
            { id: 'pix', icon: '💰', label: 'PIX', desc: 'Aprovação instantânea', badge: 'Recomendado' },
            { id: 'credito', icon: '💳', label: 'Cartão de Crédito', desc: 'Simulado' },
            { id: 'dinheiro', icon: '💵', label: 'Dinheiro', desc: 'Garçom vem buscar' },
          ].map(m => (
            <div key={m.id} onClick={() => setPagamento(m.id)} style={{ border: `2px solid ${pagamento === m.id ? '#00B4D8' : 'transparent'}`, borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, cursor: 'pointer', background: pagamento === m.id ? '#EBF9FD' : 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: '#0D2137' }}>{m.label}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{m.desc}</div>
              </div>
              {m.badge && <span style={{ background: '#00B4D8', color: 'white', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{m.badge}</span>}
            </div>
          ))}
        </div>
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 600, background: '#F0F7FF', padding: '12px 16px 20px', boxShadow: '0 -4px 24px rgba(0,0,0,0.1)' }}>
          <button onClick={() => setScreen('confirmed')} style={{ width: '100%', background: '#06D6A0', color: '#0D2137', border: 'none', borderRadius: 12, padding: 14, fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            ✅ Simular Pagamento — {fmt(total)}
          </button>
        </div>
      </div>
    )
  }

  // ── CARRINHO ──
  if (screen === 'cart') {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#0D2137', padding: '20px 20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setScreen('menu')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 20 }}>←</button>
          <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#F5E6C8' }}>Meu Pedido</h2>
        </div>
        <div style={{ flex: 1, padding: '16px 16px 160px' }}>
          {cart.map((item, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 48, height: 48, background: '#F0F7FF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 14, fontWeight: 700, color: '#0D2137' }}>{item.nom}</div>
                {item.variacaoNom && <div style={{ fontSize: 12, color: '#00B4D8', fontWeight: 600 }}>📐 {item.variacaoNom}</div>}
                <div style={{ fontSize: 13, color: '#64748B' }}>{fmt(item.prixEfetivo)} × {item.qty} = <strong>{fmt(item.prixEfetivo * item.qty)}</strong></div>
                {item.obs && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>📝 {item.obs}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F0F7FF', borderRadius: 50, padding: 4 }}>
                <button onClick={() => setCart(prev => prev.map(c => c.key === item.key ? { ...c, qty: c.qty - 1 } : c).filter(c => c.qty > 0))} style={{ width: 28, height: 28, border: 'none', borderRadius: '50%', background: 'white', fontSize: 16, cursor: 'pointer', color: '#0D2137' }}>−</button>
                <span style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 15, color: '#0D2137', minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => setCart(prev => prev.map(c => c.key === item.key ? { ...c, qty: c.qty + 1 } : c))} style={{ width: 28, height: 28, border: 'none', borderRadius: '50%', background: 'white', fontSize: 16, cursor: 'pointer', color: '#0D2137' }}>+</button>
              </div>
            </div>
          ))}
          <div style={{ background: '#0D2137', borderRadius: 16, padding: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 700, color: 'white', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span>Total</span><span>{fmt(total)}</span>
            </div>
          </div>
        </div>
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 600, background: '#F0F7FF', padding: '12px 16px 20px', boxShadow: '0 -4px 24px rgba(0,0,0,0.1)' }}>
          <button onClick={() => setScreen('payment')} style={{ width: '100%', background: '#0D2137', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            💳 Ir para Pagamento — {fmt(total)}
          </button>
        </div>
      </div>
    )
  }

  // ── MENU ──
  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: '#0D2137', padding: '16px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: '#F5E6C8' }}>🌊 Quiosque Demo</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>🏖️ Guarda-sol GS-12 · Guarujá/SP</div>
          </div>
          <button onClick={() => navigate('/demo')} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>← Demo</button>
        </div>
        <div style={{ background: '#FFF3CD', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#856404', fontFamily: 'Inter,sans-serif' }}>
          ⚠️ Modo demonstração — pedidos não são reais
        </div>
      </div>

      {/* Categorias */}
      <div style={{ background: '#0D2137', paddingBottom: 16, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, padding: '0 16px', whiteSpace: 'nowrap' }}>
          {CATEGORIAS.map(cat => (
            <button key={cat.id} onClick={() => setCatAtiva(cat.id)} style={{ background: catAtiva === cat.id ? '#00B4D8' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 50, padding: '7px 16px', color: catAtiva === cat.id ? '#0D2137' : 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: catAtiva === cat.id ? 700 : 500, cursor: 'pointer', fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap' }}>
              {cat.emoji} {cat.nom}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div style={{ flex: 1, padding: '16px 16px 100px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'Inter,sans-serif' }}>
          {CATEGORIAS.find(c => c.id === catAtiva)?.emoji} {CATEGORIAS.find(c => c.id === catAtiva)?.nom}
        </p>
        {itemsDaCat.map(item => {
          const cartQty = cart.filter(c => c.id === item.id).reduce((s, c) => s + c.qty, 0)
          return (
            <div key={item.id} onClick={() => openModal(item)} style={{ background: 'white', borderRadius: 16, padding: 16, display: 'flex', gap: 14, marginBottom: 10, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: cartQty > 0 ? '2px solid #06D6A0' : '2px solid transparent' }}>
              <div style={{ width: 60, height: 60, background: '#F0F7FF', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#0D2137', marginBottom: 2 }}>
                  {item.nom}
                  {cartQty > 0 && <span style={{ background: '#06D6A0', color: '#0D2137', fontSize: 11, fontWeight: 700, borderRadius: 50, padding: '1px 7px', marginLeft: 8 }}>{cartQty}</span>}
                </div>
                <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.4, marginBottom: 6 }}>{item.desc}</div>
                {item.variacoes ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {item.variacoes.map(v => <span key={v.nom} style={{ fontSize: 12, background: '#F0F7FF', borderRadius: 6, padding: '2px 8px', color: '#0D2137', fontWeight: 600 }}>{v.nom}: {fmt(v.prix)}</span>)}
                  </div>
                ) : (
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 800, color: '#0D2137' }}>{fmt(item.prix)}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Cart bar */}
      {count > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 600, padding: '12px 16px 20px', background: '#F0F7FF', boxShadow: '0 -4px 24px rgba(0,0,0,0.1)' }}>
          <button onClick={() => setScreen('cart')} style={{ width: '100%', background: '#0D2137', color: 'white', border: 'none', borderRadius: 14, padding: '14px 20px', fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ background: '#00B4D8', borderRadius: '50%', width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#0D2137' }}>{count}</span>
            <span>Ver Pedido</span>
            <span>{fmt(total)}</span>
          </button>
        </div>
      )}

      {/* Modal item */}
      {modalItem && (
        <div onClick={() => setModalItem(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 20px 32px', width: '100%', maxWidth: 600, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, background: '#E2E8F0', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontSize: 64, textAlign: 'center', marginBottom: 12 }}>{modalItem.emoji}</div>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: '#0D2137', textAlign: 'center', marginBottom: 6 }}>{modalItem.nom}</div>
            <div style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>{modalItem.desc}</div>

            {modalItem.variacoes ? (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0D2137', marginBottom: 8 }}>Escolha a variação *</div>
                {modalItem.variacoes.map((v, i) => (
                  <div key={i} onClick={() => setVariacaoIdx(i)} style={{ border: `2px solid ${variacaoIdx === i ? '#0D2137' : '#E2E8F0'}`, borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', marginBottom: 8, cursor: 'pointer', background: variacaoIdx === i ? '#F0F7FF' : 'white' }}>
                    <span style={{ fontSize: 15, fontWeight: variacaoIdx === i ? 700 : 500 }}>{v.nom}</span>
                    <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 800, color: '#0D2137' }}>{fmt(v.prix)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 28, fontWeight: 800, color: '#0D2137' }}>{fmt(modalItem.prix)}</div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 6 }}>Observação (opcional)</label>
              <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Ex: sem cebola, bem passado..." rows={2}
                style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <button
              onClick={() => {
                if (modalItem.variacoes && variacaoIdx === null) return
                addToCart(modalItem, 1, obs, modalItem.variacoes ? modalItem.variacoes[variacaoIdx] : null)
              }}
              disabled={modalItem.variacoes && variacaoIdx === null}
              style={{ width: '100%', background: (modalItem.variacoes && variacaoIdx === null) ? '#E2E8F0' : '#0D2137', color: (modalItem.variacoes && variacaoIdx === null) ? '#94A3B8' : 'white', border: 'none', borderRadius: 12, padding: 14, fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, cursor: (modalItem.variacoes && variacaoIdx === null) ? 'not-allowed' : 'pointer' }}>
              🛒 Adicionar — {fmt(modalItem.variacoes && variacaoIdx !== null ? modalItem.variacoes[variacaoIdx].prix : modalItem.prix)}
              {modalItem.variacoes && variacaoIdx === null && ' (selecione variação)'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
