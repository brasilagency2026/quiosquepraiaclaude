import { useState } from 'react'

export default function ItemModal({ item, onClose, onAdd }) {
  const [qty, setQty] = useState(1)
  const [obs, setObs] = useState('')
  const [variacaoIdx, setVariacaoIdx] = useState(null)
  const fmt = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',')

  const temVariacoes = item.variacoes && item.variacoes.length > 0
  const variacaoSelecionada = variacaoIdx !== null ? item.variacoes[variacaoIdx] : null
  const precoEfetivo = variacaoSelecionada ? variacaoSelecionada.prix : item.prix
  const podeAdicionar = !temVariacoes || variacaoIdx !== null

  function handleAdd() {
    if (!podeAdicionar) return
    onAdd(qty, obs, variacaoSelecionada ? { nom: variacaoSelecionada.nom, prix: variacaoSelecionada.prix } : null)
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-handle" />

        <div style={{ fontSize: 72, textAlign: 'center', marginBottom: 12 }}>{item.emoji}</div>
        <div className="modal-title" style={{ textAlign: 'center' }}>{item.nom}</div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6, marginBottom: 20 }}>
          {item.description}
        </p>

        {/* Variações */}
        {temVariacoes ? (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 10 }}>
              Escolha a variação *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {item.variacoes.map((v, i) => (
                <div key={i} onClick={() => setVariacaoIdx(i)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                  border: `2px solid ${variacaoIdx === i ? 'var(--ocean)' : 'var(--border)'}`,
                  background: variacaoIdx === i ? '#EBF9FD' : 'white',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${variacaoIdx === i ? 'var(--ocean)' : 'var(--border)'}`,
                      background: variacaoIdx === i ? 'var(--ocean)' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {variacaoIdx === i && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <span style={{ fontSize: 15, fontWeight: variacaoIdx === i ? 700 : 500, color: variacaoIdx === i ? 'var(--ocean)' : 'var(--text-primary)' }}>
                      {v.nom}
                    </span>
                  </div>
                  <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 800, color: variacaoIdx === i ? 'var(--ocean)' : 'var(--text-secondary)' }}>
                    {fmt(v.prix)}
                  </span>
                </div>
              ))}
            </div>
            {!podeAdicionar && (
              <p style={{ fontSize: 12, color: '#FF6B6B', marginTop: 6 }}>⚠️ Selecione uma variação para continuar</p>
            )}
          </div>
        ) : (
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
        )}

        {/* Quantité pour variações */}
        {temVariacoes && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>Quantidade</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderRadius: 50, padding: 4 }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 32, height: 32, border: 'none', borderRadius: '50%', background: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ocean)', fontWeight: 500 }}>−</button>
              <span style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 16, color: 'var(--ocean)', minWidth: 20, textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ width: 32, height: 32, border: 'none', borderRadius: '50%', background: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ocean)', fontWeight: 500 }}>+</button>
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Observação (opcional)</label>
          <textarea className="form-input" value={obs} onChange={e => setObs(e.target.value)}
            rows={2} placeholder="Ex: Sem gelo, bem gelada..." style={{ resize: 'none', marginTop: 4 }} />
        </div>

        <button className="btn-primary" onClick={handleAdd}
          disabled={!podeAdicionar}
          style={{ opacity: podeAdicionar ? 1 : 0.5, cursor: podeAdicionar ? 'pointer' : 'not-allowed' }}>
          🛒 Adicionar — {fmt(precoEfetivo * qty)}
          {variacaoSelecionada && <span style={{ fontSize: 13, opacity: 0.8 }}> · {variacaoSelecionada.nom}</span>}
        </button>
      </div>
    </div>
  )
}
