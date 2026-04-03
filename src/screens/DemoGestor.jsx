import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

// ── DONNÉES INITIALES ─────────────────────────────────
const CATS_INIT = [
  { id: 'c1', nom: 'Bebidas', emoji: '🍺', ordre: 1, actif: true },
  { id: 'c2', nom: 'Frutos do Mar', emoji: '🦐', ordre: 2, actif: true },
  { id: 'c3', nom: 'Petiscos', emoji: '🍟', ordre: 3, actif: true },
  { id: 'c4', nom: 'Porções', emoji: '🍖', ordre: 4, actif: true },
  { id: 'c5', nom: 'Sobremesas', emoji: '🍨', ordre: 5, actif: true },
]

const ITEMS_INIT = [
  { id: 'i1', catId: 'c1', nom: 'Cerveja Gelada', emoji: '🍺', prix: 9.00, desc: 'Long neck 355ml', actif: true },
  { id: 'i2', catId: 'c1', nom: 'Água de Coco', emoji: '🥥', prix: 12.00, desc: 'Na própria casca', actif: true },
  { id: 'i3', catId: 'c1', nom: 'Caipirinha', emoji: '🍸', prix: 22.00, desc: 'Cachaça artesanal', actif: true },
  { id: 'i4', catId: 'c2', nom: 'Camarão Grelhado', emoji: '🦐', prix: 58.00, desc: 'VG na manteiga e alho', actif: true, variacoes: [{ nom: 'Inteira', prix: 58 }, { nom: 'Meia', prix: 32 }] },
  { id: 'i5', catId: 'c2', nom: 'Casquinha de Siri', emoji: '🦀', prix: 18.00, desc: 'Gratinado com catupiry', actif: true },
  { id: 'i6', catId: 'c3', nom: 'Batata Frita', emoji: '🍟', prix: 28.00, desc: 'Crocante com molhos', actif: true },
  { id: 'i7', catId: 'c3', nom: 'Bolinho de Bacalhau', emoji: '🫓', prix: 35.00, desc: '8 unidades', actif: true },
  { id: 'i8', catId: 'c4', nom: 'Peixe Grelhado', emoji: '🐟', prix: 68.00, desc: 'Filé do dia', actif: true },
  { id: 'i9', catId: 'c5', nom: 'Açaí na Tigela', emoji: '🫐', prix: 24.00, desc: 'Com granola e banana', actif: true },
]

const EQUIPE_INIT = [
  { id: 'e1', nom: 'Maria Silva', role: 'cozinha', pin: '••••', actif: true },
  { id: 'e2', nom: 'João Santos', role: 'garcom', pin: '••••', actif: true },
  { id: 'e3', nom: 'Ana Costa', role: 'caixa', pin: '••••', actif: true },
]

const PARASOLS_INIT = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i}`, numero: `GS-${String(i + 1).padStart(2, '0')}`, actif: true
}))

const ROLES = ['cozinha', 'garcom', 'caixa']
const EMOJIS = ['🍺', '🥥', '🍹', '🍸', '🦐', '🦀', '🦑', '🍟', '🫓', '🍽️', '🐟', '🍗', '🫐', '🍦', '🥗', '🍔', '🌮']

export default function DemoGestor() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const [cats, setCats] = useState(CATS_INIT)
  const [items, setItems] = useState(ITEMS_INIT)
  const [equipe, setEquipe] = useState(EQUIPE_INIT)
  const [parasols, setParasols] = useState(PARASOLS_INIT)
  const [toast, setToast] = useState('')

  // Modals
  const [catModal, setCatModal] = useState(null) // null | {id?,nom,emoji,actif}
  const [itemModal, setItemModal] = useState(null)
  const [equipeModal, setEquipeModal] = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500) }
  const uid = () => Math.random().toString(36).slice(2, 8)

  // ── CATS CRUD ──
  function saveCat() {
    if (!catModal.nom) { showToast('⚠️ Informe o nome'); return }
    if (catModal.id) {
      setCats(prev => prev.map(c => c.id === catModal.id ? { ...c, ...catModal } : c))
      showToast('✅ Categoria atualizada')
    } else {
      setCats(prev => [...prev, { ...catModal, id: uid(), ordre: prev.length + 1, actif: true }])
      showToast('✅ Categoria criada')
    }
    setCatModal(null)
  }

  // ── ITEMS CRUD ──
  function saveItem() {
    if (!itemModal.nom || !itemModal.prix || !itemModal.catId) { showToast('⚠️ Preencha todos os campos'); return }
    if (itemModal.id) {
      setItems(prev => prev.map(i => i.id === itemModal.id ? { ...i, ...itemModal, prix: parseFloat(itemModal.prix) } : i))
      showToast('✅ Item atualizado')
    } else {
      setItems(prev => [...prev, { ...itemModal, id: uid(), prix: parseFloat(itemModal.prix), actif: true }])
      showToast('✅ Item criado')
    }
    setItemModal(null)
  }

  // ── EQUIPE CRUD ──
  function saveEquipe() {
    if (!equipeModal.nom || !equipeModal.role) { showToast('⚠️ Preencha todos os campos'); return }
    if (equipeModal.id) {
      setEquipe(prev => prev.map(e => e.id === equipeModal.id ? { ...e, ...equipeModal } : e))
      showToast('✅ Funcionário atualizado')
    } else {
      setEquipe(prev => [...prev, { ...equipeModal, id: uid(), pin: '••••', actif: true }])
      showToast('✅ Funcionário adicionado')
    }
    setEquipeModal(null)
  }

  const TABS = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'cardapio', icon: '🍽️', label: 'Cardápio' },
    { id: 'categorias', icon: '📂', label: 'Categorias' },
    { id: 'equipe', icon: '👥', label: 'Equipe' },
    { id: 'qrcodes', icon: '📱', label: 'QR Codes' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', fontFamily: 'Inter, sans-serif' }}>

      {/* Toast */}
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#0D2137', color: 'white', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>{toast}</div>}

      {/* Header */}
      <div style={{ background: '#0D2137', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#F5E6C8' }}>⚙️ Painel Gestor</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>🏖️ Quiosque Demo · Guarujá/SP</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ background: '#FFF3CD', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#856404', fontWeight: 600 }}>DEMO</div>
          <button onClick={() => navigate('/demo')} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>← Sair</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: '#0D2137', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: '0 0 auto', padding: '10px 16px', border: 'none', background: 'none', color: tab === t.id ? '#00B4D8' : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', borderBottom: tab === t.id ? '2px solid #00B4D8' : '2px solid transparent', transition: 'all 0.15s', whiteSpace: 'nowrap', fontFamily: 'Inter,sans-serif' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px 16px 80px', maxWidth: 700, margin: '0 auto' }}>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <>
            <div style={{ background: '#FFF9E6', border: '1px solid #FDE68A', borderRadius: 12, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#92400E' }}>
              ⚠️ Dados demonstrativos — não refletem dados reais
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Pedidos hoje', val: '23', sub: '+5 última hora', color: '#00B4D8' },
                { label: 'Faturamento', val: 'R$ 1.847', sub: 'Simulado', color: '#06D6A0' },
                { label: 'Ticket médio', val: 'R$ 80,30', sub: 'Demo', color: '#F59E0B' },
                { label: 'Itens vendidos', val: '87', sub: 'Simulado', color: '#A78BFA' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#0D2137', marginBottom: 14 }}>Entregas por Garçom — Demo</div>
              {[{ nom: 'João Santos', total: 12, valor: 'R$ 743' }, { nom: 'Ana Costa', total: 11, valor: 'R$ 689' }].map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i === 0 ? '1px solid #F1F5F9' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFF9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛵</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0D2137' }}>{g.nom}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>{g.valor}</div>
                  </div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: '#00B4D8' }}>{g.total}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CARDÁPIO ── */}
        {tab === 'cardapio' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#0D2137' }}>Itens do Cardápio ({items.length})</div>
              <button onClick={() => setItemModal({ nom: '', emoji: '🍽️', prix: '', desc: '', catId: cats[0]?.id ?? '', actif: true })} style={{ background: '#0D2137', color: 'white', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                + Novo item
              </button>
            </div>
            {cats.map(cat => {
              const catItems = items.filter(i => i.catId === cat.id)
              if (!catItems.length) return null
              return (
                <div key={cat.id} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {cat.emoji} {cat.nom}
                  </div>
                  {catItems.map(item => (
                    <div key={item.id} style={{ background: 'white', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', opacity: item.actif ? 1 : 0.5 }}>
                      <div style={{ fontSize: 28, flexShrink: 0 }}>{item.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#0D2137' }}>{item.nom}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8' }}>{item.desc}</div>
                        {item.variacoes && <div style={{ fontSize: 11, color: '#00B4D8', marginTop: 2 }}>📐 {item.variacoes.map(v => v.nom).join(' · ')}</div>}
                      </div>
                      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#0D2137', marginRight: 8 }}>{fmt(item.prix)}</div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setItemModal({ ...item, prix: String(item.prix) })} style={{ background: '#EFF9FF', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#00B4D8', cursor: 'pointer', fontWeight: 600 }}>✏️</button>
                        <button onClick={() => { setItems(prev => prev.map(i => i.id === item.id ? { ...i, actif: !i.actif } : i)); showToast(item.actif ? '⏸️ Item desativado' : '✅ Item ativado') }} style={{ background: item.actif ? '#FEF3C7' : '#F0FDF4', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>
                          {item.actif ? '⏸️' : '▶️'}
                        </button>
                        <button onClick={() => { setItems(prev => prev.filter(i => i.id !== item.id)); showToast('🗑️ Item removido') }} style={{ background: '#FEE2E2', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#DC2626', cursor: 'pointer' }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </>
        )}

        {/* ── CATEGORIAS ── */}
        {tab === 'categorias' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#0D2137' }}>Categorias ({cats.length})</div>
              <button onClick={() => setCatModal({ nom: '', emoji: '🍽️' })} style={{ background: '#0D2137', color: 'white', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                + Nova categoria
              </button>
            </div>
            {cats.map((cat, i) => (
              <div key={cat.id} style={{ background: 'white', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', opacity: cat.actif ? 1 : 0.5 }}>
                <div style={{ fontSize: 32 }}>{cat.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#0D2137' }}>{cat.nom}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{items.filter(i => i.catId === cat.id).length} itens</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setCatModal({ ...cat })} style={{ background: '#EFF9FF', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#00B4D8', cursor: 'pointer', fontWeight: 600 }}>✏️ Editar</button>
                  <button onClick={() => { setCats(prev => prev.filter(c => c.id !== cat.id)); showToast('🗑️ Categoria removida') }} style={{ background: '#FEE2E2', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#DC2626', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── EQUIPE ── */}
        {tab === 'equipe' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#0D2137' }}>Equipe ({equipe.length})</div>
              <button onClick={() => setEquipeModal({ nom: '', role: 'garcom' })} style={{ background: '#0D2137', color: 'white', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                + Adicionar
              </button>
            </div>
            {equipe.map(func => (
              <div key={func.id} style={{ background: 'white', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {func.role === 'cozinha' ? '👨‍🍳' : func.role === 'garcom' ? '🛵' : '💰'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#0D2137' }}>{func.nom}</div>
                  <div style={{ fontSize: 12, color: '#00B4D8', fontWeight: 600, textTransform: 'capitalize' }}>{func.role} · PIN: {func.pin}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setEquipeModal({ ...func })} style={{ background: '#EFF9FF', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#00B4D8', cursor: 'pointer', fontWeight: 600 }}>✏️</button>
                  <button onClick={() => { setEquipe(prev => prev.filter(e => e.id !== func.id)); showToast('🗑️ Funcionário removido') }} style={{ background: '#FEE2E2', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#DC2626', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── QR CODES ── */}
        {tab === 'qrcodes' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#0D2137' }}>Guarda-Sóis ({parasols.filter(p => p.actif).length} ativos)</div>
              <button onClick={() => { const n = `GS-${String(parasols.length + 1).padStart(2, '0')}`; setParasols(prev => [...prev, { id: uid(), numero: n, actif: true }]); showToast(`✅ ${n} adicionado`) }} style={{ background: '#0D2137', color: 'white', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                + Adicionar
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {parasols.map(p => (
                <div key={p.id} style={{ background: 'white', borderRadius: 14, padding: 14, textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', opacity: p.actif ? 1 : 0.5 }}>
                  <div style={{ width: 60, height: 60, background: '#F0F7FF', border: '3px solid #0D2137', borderRadius: 8, margin: '0 auto 8px', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 1, padding: 4 }}>
                    {Array.from({ length: 25 }, (_, i) => <div key={i} style={{ borderRadius: 0.5, background: [0,1,5,7,10,14,17,19,20,24].includes(i) || Math.random() > 0.5 ? '#0D2137' : 'transparent' }} />)}
                  </div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 14, fontWeight: 700, color: '#0D2137', marginBottom: 8 }}>🏖️ {p.numero}</div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    <button onClick={() => showToast(`📥 QR de ${p.numero} baixado (demo)`)} style={{ background: '#0D2137', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>⬇ QR</button>
                    <button onClick={() => { setParasols(prev => prev.map(ps => ps.id === p.id ? { ...ps, actif: !ps.actif } : ps)); showToast(`🔄 ${p.numero} ${p.actif ? 'desativado' : 'ativado'}`) }} style={{ background: '#FEF3C7', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', color: '#92400E' }}>🔄</button>
                    <button onClick={() => { setParasols(prev => prev.filter(ps => ps.id !== p.id)); showToast(`🗑️ ${p.numero} removido`) }} style={{ background: '#FEE2E2', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', color: '#DC2626' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── MODAL CATEGORIA ── */}
      {catModal && (
        <div onClick={() => setCatModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 20px 32px', width: '100%', maxWidth: 500 }}>
            <div style={{ width: 36, height: 4, background: '#E2E8F0', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#0D2137', marginBottom: 20 }}>
              {catModal.id ? 'Editar Categoria' : 'Nova Categoria'}
            </div>
            <label style={sl}>Emoji</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {EMOJIS.map(e => <button key={e} onClick={() => setCatModal(c => ({ ...c, emoji: e }))} style={{ fontSize: 22, background: catModal.emoji === e ? '#F0F7FF' : 'transparent', border: catModal.emoji === e ? '2px solid #00B4D8' : '2px solid transparent', borderRadius: 8, padding: 4, cursor: 'pointer' }}>{e}</button>)}
            </div>
            <label style={sl}>Nome *</label>
            <input style={si} value={catModal.nom} onChange={e => setCatModal(c => ({ ...c, nom: e.target.value }))} placeholder="Ex: Bebidas" autoFocus />
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setCatModal(null)} style={{ flex: 1, background: '#F1F5F9', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={saveCat} style={{ flex: 2, background: '#0D2137', color: 'white', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>✅ Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ITEM ── */}
      {itemModal && (
        <div onClick={() => setItemModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 20px 32px', width: '100%', maxWidth: 500, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ width: 36, height: 4, background: '#E2E8F0', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#0D2137', marginBottom: 20 }}>
              {itemModal.id ? 'Editar Item' : 'Novo Item'}
            </div>
            <label style={sl}>Emoji</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {EMOJIS.map(e => <button key={e} onClick={() => setItemModal(i => ({ ...i, emoji: e }))} style={{ fontSize: 22, background: itemModal.emoji === e ? '#F0F7FF' : 'transparent', border: itemModal.emoji === e ? '2px solid #00B4D8' : '2px solid transparent', borderRadius: 8, padding: 4, cursor: 'pointer' }}>{e}</button>)}
            </div>
            <label style={sl}>Categoria *</label>
            <select style={{ ...si, background: 'white' }} value={itemModal.catId} onChange={e => setItemModal(i => ({ ...i, catId: e.target.value }))}>
              {cats.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nom}</option>)}
            </select>
            <label style={sl}>Nome *</label>
            <input style={si} value={itemModal.nom} onChange={e => setItemModal(i => ({ ...i, nom: e.target.value }))} placeholder="Ex: Camarão Grelhado" />
            <label style={sl}>Preço (R$) *</label>
            <input style={si} type="number" value={itemModal.prix} onChange={e => setItemModal(i => ({ ...i, prix: e.target.value }))} placeholder="0.00" step="0.50" />
            <label style={sl}>Descrição</label>
            <textarea style={{ ...si, resize: 'none' }} rows={2} value={itemModal.desc || ''} onChange={e => setItemModal(i => ({ ...i, desc: e.target.value }))} placeholder="Descreva o item..." />
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setItemModal(null)} style={{ flex: 1, background: '#F1F5F9', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={saveItem} style={{ flex: 2, background: '#0D2137', color: 'white', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>✅ Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EQUIPE ── */}
      {equipeModal && (
        <div onClick={() => setEquipeModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 20px 32px', width: '100%', maxWidth: 500 }}>
            <div style={{ width: 36, height: 4, background: '#E2E8F0', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#0D2137', marginBottom: 20 }}>
              {equipeModal.id ? 'Editar Funcionário' : 'Novo Funcionário'}
            </div>
            <label style={sl}>Nome completo *</label>
            <input style={si} value={equipeModal.nom} onChange={e => setEquipeModal(f => ({ ...f, nom: e.target.value }))} placeholder="Ex: Maria Silva" autoFocus />
            <label style={sl}>Função *</label>
            <select style={{ ...si, background: 'white' }} value={equipeModal.role} onChange={e => setEquipeModal(f => ({ ...f, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{r === 'cozinha' ? '👨‍🍳 Cozinha' : r === 'garcom' ? '🛵 Garçom' : '💰 Caixa'}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setEquipeModal(null)} style={{ flex: 1, background: '#F1F5F9', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={saveEquipe} style={{ flex: 2, background: '#0D2137', color: 'white', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>✅ Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const sl = { display: 'block', fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 6 }
const si = { width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '11px 14px', fontSize: 15, fontFamily: 'Inter,sans-serif', outline: 'none', marginBottom: 14, boxSizing: 'border-box' }
