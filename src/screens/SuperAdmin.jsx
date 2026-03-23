import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { useUser, SignOutButton, SignInButton } from '@clerk/clerk-react'
import { api } from '../../convex/_generated/api'
import { useToast } from '../context/ToastContext'

export default function SuperAdmin() {
  const navigate = useNavigate()
  const { user, isLoaded } = useUser()
  const { showToast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ slug: '', nom: '', ville: '', etat: '', emailGestor: '', nomGestor: '' })

  const kiosques = useQuery(api.kiosques.listarTodos, user ? undefined : 'skip')
  const criar = useMutation(api.kiosques.criar)
  const suspender = useMutation(api.kiosques.suspender)
  const reativar = useMutation(api.kiosques.reativar)

  if (!isLoaded) return <Loading />

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#0D2137', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 32, fontWeight: 800, color: '#F5E6C8', textAlign: 'center' }}>
        Praia<span style={{ color: '#00B4D8' }}>App</span>
        <div style={{ fontSize: 14, background: '#FF6B6B', color: 'white', padding: '4px 14px', borderRadius: 8, marginTop: 8, fontFamily: 'Inter,sans-serif', fontWeight: 700, display: 'inline-block' }}>SUPER ADMIN</div>
      </div>
      <SignInButton mode="modal">
        <button style={{ background: '#00B4D8', color: '#0D2137', border: 'none', borderRadius: 14, padding: '16px 36px', fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: "'Baloo 2',cursive", boxShadow: '0 4px 20px rgba(0,180,216,0.4)' }}>
          🔐 Entrar
        </button>
      </SignInButton>
    </div>
  )

  function autoSlug() {
    const s = `${form.nom}-${form.ville}-${form.etat}`
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setForm(f => ({ ...f, slug: s }))
  }

  async function criarKiosque() {
    if (!form.slug || !form.nom || !form.ville || !form.etat || !form.emailGestor) {
      showToast('⚠️ Preencha todos os campos'); return
    }
    try {
      await criar({ slug: form.slug, nom: form.nom, ville: form.ville, etat: form.etat, emailGestor: form.emailGestor, nomGestor: form.nomGestor })
      showToast('✅ Quiosque criado com sucesso!')
      setShowModal(false)
      setForm({ slug: '', nom: '', ville: '', etat: '', emailGestor: '', nomGestor: '' })
    } catch (e) { showToast('❌ ' + e.message) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D2137', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#061524', padding: '20px 20px 24px', borderBottom: '1px solid rgba(0,180,216,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 26, fontWeight: 800, color: '#F5E6C8' }}>
              Praia<span style={{ color: '#00B4D8' }}>App</span>
              <span style={{ fontSize: 14, background: '#FF6B6B', color: 'white', padding: '2px 10px', borderRadius: 8, marginLeft: 10, fontFamily: 'Inter,sans-serif', fontWeight: 700 }}>SUPER ADMIN</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              {user?.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>
          <SignOutButton>
            <button style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              Sair
            </button>
          </SignOutButton>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: '16px 16px 0' }}>
        {[
          { label: 'Total Quiosques', val: kiosques?.length ?? 0, color: '#00B4D8' },
          { label: 'Ativos', val: kiosques?.filter(k => k.actif).length ?? 0, color: '#06D6A0' },
          { label: 'Inativos', val: kiosques?.filter(k => !k.actif).length ?? 0, color: '#FF6B6B' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 80px' }}>
        <button onClick={() => setShowModal(true)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: '#06D6A0', color: '#0D2137', border: 'none', borderRadius: 16,
          padding: 14, width: '100%', fontFamily: "'Baloo 2',cursive", fontSize: 17,
          fontWeight: 700, cursor: 'pointer', marginBottom: 24,
          boxShadow: '0 4px 20px rgba(6,214,160,0.3)'
        }}>
          + Criar Novo Quiosque
        </button>

        <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#F5E6C8', marginBottom: 14 }}>
          Todos os Quiosques
        </p>

        {!kiosques && (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Carregando...</div>
        )}

        {kiosques?.map(k => (
          <div key={k._id} style={{
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${k.actif ? 'rgba(0,180,216,0.2)' : 'rgba(255,107,107,0.2)'}`,
            borderRadius: 16, padding: 16, marginBottom: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 800, color: '#F5E6C8' }}>{k.nom}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{k.ville} · {k.etat}</div>
                <div style={{ fontSize: 11, color: '#48CAE4', marginTop: 4, fontFamily: 'monospace' }}>/{k.slug}</div>
              </div>
              <span style={{
                background: k.actif ? 'rgba(6,214,160,0.15)' : 'rgba(255,107,107,0.15)',
                color: k.actif ? '#06D6A0' : '#FF6B6B',
                border: `1px solid ${k.actif ? 'rgba(6,214,160,0.3)' : 'rgba(255,107,107,0.3)'}`,
                padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700
              }}>
                {k.actif ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate(`/admin/${k.slug}`)} style={{
                flex: 1, background: 'rgba(0,180,216,0.15)', border: '1px solid rgba(0,180,216,0.3)',
                borderRadius: 10, padding: '8px', color: '#48CAE4', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif'
              }}>
                📊 Ver Admin
              </button>
              <button onClick={() => navigate(`/login/${k.slug}`)} style={{
                flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '8px', color: 'rgba(255,255,255,0.6)', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif'
              }}>
                🔑 Login Equipe
              </button>
              {k.actif ? (
                <button onClick={() => suspender({ kiosqueId: k._id }).then(() => showToast('⚠️ Quiosque suspenso'))} style={{
                  background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)',
                  borderRadius: 10, padding: '8px 12px', color: '#FF6B6B', fontSize: 13,
                  cursor: 'pointer', fontFamily: 'Inter,sans-serif'
                }}>🚫</button>
              ) : (
                <button onClick={() => reativar({ kiosqueId: k._id }).then(() => showToast('✅ Quiosque reativado'))} style={{
                  background: 'rgba(6,214,160,0.15)', border: '1px solid rgba(6,214,160,0.3)',
                  borderRadius: 10, padding: '8px 12px', color: '#06D6A0', fontSize: 13,
                  cursor: 'pointer', fontFamily: 'Inter,sans-serif'
                }}>✅</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal criar quiosque */}
      {showModal && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Novo Quiosque</div>

            <div className="form-group">
              <label className="form-label">Nome do Quiosque</label>
              <input className="form-input" value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                onBlur={autoSlug}
                placeholder="Ex: Brisa do Mar" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Cidade</label>
                <input className="form-input" value={form.ville}
                  onChange={e => setForm(f => ({ ...f, ville: e.target.value }))}
                  onBlur={autoSlug}
                  placeholder="Guarujá" />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <input className="form-input" value={form.etat}
                  onChange={e => setForm(f => ({ ...f, etat: e.target.value.toUpperCase().substring(0, 2) }))}
                  placeholder="SP" maxLength={2} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Slug (URL) — auto-gerado</label>
              <input className="form-input" value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="brisa-do-mar-guaruja-sp"
                style={{ fontFamily: 'monospace', fontSize: 13 }} />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                URL: pay.quiosquepraia.com/{form.slug || '...'}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 16, marginBottom: 16 }}>
              <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: 'var(--ocean)', marginBottom: 12 }}>
                Dados do Gestor
              </p>
              <div className="form-group">
                <label className="form-label">Nome do Gestor</label>
                <input className="form-input" value={form.nomGestor}
                  onChange={e => setForm(f => ({ ...f, nomGestor: e.target.value }))}
                  placeholder="João Silva" />
              </div>
              <div className="form-group">
                <label className="form-label">Email do Gestor</label>
                <input className="form-input" type="email" value={form.emailGestor}
                  onChange={e => setForm(f => ({ ...f, emailGestor: e.target.value }))}
                  placeholder="gestor@quiosque.com.br" />
              </div>
            </div>

            <button className="btn-primary" onClick={criarKiosque}>
              🏖️ Criar Quiosque
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D2137', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#48CAE4', fontFamily: "'Baloo 2',cursive", fontSize: 18 }}>Carregando...</div>
    </div>
  )
}
