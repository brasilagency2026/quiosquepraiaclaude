import { useState } from 'react'

const MOTIVOS = [
  { id: 'falta', label: '📦 Produto em falta' },
  { id: 'equipamento', label: '🔧 Equipamento com problema' },
  { id: 'ingrediente', label: '⚠️ Ingrediente impróprio' },
  { id: 'volume', label: '📋 Volume excessivo' },
  { id: 'erro', label: '❌ Erro no pedido' },
  { id: 'outro', label: '💬 Outro motivo' },
]

const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

export default function CancelModal({ pedido, onConfirm, onClose }) {
  const [checked, setChecked] = useState([])
  const [motivo, setMotivo] = useState('')
  const [nota, setNota] = useState('')
  const [step, setStep] = useState(1) // 1 = selecionar, 2 = confirmado

  const items = pedido.items.filter(i => !i.annule)
  const cancelledItems = items.filter((_, i) => checked.includes(i))
  const keptItems = items.filter((_, i) => !checked.includes(i))
  const isTotal = cancelledItems.length === items.length
  const isPartial = cancelledItems.length > 0 && !isTotal
  const refundAmt = cancelledItems.reduce((s, i) => s + i.prixUnit * i.qty, 0)

  function toggle(i) {
    setChecked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  async function confirm() {
    if (checked.length === 0) return
    if (!motivo) return
    // Map checked indices back to original pedido.items indices
    const originalIndices = checked.map(ci => {
      let count = 0
      for (let j = 0; j < pedido.items.length; j++) {
        if (!pedido.items[j].annule) {
          if (count === ci) return j
          count++
        }
      }
      return -1
    }).filter(i => i >= 0)

    await onConfirm({
      pedidoId: pedido._id,
      indices: originalIndices,
      motivo: MOTIVOS.find(m => m.id === motivo)?.label || motivo,
      nota,
    })
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="modal-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 40, height: 40, background: '#FEE2E2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🚫</div>
          <div>
            <div className="modal-title" style={{ marginBottom: 0 }}>Cancelar Pedido #{pedido.numero}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Guarda-Sol {pedido.parasolNumero}</div>
          </div>
        </div>

        {/* Step 1 */}
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '16px 0 10px', lineHeight: 1.5 }}>
            Marque os itens que <strong>não podem ser preparados</strong>. Se todos marcados → cancelamento total.
          </p>

          {/* Items checklist */}
          <div style={{ marginBottom: 16 }}>
            {items.map((item, i) => (
              <div key={i} onClick={() => toggle(i)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 0', borderBottom: '1px solid #F1F5F9', cursor: 'pointer'
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `2px solid ${checked.includes(i) ? '#FF6B6B' : '#CBD5E0'}`,
                  background: checked.includes(i) ? '#FF6B6B' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', fontSize: 11, color: 'white', fontWeight: 700
                }}>
                  {checked.includes(i) && '✕'}
                </div>
                <div style={{ width: 26, height: 26, background: checked.includes(i) ? '#FEE2E2' : '#F1F5F9', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 13, flexShrink: 0, color: checked.includes(i) ? '#FF6B6B' : 'var(--text-secondary)' }}>
                  {item.qty}×
                </div>
                <div style={{ flex: 1, fontSize: 15, color: checked.includes(i) ? '#FF6B6B' : 'var(--text-primary)', textDecoration: checked.includes(i) ? 'line-through' : 'none', transition: 'all 0.15s' }}>
                  {item.emoji} {item.nom}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {fmt(item.prixUnit * item.qty)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {checked.length > 0 && (
            <div style={{
              background: isTotal ? '#FEF2F2' : '#FFF7ED',
              border: `1px solid ${isTotal ? '#FECACA' : '#FED7AA'}`,
              borderRadius: 12, padding: '14px 16px', marginBottom: 16
            }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: isTotal ? '#FF6B6B' : '#D97706', marginBottom: 6 }}>
                {isTotal ? '🚫 Cancelamento total' : '⚠️ Cancelamento parcial'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>
                {isTotal
                  ? 'O pedido completo será cancelado. Cliente e gerência serão notificados.'
                  : `${cancelledItems.map(i => `${i.qty}× ${i.nom}`).join(', ')} não poderá(ão) ser servido(s). O restante prossegue.`}
              </div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 800, color: isTotal ? '#FF6B6B' : '#D97706' }}>
                Reembolso: {fmt(refundAmt)}
              </div>
            </div>
          )}

          {/* Motivo */}
          <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: 'var(--ocean)', marginBottom: 10 }}>
            Motivo da anulação
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {MOTIVOS.map(m => (
              <button key={m.id} onClick={() => setMotivo(m.id)} style={{
                background: motivo === m.id ? '#EBF9FD' : 'var(--surface)',
                border: `1.5px solid ${motivo === m.id ? 'var(--wave)' : '#E2E8F0'}`,
                borderRadius: 10, padding: '10px 8px', fontSize: 12, fontWeight: 600,
                color: motivo === m.id ? 'var(--ocean)' : 'var(--text-secondary)',
                cursor: 'pointer', textAlign: 'center', lineHeight: 1.3,
                fontFamily: 'Inter,sans-serif', transition: 'all 0.15s'
              }}>{m.label}</button>
            ))}
          </div>

          {/* Nota */}
          <div className="form-group">
            <label className="form-label">Detalhar (opcional)</label>
            <textarea className="form-input" value={nota} onChange={e => setNota(e.target.value)}
              rows={2} style={{ resize: 'none', marginTop: 4 }}
              placeholder="Ex: Acabou o camarão fresco..." />
          </div>

          <button onClick={confirm}
            disabled={checked.length === 0 || !motivo}
            style={{
              width: '100%', background: checked.length > 0 && motivo ? '#FF6B6B' : '#CBD5E0',
              color: 'white', border: 'none', borderRadius: 50, padding: '15px 32px',
              fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700,
              cursor: checked.length > 0 && motivo ? 'pointer' : 'not-allowed',
              boxShadow: checked.length > 0 && motivo ? '0 4px 16px rgba(255,107,107,0.4)' : 'none',
              transition: 'all 0.2s'
            }}>
            Confirmar Anulação →
          </button>
        </div>
      </div>
    </div>
  )
}
