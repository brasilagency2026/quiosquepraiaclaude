import { useState, useRef, useEffect } from 'react'

const LIBRARY = [
  { tab: '🍺', label: 'Bebidas', emojis: ['🍺','🍻','🥂','🍷','🍸','🍹','🧉','🥃','🧃','🥤','☕','🧋','🍵','🧊','💧','🫗'] },
  { tab: '🦐', label: 'Frutos do Mar', emojis: ['🦐','🦀','🦞','🦑','🐙','🐟','🐠','🐡','🍣','🍤','🦈','🐚','🫐','🎣','🌊','⚓'] },
  { tab: '🍗', label: 'Carnes', emojis: ['🍗','🍖','🥩','🥓','🌭','🍔','🌮','🌯','🥪','🍱','🍛','🥘','🍲','🫕','🥗','🍜'] },
  { tab: '🍟', label: 'Petiscos', emojis: ['🍟','🍕','🧀','🥨','🥐','🥖','🫓','🥞','🧇','🥚','🍳','🌽','🫘','🥜','🫛','🧆'] },
  { tab: '🍰', label: 'Sobremesas', emojis: ['🍰','🎂','🧁','🍮','🍭','🍬','🍫','🍩','🍪','🍦','🍨','🍧','🍡','🥧','🍯','🫙'] },
  { tab: '🥭', label: 'Frutas', emojis: ['🥭','🍍','🍌','🍉','🍓','🫐','🍑','🍒','🍋','🍊','🍇','🥥','🍈','🍏','🍎','🍐'] },
  { tab: '🏖️', label: 'Praia', emojis: ['🏖️','🌊','☀️','🌴','🐚','⛱️','🏄','🤿','🐬','🐠','🦀','🐙','🌅','🏝️','🐋','⚓'] },
  { tab: '⭐', label: 'Outros', emojis: ['⭐','✨','🔥','💯','🎉','🆕','🏆','❤️','💚','🌟','🍽️','🥄','🍴','🧂','🫕','🥡'] },
]

const NAMES = {
  '🍺':'cerveja','🍻':'cervejas brinde','🥂':'champagne','🍷':'vinho','🍸':'coquetel','🍹':'drink tropical','🧉':'chimarrão','🥃':'whisky','🧃':'suco caixinha','🥤':'refrigerante','☕':'café','🧋':'bubble tea',
  '🦐':'camarão','🦀':'caranguejo siri','🦞':'lagosta','🦑':'lula','🐙':'polvo','🐟':'peixe','🐠':'peixe tropical','🍣':'sushi','🍤':'tempurá camarão',
  '🍗':'frango','🍖':'costela carne','🥩':'carne','🥓':'bacon','🌭':'hot dog','🍔':'hamburguer','🌮':'taco','🌯':'wrap','🥪':'sanduíche','🍛':'curry','🥘':'frigideira','🍲':'panela','🍜':'macarrão',
  '🍟':'batata frita','🍕':'pizza','🧀':'queijo','🥚':'ovo','🍳':'ovos mexidos','🌽':'milho','🥜':'amendoim',
  '🍰':'bolo fatia','🎂':'bolo aniversário','🧁':'cupcake','🍮':'pudim','🍫':'chocolate','🍩':'rosquinha','🍪':'biscoito','🍦':'sorvete','🍨':'sorvete tigela','🍧':'raspadinha','🍯':'mel',
  '🥭':'manga','🍍':'abacaxi','🍌':'banana','🍉':'melancia','🍓':'morango','🫐':'açaí mirtilo','🥥':'coco','🍊':'laranja','🍋':'limão','🍇':'uva',
  '🏖️':'praia','🌊':'onda mar','☀️':'sol','🌴':'palmeira','⛱️':'guarda sol','🏄':'surf','🤿':'mergulho',
  '⭐':'especial','🔥':'popular','💯':'destaque','🆕':'novo','🏆':'campeão','🍽️':'prato','🥄':'colher','🍴':'talheres','🧂':'sal',
}

export default function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [search, setSearch] = useState('')
  const panelRef = useRef(null)

  useEffect(() => {
    function handle(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filtered = search
    ? LIBRARY.flatMap(g => g.emojis).filter(e => (NAMES[e] || '').includes(search.toLowerCase()) || e === search)
    : LIBRARY[activeTab].emojis

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button type="button" onClick={() => setOpen(v => !v)} style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        border: `1.5px solid ${open ? 'var(--wave)' : '#E2E8F0'}`,
        borderRadius: 10, padding: '9px 14px', background: 'white',
        cursor: 'pointer', transition: 'border-color 0.2s', fontFamily: 'Inter,sans-serif'
      }}>
        <span style={{ fontSize: 26, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)', flex: 1, textAlign: 'left' }}>
          {value !== '🍽️' ? `${value} selecionado` : 'Escolher emoji'}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'white', border: '1.5px solid var(--border)',
          borderRadius: 16, boxShadow: 'var(--shadow-float)',
          zIndex: 600, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          maxHeight: 300
        }}>
          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Buscar emoji..."
              style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'Inter,sans-serif' }}
            />
          </div>

          {/* Tabs */}
          {!search && (
            <div style={{ display: 'flex', gap: 2, padding: '6px 8px 2px', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0, borderBottom: '1px solid #F1F5F9' }}>
              {LIBRARY.map((g, i) => (
                <button key={i} onClick={() => setActiveTab(i)} title={g.label} style={{
                  background: activeTab === i ? 'var(--ocean)' : 'none', border: 'none',
                  borderRadius: 8, padding: '5px 7px', fontSize: 18, cursor: 'pointer',
                  flexShrink: 0, lineHeight: 1, transition: 'background 0.15s'
                }}>{g.tab}</button>
              ))}
            </div>
          )}

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 2, padding: '8px 10px 12px', overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 20, fontSize: 13, color: 'var(--text-muted)' }}>Nenhum resultado</div>
            )}
            {filtered.map(e => (
              <button key={e} title={NAMES[e] || e} onClick={() => { onChange(e); setOpen(false); setSearch('') }} style={{
                background: 'none', border: 'none', borderRadius: 8, padding: '5px 3px',
                fontSize: 24, cursor: 'pointer', lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                aspectRatio: 1, transition: 'all 0.12s'
              }}
                onMouseEnter={e2 => e2.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e2 => e2.currentTarget.style.background = 'none'}
              >{e}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
