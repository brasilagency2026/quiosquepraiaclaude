import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignUp, useUser, useClerk } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

const ESTADOS = [
  { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' }, { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' }, { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' }, { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' }, { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' }, { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' }, { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' }, { uf: 'TO', nome: 'Tocantins' },
]

export default function Inscricao() {
  const navigate = useNavigate()
  const { signUp, setActive, isLoaded } = useSignUp()
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const solicitarInscricao = useMutation(api.inscricoes.solicitar)

  // Etapas: 'quiosque' | 'conta' | 'verificacao' | 'sucesso'
  const [etapa, setEtapa] = useState('quiosque')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [code, setCode] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)

  const [form, setForm] = useState({
    nomGestor: '', nomKiosque: '', ville: '', etat: '',
    email: '', senha: '', confirmarSenha: '',
  })
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErro('') }

  // Si déjà connecté avec un autre compte — proposer de se déconnecter
  if (isSignedIn && etapa === 'quiosque') {
    return (
      <div style={s.page}>
        <WaveBg />
        <div style={s.card}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>👤</div>
            <h3 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 700, color: '#F5E6C8', marginBottom: 8 }}>
              Você já está conectado
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter,sans-serif', marginBottom: 24, lineHeight: 1.6 }}>
              Email: <strong style={{ color: '#00B4D8' }}>{user?.primaryEmailAddress?.emailAddress}</strong><br />
              Para criar uma nova conta, saia primeiro.
            </p>
            <button onClick={() => signOut()} style={{ ...s.btnPrimary, marginBottom: 10 }}>
              🚪 Sair e criar nova conta
            </button>
            <button onClick={() => window.history.back()} style={s.btnLink}>
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Étape 1 → 2 ──────────────────────────────────
  function avancarParaConta() {
    const palavras = form.nomGestor.trim().split(/\s+/)
    if (palavras.length < 2 || palavras.some(p => p.length < 2)) { setErro('Informe seu nome e sobrenome (ex: João Silva)'); return }
    if (!form.nomKiosque.trim()) { setErro('Informe o nome do quiosque'); return }
    if (!form.ville.trim()) { setErro('Informe a cidade'); return }
    if (!form.etat) { setErro('Selecione o estado'); return }
    setErro(''); setEtapa('conta')
  }

  // ── Étape 2 : créer compte Clerk ─────────────────
  async function criarConta() {
    if (!form.email || !form.email.includes('@')) { setErro('Informe um email válido'); return }
    if (form.senha.length < 8) { setErro('A senha deve ter pelo menos 8 caracteres'); return }
    if (form.senha !== form.confirmarSenha) { setErro('As senhas não conferem'); return }
    if (!isLoaded) return

    setLoading(true); setErro('')
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.senha,
        firstName: form.nomGestor.split(' ')[0],
        lastName: form.nomGestor.split(' ').slice(1).join(' ') || ' ',
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setEtapa('verificacao')
    } catch (e) {
      const msg = e.errors?.[0]?.longMessage ?? e.errors?.[0]?.message ?? e.message ?? 'Erro ao criar conta'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Étape 3 : vérifier code email ────────────────
  async function verificarCodigo() {
    if (!code || code.length < 6) { setErro('Informe o código de 6 dígitos'); return }
    setLoading(true); setErro('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status !== 'complete') {
        setErro('Código inválido. Tente novamente.'); setLoading(false); return
      }
      await setActive({ session: result.createdSessionId })

      // Enregistrer dans Convex
      await solicitarInscricao({
        nomGestor: form.nomGestor,
        nomKiosque: form.nomKiosque,
        ville: form.ville,
        etat: form.etat,
        email: form.email,
        clerkUserId: result.createdUserId ?? undefined,
      })
      setEtapa('sucesso')
    } catch (e) {
      const msg = e.errors?.[0]?.longMessage ?? e.message ?? 'Código inválido'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  const STEP_NUM = { quiosque: 1, conta: 2, verificacao: 2, sucesso: 3 }

  return (
    <div style={s.page}>
      <WaveBg />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 24, zIndex: 1, position: 'relative' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: 26, fontWeight: 800, color: '#F5E6C8' }}>
            Quiosque <span style={{ color: '#00B4D8' }}>Praia</span>
          </span>
        </button>
      </div>

      <div style={s.card}>

        {/* ── SUCESSO ── */}
        {etapa === 'sucesso' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 24, fontWeight: 800, color: '#06D6A0', marginBottom: 12 }}>
              Inscrição enviada!
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 24, fontFamily: 'Inter,sans-serif' }}>
              Recebemos sua solicitação para o quiosque{' '}
              <strong style={{ color: '#00B4D8' }}>{form.nomKiosque}</strong>.<br />
              Em breve você receberá um email com o link do seu painel.
            </p>
            <div style={{ background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, textAlign: 'left' }}>
              {[['Gestor', form.nomGestor], ['Quiosque', form.nomKiosque], ['Cidade', `${form.ville} · ${form.etat}`], ['Email', form.email]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter,sans-serif' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/')} style={{ ...s.btnSecondary, width: '100%' }}>← Voltar ao início</button>
          </div>
        )}

        {/* ── VERIFICAÇÃO EMAIL ── */}
        {etapa === 'verificacao' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>📧</div>
              <h3 style={s.stepTitle}>Verifique seu email</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter,sans-serif', lineHeight: 1.6 }}>
                Enviamos um código para<br />
                <strong style={{ color: '#00B4D8' }}>{form.email}</strong>
              </p>
            </div>
            <label style={s.label}>Código de 6 dígitos</label>
            <input
              style={{ ...s.input, fontSize: 28, textAlign: 'center', letterSpacing: '0.3em', fontWeight: 700 }}
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setErro('') }}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              autoFocus
            />
            {erro && <div style={s.erro}>{erro}</div>}
            <button onClick={verificarCodigo} disabled={loading || code.length < 6}
              style={{ ...s.btnPrimary, opacity: code.length === 6 ? 1 : 0.5 }}>
              {loading ? '⏳ Verificando...' : '✅ Confirmar email'}
            </button>
            <button onClick={() => setEtapa('conta')} style={s.btnLink}>← Corrigir email</button>
          </>
        )}

        {/* ── DADOS DO QUIOSQUE ── */}
        {etapa === 'quiosque' && (
          <>
            <StepHeader current={1} total={2} titulo="Dados do seu quiosque" />
            <label style={s.label}>Seu nome completo *</label>
            <input style={s.input} value={form.nomGestor} onChange={e => set('nomGestor', e.target.value)} placeholder="Ex: João Silva (nome e sobrenome)" autoFocus />
            <label style={s.label}>Nome do quiosque *</label>
            <input style={s.input} value={form.nomKiosque} onChange={e => set('nomKiosque', e.target.value)} placeholder="Ex: Quiosque da Tereza" />
            <label style={s.label}>Cidade *</label>
            <input style={s.input} value={form.ville} onChange={e => set('ville', e.target.value)} placeholder="Ex: Guarujá" />
            <label style={s.label}>Estado *</label>
            <select style={s.select} value={form.etat} onChange={e => set('etat', e.target.value)}>
              <option value="">— Selecione o estado —</option>
              {ESTADOS.map(e => <option key={e.uf} value={e.uf}>{e.nome} ({e.uf})</option>)}
            </select>
            {erro && <div style={s.erro}>{erro}</div>}
            <button onClick={avancarParaConta} style={s.btnPrimary}>Próximo →</button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter,sans-serif' }}>Já tem conta? </span>
              <button onClick={() => navigate('/admin/login')} style={s.btnLink}>Fazer login</button>
            </div>
          </>
        )}

        {/* ── CRIAR CONTA ── */}
        {etapa === 'conta' && (
          <>
            <StepHeader current={2} total={2} titulo="Crie seu acesso" />
            <div style={{ background: 'rgba(0,180,216,0.08)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 10, padding: '8px 14px', marginBottom: 18, fontSize: 13, color: '#48CAE4', fontFamily: 'Inter,sans-serif' }}>
              🏖️ {form.nomKiosque} · {form.ville}/{form.etat}
            </div>
            <label style={s.label}>Email *</label>
            <input style={s.input} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" autoFocus />
            <label style={s.label}>Senha * (mínimo 8 caracteres)</label>
            <input style={s.input} type="password" value={form.senha} onChange={e => set('senha', e.target.value)} placeholder="Sua senha" />
            <label style={s.label}>Confirmar senha *</label>
            <input style={s.input} type="password" value={form.confirmarSenha} onChange={e => set('confirmarSenha', e.target.value)} placeholder="Repita a senha" />
            {erro && <div style={s.erro}>{erro}</div>}
            <button onClick={criarConta} disabled={loading} style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Criando conta...' : '🚀 Criar conta e verificar email'}
            </button>
            <button onClick={() => { setErro(''); setEtapa('quiosque') }} style={s.btnLink}>← Voltar</button>
          </>
        )}
      </div>
    </div>
  )
}

function StepHeader({ current, total, titulo }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < current ? '#06D6A0' : i === current - 1 ? '#00B4D8' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#F5E6C8', margin: 0 }}>{titulo}</h3>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter,sans-serif' }}>{current}/{total}</span>
      </div>
    </div>
  )
}

function WaveBg() {
  return (
    <svg style={{ position: 'fixed', bottom: 0, left: 0, right: 0, opacity: 0.07, pointerEvents: 'none', zIndex: 0 }} viewBox="0 0 1440 320" preserveAspectRatio="none" height="320">
      <path fill="#00B4D8" d="M0,160 C240,80 480,240 720,160 C960,80 1200,240 1440,160 L1440,320 L0,320Z" />
    </svg>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(160deg, #04111F 0%, #0D2137 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 24, padding: '28px 24px', width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 },
  stepTitle: { fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#F5E6C8', marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontFamily: 'Inter,sans-serif' },
  input: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(0,180,216,0.25)', borderRadius: 12, padding: '13px 16px', fontSize: 15, color: 'white', fontFamily: 'Inter,sans-serif', outline: 'none', marginBottom: 14, boxSizing: 'border-box' },
  select: { width: '100%', background: '#0D2137', border: '1.5px solid rgba(0,180,216,0.25)', borderRadius: 12, padding: '13px 16px', fontSize: 15, color: 'white', fontFamily: 'Inter,sans-serif', outline: 'none', marginBottom: 14, boxSizing: 'border-box', cursor: 'pointer' },
  btnPrimary: { width: '100%', background: '#06D6A0', color: '#0D2137', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: "'Baloo 2',cursive", marginTop: 4 },
  btnSecondary: { background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter,sans-serif' },
  btnLink: { display: 'block', background: 'none', border: 'none', color: '#00B4D8', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif', marginTop: 14, textAlign: 'center', width: '100%' },
  erro: { fontSize: 13, color: '#FF6B6B', background: 'rgba(255,107,107,0.1)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontFamily: 'Inter,sans-serif' },
}
