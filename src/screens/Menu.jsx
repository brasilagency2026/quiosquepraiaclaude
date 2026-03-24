import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useCart } from '../hooks/useCart'
import { useToast } from '../context/ToastContext'
import CartBar from '../components/CartBar'
import ItemModal from '../components/ItemModal'
import Carrinho from './Carrinho'
import Pagamento from './Pagamento'
import Confirmado from './Confirmado'

const STATUS_LABEL = { pago: 'Aguardando', cozinha: 'Em preparo 🍳', pronto: 'Pronto! 🎉', entregue: 'Entregue ✅', cancelado: 'Cancelado', parcial: 'Cancelado parcial' }
const STATUS_COLOR = { pago: '#00B4D8', cozinha: '#F59E0B', pronto: '#06D6A0', entregue: '#8AAABB', cancelado: '#FF6B6B', parcial: '#F59E0B' }
const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

export default function Menu() {
  const { slug, parasol } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const menuData = useQuery(api.kiosques.getMenuComplet, { slug })
  const { cart, addItem, changeQty, clearCart, total, count } = useCart()
  const [activecat, setActivecat] = useState('todos')
  const [modalItem, setModalItem] = useState(null)
  const [screen, setScreen] = useState('menu') // menu | cart | payment | confirmed | meus-pedidos
  const [pedidoId, setPedidoId] = useState(null)
  const [pedidoNumero, setPedidoNumero] = useState(null)
  const criarPedido = useMutation(api.pedidos.criar)

  const meusPedidos = useQuery(
    api.pedidos.getPedidosParasol,
    menuData?.kiosque ? { kiosqueId: menuData.kiosque._id, parasolNumero: parasol } : 'skip'
  )

  if (!menuData) return <Loading />
  if (!menuData.kiosque) return <NotFound />

  const { kiosque, categories, items } = menuData

  const filteredCats = activecat === 'todos'
    ? categories
    : categories.filter(c => c.slug === activecat)

  async function handleConfirmPayment(method) {
    try {
      const id = await criarPedido({
        kiosqueId: kiosque._id,
        parasolNumero: parasol,
        items: cart.map(i => ({
          itemId: i._id,
          nom: i.nom,
          emoji: i.emoji,
          qty: i.qty,
          prixUnit: i.prix,
        })),
        total,
        metodoPagamento: method,
        pagamentoId: 'MP-' + Date.now(),
      })
      const num = Math.floor(Math.random() * 90) + 10
      setPedidoId(id)
      setPedidoNumero(num)
      clearCart()
      setScreen('confirmed')
    } catch (e) {
      showToast('❌ Erro ao criar pedido: ' + e.message)
    }
  }

  if (screen === 'meus-pedidos') return (
    <MeusPedidos
      pedidos={meusPedidos}
      parasol={parasol}
      onBack={() => setScreen('menu')}
      onNovoPedido={() => setScreen('menu')}
    />
  )

  if (screen === 'cart') return (
    <Carrinho
      cart={cart} total={total}
      onBack={() => setScreen('menu')}
      onCheckout={() => setScreen('payment')}
      onChangeQty={changeQty}
    />
  )
  if (screen === 'payment') return (
    <Pagamento
      total={total} cart={cart}
      onBack={() => setScreen('cart')}
      onConfirm={handleConfirmPayment}
    />
  )
  if (screen === 'confirmed') return (
    <Confirmado
      pedidoId={pedidoId}
      numero={pedidoNumero}
      onNewOrder={() => { setScreen('menu') }}
    />
  )

  return (
    <div style={{ background: '#F0F7FF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: '#0D2137', padding: '16px 20px 0',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 4px 20px rgba(13,33,55,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#F5E6C8', lineHeight: 1.1 }}>
              {kiosque.nom}
            </h2>
            <span style={{ fontSize: 12, color: '#48CAE4', opacity: 0.8 }}>
              🏖️ Guarda-Sol {parasol} · {kiosque.ville}, {kiosque.etat}
            </span>
          </div>
          {count > 0 && (
            <button onClick={() => setScreen('cart')} style={{
              background: '#06D6A0', border: 'none', borderRadius: 14,
              padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6,
              cursor: 'pointer', fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#0D2137'
            }}>
              🛒 <span style={{ background: '#FF6B6B', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 12, fontWeight: 700 }}>{count}</span>
            </button>
          )}
          {count === 0 && meusPedidos && meusPedidos.length > 0 && (
            <button onClick={() => setScreen('meus-pedidos')} style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 14, padding: '8px 12px', cursor: 'pointer',
              fontFamily: "'Baloo 2',cursive", fontSize: 13, fontWeight: 700, color: 'white',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              📋 <span style={{ fontSize: 11 }}>Meus pedidos</span>
              {meusPedidos.filter(p => ['pago','cozinha','pronto'].includes(p.statut)).length > 0 && (
                <span style={{ background: '#06D6A0', color: '#0D2137', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                  {meusPedidos.filter(p => ['pago','cozinha','pronto'].includes(p.statut)).length}
                </span>
              )}
            </button>
          )}
        </div>
        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
          <CatPill label="Todos" active={activecat === 'todos'} onClick={() => setActivecat('todos')} />
          {categories.map(c => (
            <CatPill key={c._id} label={`${c.emoji} ${c.nom}`} active={activecat === c.slug} onClick={() => setActivecat(c.slug)} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px 120px' }}>
        {filteredCats.map(cat => {
          const catItems = items.filter(i => i.categorieId === cat._id)
          if (!catItems.length) return null
          return (
            <div key={cat._id}>
              <h3 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: '#0D2137', marginBottom: 16 }}>
                {cat.emoji} {cat.nom}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
                {catItems.map(item => {
                  const qty = cart.find(c => c._id === item._id)?.qty || 0
                  return (
                    <MenuCard key={item._id} item={item} qty={qty}
                      onClick={() => setModalItem(item)}
                      onQuickAdd={() => { addItem(item); showToast(`${item.emoji} adicionado!`) }}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Cart bar */}
      <CartBar count={count} total={total} onClick={() => setScreen('cart')} />

      {/* Item modal */}
      {modalItem && (
        <ItemModal item={modalItem} onClose={() => setModalItem(null)}
          onAdd={(qty, obs) => { addItem(modalItem, qty, obs); setModalItem(null); showToast(`${modalItem.emoji} adicionado!`) }}
        />
      )}
    </div>
  )
}

function CatPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, background: active ? '#00B4D8' : 'rgba(255,255,255,0.1)',
      border: `1px solid ${active ? '#00B4D8' : 'rgba(255,255,255,0.15)'}`,
      color: active ? 'white' : 'rgba(255,255,255,0.7)',
      padding: '8px 16px', borderRadius: 50, fontSize: 13, fontWeight: active ? 600 : 500,
      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
    }}>{label}</button>
  )
}

function MenuCard({ item, qty, onClick, onQuickAdd }) {
  return (
    <div onClick={onClick} style={{
      background: 'white', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(13,33,55,0.12)', cursor: 'pointer',
      transition: 'transform 0.2s', position: 'relative'
    }}>
      <div style={{ fontSize: 52, textAlign: 'center', padding: '20px 0 10px', background: 'linear-gradient(135deg,#F5E6C8,#E8C98A)' }}>
        {item.emoji}
      </div>
      <div style={{ padding: '10px 10px 12px' }}>
        <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 14, fontWeight: 700, color: '#0D2137', marginBottom: 4, lineHeight: 1.2 }}>{item.nom}</div>
        <div style={{ fontSize: 11, color: '#4A6B8A', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 800, color: '#0D2137' }}>
            R$ {item.prix.toFixed(2).replace('.', ',')}
          </div>
          {item.disponible ? (
            <button onClick={e => { e.stopPropagation(); onQuickAdd() }} style={{
              background: '#0D2137', color: 'white', border: 'none', borderRadius: 10,
              width: 32, height: 32, fontSize: 20, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}>+</button>
          ) : null}
        </div>
      </div>
      {qty > 0 && (
        <div style={{
          position: 'absolute', top: 8, right: 8, background: '#06D6A0',
          color: '#0D2137', borderRadius: 10, padding: '2px 8px', fontSize: 12, fontWeight: 700
        }}>{qty}</div>
      )}
      {!item.disponible && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16 }}>
          <div style={{ background: '#FF6B6B', color: 'white', padding: '6px 16px', borderRadius: 20, fontFamily: "'Baloo 2',cursive", fontSize: 14, fontWeight: 700, transform: 'rotate(-5deg)' }}>Esgotado</div>
        </div>
      )}
    </div>
  )
}

function MeusPedidos({ pedidos, parasol, onBack, onNovoPedido }) {
  const ativos = pedidos?.filter(p => ['pago', 'cozinha', 'pronto'].includes(p.statut)) ?? []
  const finalizados = pedidos?.filter(p => ['entregue', 'cancelado', 'parcial'].includes(p.statut)) ?? []

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#0D2137', padding: '20px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: 'white', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            ←
          </button>
          <div>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#F5E6C8' }}>
              📋 Meus Pedidos
            </h2>
            <p style={{ fontSize: 12, color: '#48CAE4' }}>🏖️ Guarda-Sol {parasol}</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 40px' }}>

        {/* Nenhum pedido */}
        {pedidos?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏖️</div>
            <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 700, color: '#0D2137', marginBottom: 8 }}>
              Nenhum pedido ainda
            </p>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
              Faça seu primeiro pedido e acompanhe aqui!
            </p>
            <button onClick={onNovoPedido} style={{ background: '#0D2137', color: 'white', border: 'none', borderRadius: 14, padding: '14px 28px', fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              Ver Cardápio
            </button>
          </div>
        )}

        {/* Pedidos ativos */}
        {ativos.length > 0 && (
          <>
            <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#0D2137', marginBottom: 12 }}>
              Em andamento
            </p>
            {ativos.map(p => <PedidoCard key={p._id} p={p} />)}
          </>
        )}

        {/* Pedidos finalizados */}
        {finalizados.length > 0 && (
          <>
            <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 14, fontWeight: 700, color: '#94A3B8', marginBottom: 10, marginTop: ativos.length > 0 ? 20 : 0 }}>
              Histórico de hoje
            </p>
            {finalizados.map(p => <PedidoCard key={p._id} p={p} />)}
          </>
        )}

        {/* Botão novo pedido */}
        {pedidos && pedidos.length > 0 && (
          <button onClick={onNovoPedido} style={{ width: '100%', background: '#0D2137', color: 'white', border: 'none', borderRadius: 14, padding: 14, fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 20 }}>
            + Fazer novo pedido
          </button>
        )}
      </div>
    </div>
  )
}

function PedidoCard({ p }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', marginBottom: 14, boxShadow: '0 4px 16px rgba(13,33,55,0.1)' }}>
      {/* Status bar */}
      <div style={{ background: STATUS_COLOR[p.statut], padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 800, color: p.statut === 'pronto' ? '#0D2137' : 'white' }}>
          Pedido #{p.numero}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: p.statut === 'pronto' ? '#0D2137' : 'white' }}>
          {STATUS_LABEL[p.statut]}
        </span>
      </div>

      {/* Animação pronto */}
      {p.statut === 'pronto' && (
        <div style={{ background: '#F0FDF4', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #BBF7D0' }}>
          <span style={{ fontSize: 20 }}>🎉</span>
          <span style={{ fontSize: 13, color: '#065F46', fontWeight: 600 }}>Seu pedido está pronto! O garçom já está a caminho.</span>
        </div>
      )}

      {p.statut === 'cozinha' && (
        <div style={{ background: '#FFFBEB', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #FDE68A' }}>
          <span style={{ fontSize: 20 }}>🍳</span>
          <span style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>Seu pedido está sendo preparado com carinho!</span>
        </div>
      )}

      {p.statut === 'pago' && (
        <div style={{ background: '#EFF9FF', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #BAE6FD' }}>
          <span style={{ fontSize: 20 }}>⏳</span>
          <span style={{ fontSize: 13, color: '#0369A1', fontWeight: 600 }}>Pagamento confirmado! Aguardando a cozinha.</span>
        </div>
      )}

      {/* Itens */}
      <div style={{ padding: '12px 16px' }}>
        {p.items.filter(i => !i.annule).map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14, color: '#374151' }}>
            <span>{item.qty}× {item.emoji} {item.nom}</span>
            <span style={{ fontWeight: 600, color: '#0D2137' }}>{fmt(item.qty * item.prixUnit)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: 14, color: '#64748B' }}>Total</span>
          <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 800, color: '#0D2137' }}>
            {fmt(p.total - p.totalRembourse)}
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
          {new Date(p.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {p.metodoPagamento || '—'}
        </div>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D2137', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#48CAE4', fontFamily: "'Baloo 2',cursive", fontSize: 20 }}>Carregando cardápio... 🌊</div>
    </div>
  )
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D2137', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 64 }}>🏖️</div>
      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 24, color: '#F5E6C8' }}>Quiosque não encontrado</div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Verifique o QR code ou o endereço</div>
    </div>
  )
}
