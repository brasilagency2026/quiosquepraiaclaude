import { useState } from 'react'

export default function ItemModal({ item, onClose, onAdd }) {
  const [qty, setQty] = useState(1)
  const [obs, setObs] = useState('')
  const fmt = v => 'R$ ' + v.toFixed(2).replace('.', ',')

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div style={{ fontSize: 72, textAlign: 'center', marginBottom: 16 }}>{item.emoji}</div>
        <div className="modal-title" style={{ textAlign: 'center' }}>{item.nom}</div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6, marginBottom: 20 }}>{item.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Valor</div>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 28, fontWeight: 800, color: 'var(--ocean)' }}>{fmt(item.prix)}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderRadius: 50, padding: 4 }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 32, height: 32, border: 'none', borderRadius: '50%', background: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ocean)', fontWeight: 500 }}>−</button>
            <span style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 16, color: 'var(--ocean)', minWidth: 20, textAlign: 'center' }}>{qty}</span>
            <button onClick={() => setQty(q => q + 1)} style={{ width: 32, height: 32, border: 'none', borderRadius: '50%', background: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ocean)', fontWeight: 500 }}>+</button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Observação (opcional)</label>
          <textarea className="form-input" value={obs} onChange={e => setObs(e.target.value)}
            rows={2} placeholder="Ex: Sem gelo, bem gelada..." style={{ resize: 'none', marginTop: 4 }} />
        </div>
        <button className="btn-primary" onClick={() => onAdd(qty, obs)}>
          🛒 Adicionar — {fmt(item.prix * qty)}
        </button>
      </div>
    </div>
  )
}
