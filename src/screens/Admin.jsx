import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { useUser, SignOutButton } from '@clerk/clerk-react'
import { api } from '../../convex/_generated/api'
import { useToast } from '../context/ToastContext'
import EmojiPicker from '../components/EmojiPicker'
import AdminPagamento from './AdminPagamento'

const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

export default function Admin() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, isLoaded } = useUser()
  const { showToast } = useToast()
  const [tab, setTab] = useState('dashboard')

  const kiosque = useQuery(api.kiosques.getBySlug, { slug })
  const stats = useQuery(api.pedidos.getEstatisticas, kiosque ? { kiosqueId: kiosque._id } : 'skip')
  const historico = useQuery(api.pedidos.getHistorico, kiosque ? { kiosqueId: kiosque._id } : 'skip')
  const statsGarcom = useQuery(api.pedidos.getEstatisticasGarcom, kiosque ? { kiosqueId: kiosque._id } : 'skip')
  const categorias = useQuery(api.cardapio.listarCategorias, kiosque ? { kiosqueId: kiosque._id } : 'skip')
  const items = useQuery(api.cardapio.listarItems, kiosque ? { kiosqueId: kiosque._id } : 'skip')
  const funcionarios = useQuery(api.pinAuth.listarFuncionarios, kiosque ? { kiosqueId: kiosque._id } : 'skip')
  const notifs = useQuery(api.notifications.listar, kiosque ? { kiosqueId: kiosque._id } : 'skip')

  if (!isLoaded) return <Loading />
  if (!user) { navigate(`/admin/${slug}/login`); return null }

  const unreadNotifs = notifs?.filter(n => !n.lue).length ?? 0

  const TABS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'cardapio', label: 'Cardápio' },
    { id: 'categorias', label: 'Categorias' },
    { id: 'equipe', label: 'Equipe' },
    { id: 'pagamento', label: '💳 Pagamento' },
    { id: 'qrcodes', label: 'QR Codes' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--ocean)', padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: 'var(--sand)' }}>
              📊 Gestão {unreadNotifs > 0 && <span style={{ background: '#FF6B6B', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', marginLeft: 6 }}>{unreadNotifs}</span>}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--wave-light)', marginTop: 2 }}>{kiosque?.nom} · {kiosque?.ville}, {kiosque?.etat}</p>
          </div>
          <SignOutButton redirectUrl={`/admin/${slug}/login`}>
            <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, padding: '8px 12px', color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Sair</button>
          </SignOutButton>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', overflowX: 'auto', gap: 0, scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'none', border: 'none', padding: '10px 14px',
              color: tab === t.id ? 'white' : 'rgba(255,255,255,0.5)',
              fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter,sans-serif',
              borderBottom: tab === t.id ? '2px solid #06D6A0' : '2px solid transparent',
              transition: 'all 0.2s'
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 80px' }}>
        {tab === 'dashboard' && <DashboardTab stats={stats} historico={historico} notifs={notifs} kiosque={kiosque} showToast={showToast} statsGarcom={statsGarcom} />}
        {tab === 'cardapio' && <CardapioTab items={items} categorias={categorias} kiosque={kiosque} showToast={showToast} />}
        {tab === 'categorias' && <CategoriasTab categorias={categorias} kiosque={kiosque} showToast={showToast} />}
        {tab === 'equipe' && <EquipeTab funcionarios={funcionarios} kiosque={kiosque} showToast={showToast} />}
        {tab === 'pagamento' && <AdminPagamento kiosque={kiosque} />}
        {tab === 'qrcodes' && <QRCodesTab kiosque={kiosque} slug={slug} />}
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────
function DashboardTab({ stats, historico, notifs, kiosque, showToast, statsGarcom }) {
  const marcarLida = useMutation(api.notifications.marcarLida)
  const unread = notifs?.filter(n => !n.lue) ?? []

  return (
    <>
      {/* Alertas */}
      {unread.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#FF6B6B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            🔔 Alertas <span style={{ background: '#FF6B6B', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{unread.length}</span>
          </p>
          {unread.map(n => (
            <div key={n._id} style={{ background: 'white', borderLeft: `4px solid ${n.type === 'cancelamento_total' ? '#FF6B6B' : '#F59E0B'}`, borderRadius: '0 16px 16px 0', padding: '14px 16px', marginBottom: 10, boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 14, fontWeight: 700, color: n.type === 'cancelamento_total' ? '#FF6B6B' : '#D97706' }}>
                  {n.type === 'cancelamento_total' ? '🚫 Cancelamento Total' : '⚠️ Cancelamento Parcial'} — Pedido #{n.pedidoNumero}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.parasolNumero}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                <strong>Motivo:</strong> {n.motivo} · <strong>Reembolso:</strong> {fmt(n.montant)}
              </p>
              <button onClick={() => marcarLida({ notifId: n._id })} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'Inter,sans-serif' }}>
                ✓ Ciente
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Faturamento Hoje', val: fmt(stats?.faturamentoHoje ?? 0), change: '📈' },
          { label: 'Pedidos Hoje', val: stats?.totalHoje ?? 0, change: '🛒' },
          { label: 'Ticket Médio', val: fmt(stats?.ticketMedio ?? 0), change: '💰' },
          { label: 'Em Preparo', val: (stats?.pendentes ?? 0) + (stats?.emPreparo ?? 0), change: '🍳' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: 'var(--ocean)' }}>{s.val}</div>
            <div style={{ fontSize: 11, marginTop: 2 }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Histórico */}
      {/* Stats por Garçom */}
      {statsGarcom && statsGarcom.length > 0 && (
        <>
          <p className="section-title">Entregas por Garçom — Hoje</p>
          <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow-card)', marginBottom: 24 }}>
            {statsGarcom.map((g, i) => (
              <div key={g.nom} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < statsGarcom.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFF9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  🛵
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{g.nom}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{fmt(g.valor)} entregues</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: 'var(--ocean)' }}>{g.total}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>pedidos</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="section-title">Pedidos Recentes</p>
      <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow-card)' }}>
        {!historico && <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>}
        {historico?.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nenhum pedido hoje</div>}
        {historico?.map(p => {
          const statusColors = { pago: '#00B4D8', cozinha: '#F59E0B', pronto: '#06D6A0', entregue: '#8AAABB', cancelado: '#FF6B6B', parcial: '#F59E0B' }
          const statusLabels = { pago: 'Novo', cozinha: 'Cozinha', pronto: 'Pronto', entregue: 'Entregue', cancelado: 'Cancelado', parcial: 'Parcial' }
          return (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <span style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, color: 'var(--ocean)' }}>#{p.numero}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>{p.parasolNumero}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ocean)' }}>{fmt(p.total - p.totalRembourse)}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: statusColors[p.statut], background: statusColors[p.statut] + '22', padding: '3px 10px', borderRadius: 8 }}>{statusLabels[p.statut]}</span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ── Cardápio ─────────────────────────────────────────
function CardapioTab({ items, categorias, kiosque, showToast }) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nom: '', description: '', prix: '', emoji: '🍽️', categorieId: '', sku: '', variacoes: [] })
  const criarItem = useMutation(api.cardapio.criarItem)
  const editarItem = useMutation(api.cardapio.editarItem)
  const excluirItem = useMutation(api.cardapio.excluirItem)
  const toggleDisp = useMutation(api.cardapio.toggleDisponivel)

  async function saveItem() {
    const temVariacoes = form.variacoes && form.variacoes.length > 0
    if (!form.nom || !form.categorieId) { showToast('⚠️ Preencha nome e categoria'); return }
    if (!temVariacoes && !form.prix) { showToast('⚠️ Informe o preço ou adicione variações'); return }
    if (temVariacoes && form.variacoes.some(v => !v.nom || !v.prix)) { showToast('⚠️ Preencha nome e preço de cada variação'); return }
    try {
      if (editing) {
        await editarItem({ itemId: editing._id, nom: form.nom, description: form.description, prix: parseFloat(form.prix) || (form.variacoes[0]?.prix ?? 0), emoji: form.emoji, categorieId: form.categorieId, sku: form.sku || undefined, variacoes: form.variacoes.length > 0 ? form.variacoes : undefined })
        showToast('✅ Item atualizado!')
      } else {
        await criarItem({ categorieId: form.categorieId, nom: form.nom, description: form.description, prix: parseFloat(form.prix) || (form.variacoes[0]?.prix ?? 0), emoji: form.emoji, sku: form.sku || undefined, variacoes: form.variacoes.length > 0 ? form.variacoes : undefined })
        showToast('✅ Item adicionado!')
      }
      setShowModal(false); setEditing(null); setForm({ nom: '', description: '', prix: '', emoji: '🍽️', categorieId: '', sku: '', variacoes: [] })
    } catch (e) { showToast('❌ ' + e.message) }
  }

  return (
    <>
      <button onClick={() => { setEditing(null); setForm({ nom: '', description: '', prix: '', emoji: '🍽️', categorieId: categorias?.[0]?._id ?? '', variacoes: [] }); setShowModal(true) }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--ocean)', color: 'white', border: 'none', borderRadius: 16, padding: 14, width: '100%', fontFamily: "'Baloo 2',cursive", fontSize: 17, fontWeight: 700, cursor: 'pointer', marginBottom: 20 }}>
        + Adicionar Item
      </button>

      <p className="section-title">Itens Cadastrados</p>
      {items?.map(item => (
        <div key={item._id} style={{ background: 'white', borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: 48, height: 48, background: 'var(--surface)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{item.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{item.nom}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8, marginTop: 2 }}>
              <span>{fmt(item.prix)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ position: 'relative', width: 44, height: 24, flexShrink: 0 }}>
              <input type="checkbox" checked={item.disponible} onChange={e => toggleDisp({ itemId: item._id, disponible: e.target.checked }).then(() => showToast(e.target.checked ? '✅ Disponível' : '❌ Esgotado'))}
                style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', inset: 0, background: item.disponible ? '#06D6A0' : '#CBD5E0', borderRadius: 24, cursor: 'pointer', transition: '0.3s' }}>
                <span style={{ position: 'absolute', width: 18, height: 18, background: 'white', borderRadius: '50%', top: 3, left: item.disponible ? 23 : 3, transition: '0.3s' }} />
              </span>
            </label>
            <button onClick={() => { setEditing(item); setForm({ nom: item.nom, description: item.description, prix: String(item.prix), emoji: item.emoji, categorieId: item.categorieId, sku: item.sku ?? '', variacoes: item.variacoes ?? [] }); setShowModal(true) }}
              style={{ background: 'var(--surface)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✏️</button>
            <button onClick={() => excluirItem({ itemId: item._id }).then(() => showToast('🗑️ Item removido'))}
              style={{ background: 'var(--surface)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>🗑️</button>
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">{editing ? 'Editar Item' : 'Novo Item'}</div>
            <div className="form-group">
              <label className="form-label">Emoji</label>
              <EmojiPicker value={form.emoji} onChange={v => setForm(f => ({ ...f, emoji: v }))} />
            </div>
            <div className="form-group"><label className="form-label">Nome</label><input className="form-input" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Ex: Camarão Grelhado" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label className="form-label">Preço (R$)</label><input className="form-input" type="number" value={form.prix} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))} placeholder="45.00" step="0.50" /></div>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select className="form-input" value={form.categorieId} onChange={e => setForm(f => ({ ...f, categorieId: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {categorias?.map(c => <option key={c._id} value={c._id}>{c.emoji} {c.nom}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Descrição</label><textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ resize: 'none' }} placeholder="Descreva o prato..." /></div>
            <div className="form-group"><label className="form-label">Referência / SKU (opcional)</label><input className="form-input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="Ex: CAM-001, FRITE-M" style={{ fontFamily: 'monospace', fontSize: 13 }} /></div>

            {/* Variações */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>Variações (opcional)</label>
                <button onClick={() => setForm(f => ({ ...f, variacoes: [...f.variacoes, { nom: '', prix: 0 }] }))} style={{ background: 'var(--ocean)', color: 'white', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  + Adicionar
                </button>
              </div>
              {form.variacoes.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ex: Porção inteira / Meia porção com preços diferentes</p>
              )}
              {form.variacoes.map((v, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input
                    className="form-input"
                    value={v.nom}
                    onChange={e => setForm(f => ({ ...f, variacoes: f.variacoes.map((vv, ii) => ii === i ? { ...vv, nom: e.target.value } : vv) }))}
                    placeholder="Ex: Porção inteira"
                    style={{ flex: 2, margin: 0 }}
                  />
                  <input
                    className="form-input"
                    type="number"
                    value={v.prix || ''}
                    onChange={e => setForm(f => ({ ...f, variacoes: f.variacoes.map((vv, ii) => ii === i ? { ...vv, prix: parseFloat(e.target.value) || 0 } : vv) }))}
                    placeholder="R$"
                    step="0.50"
                    style={{ flex: 1, margin: 0 }}
                  />
                  <button onClick={() => setForm(f => ({ ...f, variacoes: f.variacoes.filter((_, ii) => ii !== i) }))} style={{ background: '#FEE2E2', border: 'none', borderRadius: 8, width: 32, height: 36, cursor: 'pointer', fontSize: 16, color: '#DC2626', flexShrink: 0 }}>🗑️</button>
                </div>
              ))}
              {form.variacoes.length > 0 && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  💡 Com variações, le prix de base sert de référence — le client choisira obligatoirement une variação.
                </p>
              )}
            </div>

            <button className="btn-primary" onClick={saveItem}>✅ Salvar</button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Categorias ─────────────────────────────────────────
function CategoriasTab({ categorias, kiosque, showToast }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nom: '', emoji: '🍽️', slug: '' })
  const [editingId, setEditingId] = useState(null)
  const criarCat = useMutation(api.cardapio.criarCategoria)
  const editarCat = useMutation(api.cardapio.editarCategoria)
  const excluirCat = useMutation(api.cardapio.excluirCategoria)

  function autoSlug(nom) {
    return nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  async function save() {
    if (!form.nom) { showToast('⚠️ Informe o nome'); return }
    try {
      if (editingId) {
        await editarCat({ categorieId: editingId, nom: form.nom, emoji: form.emoji })
        showToast('✅ Categoria atualizada!')
      } else {
        await criarCat({ nom: form.nom, emoji: form.emoji, slug: form.slug || autoSlug(form.nom) })
        showToast('✅ Categoria criada!')
      }
      setShowModal(false); setEditingId(null); setForm({ nom: '', emoji: '🍽️', slug: '' })
    } catch (e) { showToast('❌ ' + e.message) }
  }

  return (
    <>
      <button onClick={() => { setEditingId(null); setForm({ nom: '', emoji: '🍽️', slug: '' }); setShowModal(true) }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--ocean)', color: 'white', border: 'none', borderRadius: 16, padding: 14, width: '100%', fontFamily: "'Baloo 2',cursive", fontSize: 17, fontWeight: 700, cursor: 'pointer', marginBottom: 20 }}>
        + Nova Categoria
      </button>

      {categorias?.map((cat, i) => (
        <div key={cat._id} style={{ background: 'white', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', cursor: 'grab' }}>⠿</div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{cat.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{cat.nom}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>ordem: {cat.ordre}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { setEditingId(cat._id); setForm({ nom: cat.nom, emoji: cat.emoji, slug: cat.slug }); setShowModal(true) }}
              style={{ background: 'var(--surface)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✏️</button>
            <button onClick={() => excluirCat({ categorieId: cat._id }).then(() => showToast('🗑️ Removida')).catch(e => showToast('❌ ' + e.message))}
              style={{ background: 'var(--surface)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>🗑️</button>
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</div>
            <div className="form-group">
              <label className="form-label">Emoji</label>
              <EmojiPicker value={form.emoji} onChange={v => setForm(f => ({ ...f, emoji: v }))} />
            </div>
            <div className="form-group"><label className="form-label">Nome</label><input className="form-input" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value, slug: autoSlug(e.target.value) }))} placeholder="Ex: Pratos Quentes" /></div>
            {!editingId && <div className="form-group"><label className="form-label">Slug (auto)</label><input className="form-input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} style={{ fontFamily: 'monospace', fontSize: 13 }} /></div>}
            <button className="btn-primary" onClick={save}>✅ Salvar</button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Equipe ─────────────────────────────────────────
function EquipeTab({ funcionarios, kiosque, showToast }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nom: '', role: 'garcom', pin: '' })
  const criarFunc = useMutation(api.pinAuth.criarFuncionario)
  const desativar = useMutation(api.pinAuth.desativarFuncionario)

  const ROLES = { gestor: '📊 Gestor', cozinha: '👨‍🍳 Cozinha', garcom: '🛵 Garçom', caixa: '💰 Caixa' }
  const ROLE_COLORS = { gestor: '#EDE9FE', cozinha: '#FEF3C7', garcom: '#D1FAE5', caixa: '#DBEAFE' }
  const ROLE_TEXT = { gestor: '#7C3AED', cozinha: '#D97706', garcom: '#059669', caixa: '#1D4ED8' }

  async function save() {
    if (!form.nom || !form.pin || form.pin.length !== 4) { showToast('⚠️ Preencha nome e PIN com 4 dígitos'); return }
    try {
      await criarFunc({ nom: form.nom, role: form.role, pin: form.pin })
      showToast('✅ Funcionário adicionado!')
      setShowModal(false); setForm({ nom: '', role: 'garcom', pin: '' })
    } catch (e) { showToast('❌ ' + e.message) }
  }

  return (
    <>
      <button onClick={() => setShowModal(true)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--ocean)', color: 'white', border: 'none', borderRadius: 16, padding: 14, width: '100%', fontFamily: "'Baloo 2',cursive", fontSize: 17, fontWeight: 700, cursor: 'pointer', marginBottom: 20 }}>
        + Adicionar Funcionário
      </button>

      {funcionarios?.map(f => (
        <div key={f._id} style={{ background: 'white', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {ROLES[f.role]?.split(' ')[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{f.nom}</div>
          </div>
          <span style={{ background: ROLE_COLORS[f.role], color: ROLE_TEXT[f.role], padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {f.role}
          </span>
          <button onClick={() => desativar({ usuarioId: f._id }).then(() => showToast('✅ Funcionário desativado'))}
            style={{ background: 'var(--surface)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>🗑️</button>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Novo Funcionário</div>
            <div className="form-group"><label className="form-label">Nome</label><input className="form-input" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Nome completo" /></div>
            <div className="form-group">
              <label className="form-label">Função</label>
              <select className="form-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="garcom">🛵 Garçom</option>
                <option value="cozinha">👨‍🍳 Cozinha</option>
                <option value="caixa">💰 Caixa</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">PIN (4 dígitos)</label>
              <input className="form-input" value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g,'').substring(0,4) }))} placeholder="1234" type="password" inputMode="numeric" style={{ letterSpacing: '0.3em', fontSize: 20 }} />
            </div>
            <button className="btn-primary" onClick={save}>✅ Adicionar</button>
          </div>
        </div>
      )}
    </>
  )
}

// ── QR Codes ──────────────────────────────────────────
function QRCodesTab({ kiosque, slug }) {
  const parasols = useQuery(api.kiosques.listarParasols)
  const adicionar = useMutation(api.kiosques.adicionarParasol)
  const remover = useMutation(api.kiosques.removerParasol)
  const toggle = useMutation(api.kiosques.toggleParasol)
  const liberar = useMutation(api.kiosques.liberarParasol)
  const { showToast } = useToast()
  const [novoNumero, setNovoNumero] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [selectedQR, setSelectedQR] = useState(null)

  const baseUrl = 'https://pay.quiosquepraia.com'

  function qrUrl(numero) {
    const url = `${baseUrl}/${slug}/${numero.toLowerCase()}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&data=${encodeURIComponent(url)}`
  }

  async function handleAdd() {
    if (!novoNumero.trim()) { showToast('⚠️ Informe o número'); return }
    try {
      await adicionar({ numero: novoNumero.trim().toUpperCase() })
      showToast('✅ Guarda-sol adicionado!')
      setNovoNumero(''); setShowAdd(false)
    } catch (e) { showToast('❌ ' + e.message) }
  }

  async function handleDownload(numero) {
    const url = qrUrl(numero)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width; canvas.height = img.height + 60
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      ctx.fillStyle = '#0D3B66'
      ctx.font = 'bold 22px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`🏖️ ${numero}`, canvas.width / 2, img.height + 38)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `qr-${slug}-${numero}.png`
      a.click()
    }
    img.src = url
  }

  const ativos = parasols?.filter(p => p.actif) ?? []
  const inativos = parasols?.filter(p => !p.actif) ?? []

  return (
    <>
      {/* QR Vitrine — cardápio sem pedidos */}
      <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-card)', marginBottom: 16 }}>
        <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: 'var(--ocean)', marginBottom: 4 }}>
          👁️ QR Cardápio — Só Consulta
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Clientes veem o cardápio mas não podem fazer pedidos. Ideal para afixar na entrada ou nas redes sociais.
        </p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=10&data=${encodeURIComponent(`${baseUrl}/menu/${slug}`)}`}
            alt="QR Vitrine"
            style={{ width: 90, height: 90, borderRadius: 10, border: '1px solid var(--border)', flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: 'var(--text-secondary)', border: '1px solid var(--border)', wordBreak: 'break-all', marginBottom: 10 }}>
              pay.quiosquepraia.com/menu/<strong style={{ color: 'var(--ocean)' }}>{slug}</strong>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => {
                const url = `${baseUrl}/menu/${slug}`
                const img = new Image(); img.crossOrigin = 'anonymous'
                img.onload = () => {
                  const canvas = document.createElement('canvas')
                  canvas.width = img.width; canvas.height = img.height + 50
                  const ctx = canvas.getContext('2d')
                  ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height)
                  ctx.drawImage(img, 0, 0)
                  ctx.fillStyle = '#0D3B66'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center'
                  ctx.fillText('Cardápio', canvas.width / 2, img.height + 32)
                  const a = document.createElement('a'); a.href = canvas.toDataURL('image/png')
                  a.download = `qr-cardapio-${slug}.png`; a.click()
                }
                img.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&data=${encodeURIComponent(url)}`
              }} style={{ flex: 1, background: 'var(--ocean)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                ⬇ Baixar QR
              </button>
              <button onClick={() => window.open(`${baseUrl}/menu/${slug}`, '_blank')} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--ocean)', fontFamily: 'Inter,sans-serif' }}>
                👁️ Ver Menu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* URL do quiosque */}
      <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-card)', marginBottom: 16 }}>
        <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: 'var(--ocean)', marginBottom: 8 }}>
          🔗 URL dos Guarda-Sóis
        </p>
        <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 12, wordBreak: 'break-all', fontSize: 13, color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          pay.quiosquepraia.com/<strong style={{ color: 'var(--ocean)' }}>{slug}</strong>/<strong style={{ color: 'var(--lime)' }}>GS-01</strong>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Cada guarda-sol tem sua própria URL e QR Code único ✅</p>
      </div>

      {/* Lista parasols */}
      <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-card)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: 'var(--ocean)' }}>
            🏖️ Guarda-Sóis ({ativos.length} ativos)
          </p>
          <button onClick={() => setShowAdd(!showAdd)} style={{ background: 'var(--ocean)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            + Adicionar
          </button>
        </div>

        {/* Form adicionar */}
        {showAdd && (
          <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', gap: 10 }}>
            <input
              className="form-input"
              value={novoNumero}
              onChange={e => setNovoNumero(e.target.value.toUpperCase())}
              placeholder="Ex: GS-13"
              style={{ flex: 1, margin: 0 }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd} style={{ background: '#06D6A0', color: 'white', border: 'none', borderRadius: 10, padding: '0 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              ✅ Salvar
            </button>
            <button onClick={() => setShowAdd(false)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px', fontSize: 13, cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'Inter,sans-serif' }}>
              ✕
            </button>
          </div>
        )}

        {!parasols && <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 20 }}>Carregando...</div>}

        {ativos.map(p => (
          <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
            {/* Mini QR preview */}
            <img
              src={qrUrl(p.numero)}
              alt={`QR ${p.numero}`}
              style={{ width: 52, height: 52, borderRadius: 8, border: '1px solid var(--border)' }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, color: 'var(--ocean)', fontSize: 15 }}>🏖️ {p.numero}</span>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                pay.quiosquepraia.com/{slug}/{p.numero.toLowerCase()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setSelectedQR(p)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--ocean)', fontFamily: 'Inter,sans-serif', fontWeight: 600 }}>
                🔍 Ver
              </button>
              <button onClick={() => handleDownload(p.numero)} style={{ background: 'var(--ocean)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                ⬇ QR
              </button>
              <button onClick={() => {
                if (window.confirm(`Liberar ${p.numero}? O histórico de pedidos não será mais visível para novos clientes.`)) {
                  liberar({ parasolId: p._id }).then(() => showToast(`✅ ${p.numero} liberado para novo cliente!`))
                }
              }} style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#92400E', fontFamily: 'Inter,sans-serif' }}>
                🔄
              </button>
              <button onClick={() => toggle({ parasolId: p._id, actif: false }).then(() => showToast('⚠️ Desativado'))} style={{ background: 'var(--surface)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>
                🚫
              </button>
            </div>
          </div>
        ))}

        {inativos.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Inativos ({inativos.length})</p>
            {inativos.map(p => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', opacity: 0.5 }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>🏖️ {p.numero}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggle({ parasolId: p._id, actif: true }).then(() => showToast('✅ Reativado'))} style={{ background: '#D1FAE5', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: '#065F46', fontFamily: 'Inter,sans-serif' }}>
                    ✅ Reativar
                  </button>
                  <button onClick={() => remover({ parasolId: p._id }).then(() => showToast('🗑️ Removido'))} style={{ background: 'var(--surface)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal QR grande */}
      {selectedQR && (
        <div className="modal-overlay open" onClick={() => setSelectedQR(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div className="modal-handle" />
            <div className="modal-title">🏖️ {selectedQR.numero}</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              pay.quiosquepraia.com/{slug}/{selectedQR.numero.toLowerCase()}
            </p>
            <img
              src={qrUrl(selectedQR.numero)}
              alt={`QR ${selectedQR.numero}`}
              style={{ width: 240, height: 240, borderRadius: 16, border: '2px solid var(--border)', marginBottom: 20 }}
            />
            <button className="btn-primary" onClick={() => handleDownload(selectedQR.numero)} style={{ marginBottom: 10 }}>
              ⬇ Baixar QR Code PNG
            </button>
            <button onClick={() => setSelectedQR(null)} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', padding: 8, fontFamily: 'Inter,sans-serif' }}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function Loading() {
  return <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Carregando...</div>
}
