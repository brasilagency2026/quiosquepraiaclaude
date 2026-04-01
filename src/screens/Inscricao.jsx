import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignUp } from '@clerk/clerk-react'
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

const STEPS = ['Seus dados', 'Seu quiosque', 'Acesso']

export default function Inscricao() {
  const navigate = useNavigate()
  const { signUp, setActive, isLoaded } = useSignUp()
  const solicitarInscricao = useMutation(api.inscricoes.solicitar)

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')

  const [form, setForm] = useState({
    nomGestor: '',
    nomKiosque: '',
    ville: '',
    etat: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function validarStep() {
    if (step === 0) {
      if (!form.nomGestor.trim()) return 'Informe seu nome completo'
      if (!form.email.trim() || !form.email.includes('@')) return 'Informe um email válido'
      return null
    }
    if (step === 1) {
      if (!form.nomKiosque.trim()) return 'Informe o nome do quiosque'
      if (!form.ville.trim()) return 'Informe a cidade'
      if (!form.etat) return 'Selecione o estado'
      return null
    }
    if (step === 2) {
      if (form.senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres'
      if (form.senha !== form.confirmarSenha) return 'As senhas não conferem'
      return null
    }
    return null
  }

  function avancar() {
    const err = validarStep()
    if (err) { setErro(err); return }
    setErro('')
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    const err = validarStep()
    if (err) { setErro(err); return }
    if (!isLoaded) return

    setLoading(true)
    setErro('')
    try {
      // 1. Criar conta no Clerk
      await signUp.create({
        emailAddress: form.email,
        password: form.senha,
        firstName: form.nomGestor.split(' ')[0],
        lastName: form.nomGestor.split(' ').slice(1).join(' ') || '',
      })

      // 2. Enviar email de verificação
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (e) {
      setErro(e.errors?.[0]?.longMessage ?? e.message ?? 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (!isLoaded || !code) return
    setLoading(true)
    setErro('')
    try {
      // 3. Verificar email
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status !== 'complete') {
        setErro('Código inválido. Tente novamente.')
        setLoading(false)
        return
      }

      // 4. Activar sessão
      await setActive({ session: result.createdSessionId })

      // 5. Registrar no Convex
      await solicitarInscricao({
        nomGestor: form.nomGestor,
        nomKiosque: form.nomKiosque,
        ville: form.ville,
        etat: form.etat,
        email: form.email,
        clerkUserId: result.createdUserId ?? undefined,
      })

      setSucesso(true)
    } catch (e) {
      setErro(e.errors?.[0]?.longMessage ?? e.message ?? 'Erro ao verificar código')
    } finally {
      setLoading(false)
    }
  }

  if (sucesso) {
    return (
      <div style={s.page}>
        <WaveBg />
        <div style={{ ...s.card, textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ ...s.titulo, color: '#06D6A0', marginBottom: 12 }}>Inscrição enviada!</h2>
          <p style={{ ...s.subtitulo, marginBottom: 28 }}>
            Recebemos sua solicitação para o quiosque <strong style={{ color: '#00B4D8' }}>{form.nomKiosque}</strong>.<br />
            Em breve você receberá um email com o link do seu painel.
          </p>
          <div style={{ background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.25)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
            {[
              ['Gestor', form.nomGestor],
              ['Email', form.email],
              ['Quiosque', form.nomKiosque],
              ['Cidade', `${form.ville} · ${form.etat}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/')} style={s.btnSecondary}>
            ← Voltar ao início
          </button>
        </div>
      </div>
    )
  }

  if (pendingVerification) {
    return (
      <div style={s.page}>
        <WaveBg />
        <div style={s.card}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
            <h2 style={s.titulo}>Verifique seu email</h2>
            <p style={s.subtitulo}>
              Enviamos um código de 6 dígitos para<br />
              <strong style={{ color: '#00B4D8' }}>{form.email}</strong>
            </p>
          </div>
          <label style={s.label}>Código de verificação</label>
          <input
            style={{ ...s.input, fontSize: 28, textAlign: 'center', letterSpacing: '0.3em', fontWeight: 700 }}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
            autoFocus
          />
          {erro && <p style={s.erro}>{erro}</p>}
          <button onClick={handleVerify} disabled={loading || code.length !== 6} style={{ ...s.btnPrimary, marginTop: 8, opacity: code.length === 6 ? 1 : 0.5 }}>
            {loading ? '⏳ Verificando...' : '✅ Confirmar email'}
          </button>
          <button onClick={() => setPendingVerification(false)} style={s.btnLink}>
            ← Corrigir email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <WaveBg />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 28, fontWeight: 800, color: '#F5E6C8' }}>
          Quiosque <span style={{ color: '#00B4D8' }}>Praia</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
          Cadastro do gestor
        </div>
      </div>

      <div style={s.card}>
        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                  background: i < step ? '#06D6A0' : i === step ? '#00B4D8' : 'rgba(255,255,255,0.1)',
                  color: i <= step ? '#0D2137' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.3s'
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 10, color: i === step ? '#00B4D8' : 'rgba(255,255,255,0.3)', fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: i < step ? '#06D6A0' : 'rgba(255,255,255,0.1)', margin: '0 6px 16px', transition: 'all 0.3s' }} />}
            </div>
          ))}
        </div>

        {/* Step 0 — Dados pessoais */}
        {step === 0 && (
          <>
            <h3 style={s.stepTitle}>Seus dados pessoais</h3>
            <label style={s.label}>Nome completo *</label>
            <input style={s.input} value={form.nomGestor} onChange={e => set('nomGestor', e.target.value)} placeholder="Ex: João Silva" autoFocus />
            <label style={s.label}>Email *</label>
            <input style={s.input} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" />
          </>
        )}

        {/* Step 1 — Dados do quiosque */}
        {step === 1 && (
          <>
            <h3 style={s.stepTitle}>Dados do seu quiosque</h3>
            <label style={s.label}>Nome do quiosque *</label>
            <input style={s.input} value={form.nomKiosque} onChange={e => set('nomKiosque', e.target.value)} placeholder="Ex: Quiosque da Tereza" autoFocus />
            <label style={s.label}>Cidade *</label>
            <input style={s.input} value={form.ville} onChange={e => set('ville', e.target.value)} placeholder="Ex: Guarujá" />
            <label style={s.label}>Estado *</label>
            <select style={s.select} value={form.etat} onChange={e => set('etat', e.target.value)}>
              <option value="">— Selecione o estado —</option>
              {ESTADOS.map(e => (
                <option key={e.uf} value={e.uf}>{e.nome} ({e.uf})</option>
              ))}
            </select>
          </>
        )}

        {/* Step 2 — Senha */}
        {step === 2 && (
          <>
            <h3 style={s.stepTitle}>Crie sua senha de acesso</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.6 }}>
              Esta senha será usada para acessar o painel admin do seu quiosque.
            </p>
            <label style={s.label}>Senha *</label>
            <input style={s.input} type="password" value={form.senha} onChange={e => set('senha', e.target.value)} placeholder="Mínimo 8 caracteres" autoFocus />
            <label style={s.label}>Confirmar senha *</label>
            <input style={s.input} type="password" value={form.confirmarSenha} onChange={e => set('confirmarSenha', e.target.value)} placeholder="Repita a senha" />
          </>
        )}

        {erro && <p style={s.erro}>{erro}</p>}

        {/* Navegação */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {step > 0 && (
            <button onClick={() => { setErro(''); setStep(s => s - 1) }} style={s.btnSecondary}>
              ← Voltar
            </button>
          )}
          {step < 2 ? (
            <button onClick={avancar} style={s.btnPrimary}>
              Próximo →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Criando conta...' : '🚀 Criar minha conta'}
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Já tem uma conta? </span>
          <button onClick={() => navigate('/admin/' + (form.ville || 'login'))} style={s.btnLink}>
            Fazer login
          </button>
        </div>
      </div>
    </div>
  )
}

function WaveBg() {
  return (
    <svg style={{ position: 'fixed', bottom: 0, left: 0, right: 0, opacity: 0.07, pointerEvents: 'none' }} viewBox="0 0 1440 320" preserveAspectRatio="none" height="320">
      <path fill="#00B4D8" d="M0,160 C240,80 480,240 720,160 C960,80 1200,240 1440,160 L1440,320 L0,320Z" />
    </svg>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #04111F 0%, #0D2137 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '40px 20px', position: 'relative'
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(0,180,216,0.2)',
    borderRadius: 24, padding: '32px 28px',
    width: '100%', maxWidth: 440,
    position: 'relative', zIndex: 1,
    backdropFilter: 'blur(10px)',
  },
  titulo: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: 24, fontWeight: 800, color: '#F5E6C8', marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
    fontFamily: 'Inter, sans-serif',
  },
  stepTitle: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: 18, fontWeight: 700, color: '#F5E6C8', marginBottom: 20,
  },
  label: {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontFamily: 'Inter, sans-serif',
  },
  input: {
    width: '100%', background: 'rgba(255,255,255,0.07)',
    border: '1.5px solid rgba(0,180,216,0.25)', borderRadius: 12,
    padding: '13px 16px', fontSize: 15, color: 'white',
    fontFamily: 'Inter, sans-serif', outline: 'none',
    marginBottom: 16, boxSizing: 'border-box',
  },
  select: {
    width: '100%', background: '#0D2137',
    border: '1.5px solid rgba(0,180,216,0.25)', borderRadius: 12,
    padding: '13px 16px', fontSize: 15, color: 'white',
    fontFamily: 'Inter, sans-serif', outline: 'none',
    marginBottom: 16, boxSizing: 'border-box', appearance: 'none',
  },
  btnPrimary: {
    flex: 1, background: '#06D6A0', color: '#0D2137', border: 'none',
    borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 800,
    cursor: 'pointer', fontFamily: "'Baloo 2', cursive", width: '100%',
  },
  btnSecondary: {
    flex: 1, background: 'rgba(255,255,255,0.07)',
    border: '1.5px solid rgba(255,255,255,0.15)',
    borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter, sans-serif',
  },
  btnLink: {
    background: 'none', border: 'none', color: '#00B4D8',
    fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
    textUnderlineOffset: 3, fontFamily: 'Inter, sans-serif',
  },
  erro: {
    fontSize: 13, color: '#FF6B6B', marginBottom: 12,
    background: 'rgba(255,107,107,0.1)', borderRadius: 8,
    padding: '8px 12px', fontFamily: 'Inter, sans-serif',
  },
}
