import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

export default function MenuVitrine() {
  const { slug } = useParams()
  const menuData = useQuery(api.kiosques.getMenuComplet, { slug })
  const [activecat, setActivecat] = useState('todos')

  if (!menuData) return <Loading />
  if (!menuData.kiosque) return <NotFound />

  const { kiosque, categories, items } = menuData

  const filteredCats = activecat === 'todos'
    ? categories
    : categories.filter(c => c.slug === activecat)

  return (
    <div style={{ background: '#F0F7FF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        background: '#0D2137', padding: '16px 20px 0',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 4px 20px rgba(13,33,55,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#F5E6C8', lineHeight: 1.1 }}>
              {kiosque.nom}
            </h2>
            <span style={{ fontSize: 12, color: '#48CAE4', opacity: 0.8 }}>
              🏖️ {kiosque.ville}, {kiosque.etat}
            </span>
          </div>
          {/* Badge vitrine */}
          <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '6px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 1 }}>CARDÁPIO</div>
            <div style={{ fontSize: 11, color: '#06D6A0', fontWeight: 700 }}>só consulta</div>
          </div>
        </div>

        {/* Banner scan */}
        <div style={{ background: 'rgba(0,180,216,0.15)', border: '1px solid rgba(0,180,216,0.3)', borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>📱</span>
          <span style={{ fontSize: 12, color: '#48CAE4', lineHeight: 1.4 }}>
            Para fazer pedidos, escaneie o QR Code do seu guarda-sol
          </span>
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px 40px' }}>
        {filteredCats.map(cat => {
          const catItems = items.filter(i => i.categorieId === cat._id)
          if (!catItems.length) return null
          return (
            <div key={cat._id}>
              <h3 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: '#0D2137', marginBottom: 16 }}>
                {cat.emoji} {cat.nom}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
                {catItems.map(item => (
                  <VitrineCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )
        })}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px 0 10px', borderTop: '1px solid #E2E8F0', marginTop: 10 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📱</div>
          <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: '#0D2137', marginBottom: 4 }}>
            Quer fazer um pedido?
          </p>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>
            Escaneie o QR Code no seu guarda-sol e peça direto da areia!
          </p>
        </div>
      </div>
    </div>
  )
}

function VitrineCard({ item }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(13,33,55,0.12)', position: 'relative'
    }}>
      <div style={{ fontSize: 52, textAlign: 'center', padding: '20px 0 10px', background: 'linear-gradient(135deg,#F5E6C8,#E8C98A)' }}>
        {item.emoji}
      </div>
      <div style={{ padding: '10px 10px 12px' }}>
        <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 14, fontWeight: 700, color: '#0D2137', marginBottom: 4, lineHeight: 1.2 }}>
          {item.nom}
        </div>
        <div style={{ fontSize: 11, color: '#4A6B8A', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.description}
        </div>
        <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 800, color: '#0D2137' }}>
          {fmt(item.prix)}
        </div>
      </div>
      {!item.disponible && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16 }}>
          <div style={{ background: '#FF6B6B', color: 'white', padding: '6px 16px', borderRadius: 20, fontFamily: "'Baloo 2',cursive", fontSize: 14, fontWeight: 700, transform: 'rotate(-5deg)' }}>Esgotado</div>
        </div>
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
    </div>
  )
}
