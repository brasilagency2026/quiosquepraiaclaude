import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SignUp, useUser, useClerk } from '@clerk/clerk-react'
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

// ETAPE 1 — Formulaire quiosque
function FormQuiosque({ onNext }) {
  const [form, setForm] = useState({ nomGestor: '', nomKiosque: '', ville: '', etat: '' })
  const [erro, setErro] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function avancar() {
    if (!form.nomGestor.trim()) { setErro('Informe seu nome completo'); return }
    if (!form.nomKiosque.trim()) { setErro('Informe o nome do quiosque'); return }
    if (!form.ville.trim()) { setErro('Informe a cidade'); return }
    if (!form.etat) { setErro('Selecione o estado'); return }
    setErro('')
    onNext(form)
  }

  return (
    <div style={s.card}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 24, fontWeight: 800, color: '#F5E6C8', marginBottom: 4 }}>
          Cadastre seu quiosque 🏖️
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif' }}>
          Passo 1 de 2 — Dados do quiosque
        </div>
      </div>

      <label style={s.label}>Seu nome completo *</label>
      <input style={s.input} value={form.nomGestor} onChange={e => set('nomGestor', e.target.value)} placeholder="Ex: João Silva" autoFocus />

      <label style={s.label}>Nome do quiosque *</label>
      <input style={s.input} value={form.nomKiosque} onChange={e => set('nomKiosque', e.target.value)} placeholder="Ex: Quiosque da Tereza" />

      <label style={s.label}>Cidade *</label>
      <input style={s.input} value={form.ville} onChange={e => set('ville', e.target.value)} placeholder="Ex: Guarujá" />

      <label style={s.label}>Estado *</label>
      <select style={s.select} value={form.etat} onChange={e => set('etat', e.target.value)}>
        <option value="">— Selecione o estado —</option>
        {ESTADOS.map(e => (
          <option key={e.uf} value={e.uf}>{e.nome} ({e.uf})</option>
        ))}
      </select>

      {erro && <div style={s.erro}>{erro}</div>}

      <button onClick={avancar} style={s.btnPrimary}>
        Próximo → Criar conta de acesso
      </button>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter,sans-serif' }}>Já tem conta? </span>
        <a href="/admin/login" style={{ fontSize: 13, color: '#00B4D8', fontFamily: 'Inter,sans-serif' }}>Fazer login</a>
      </div>
    </div>
  )
}

// ETAPE 2 — Clerk SignUp (email + senha, PT-BR)
function ClerkSignUpStep({ dadosQuiosque, onComplete }) {
  return (
    <div style={s.card}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, fontWeight: 800, color: '#F5E6C8', marginBottom: 4 }}>
          🔐 Crie seu acesso
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif' }}>
          Passo 2 de 2 — Email e senha do painel
        </div>
        <div style={{ marginTop: 10, background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 10, padding: '8px 14px', display: 'inline-block' }}>
          <span style={{ fontSize: 13, color: '#48CAE4', fontFamily: 'Inter,sans-serif' }}>
            🏖️ {dadosQuiosque.nomKiosque} · {dadosQuiosque.ville}/{dadosQuiosque.etat}
          </span>
        </div>
      </div>

      <SignUp
        routing="virtual"
        afterSignUpUrl="/inscricao/sucesso"
        redirectUrl="/inscricao/sucesso"
        appearance={{
          variables: {
            colorPrimary: '#00B4D8',
            colorBackground: '#0D2137',
            colorText: '#F5E6C8',
            colorInputBackground: 'rgba(255,255,255,0.07)',
            colorInputText: '#F5E6C8',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          },
          elements: {
            card: {
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              padding: 0,
            },
            rootBox: { width: '100%' },
            headerTitle: { display: 'none' },
            headerSubtitle: { display: 'none' },
            formButtonPrimary: {
              background: '#06D6A0',
              color: '#0D2137',
              fontWeight: 800,
              borderRadius: '12px',
              fontSize: '15px',
            },
            footerActionLink: { color: '#00B4D8' },
            formFieldInput: {
              background: 'rgba(255,255,255,0.07)',
              border: '1.5px solid rgba(0,180,216,0.25)',
              color: 'white',
              borderRadius: '12px',
            },
            identityPreviewEditButton: { color: '#00B4D8' },
          },
        }}
      />
    </div>
  )
}

// ETAPE 3 — Succès, enregistrement Convex
function SucessoStep({ dadosQuiosque }) {
  const { user, isLoaded } = useUser()
  const solicitarInscricao = useMutation(api.inscricoes.solicitar)
  const [done, setDone] = useState(false)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoaded || !user || done) return

    async function registrar() {
      try {
        await solicitarInscricao({
          nomGestor: dadosQuiosque.nomGestor,
          nomKiosque: dadosQuiosque.nomKiosque,
          ville: dadosQuiosque.ville,
          etat: dadosQuiosque.etat,
          email: user.primaryEmailAddress?.emailAddress ?? '',
          clerkUserId: user.id,
        })
        setDone(true)
      } catch (e) {
        // Ignorer l'erreur "já cadastrado" si doublon
        setDone(true)
      }
    }
    registrar()
  }, [isLoaded, user])

  if (!done) {
    return (
      <div style={s.card}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter,sans-serif' }}>Registrando seu quiosque...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...s.card, textAlign: 'center', padding: '48px 32px' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 26, fontWeight: 800, color: '#06D6A0', marginBottom: 12 }}>
        Inscrição enviada!
      </div>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 28, fontFamily: 'Inter,sans-serif' }}>
        Recebemos sua solicitação para o quiosque <strong style={{ color: '#00B4D8' }}>{dadosQuiosque.nomKiosque}</strong>.<br />
        Você receberá um email com o link do seu painel assim que for aprovado.
      </p>
      <div style={{ background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, textAlign: 'left' }}>
        {[
          ['Gestor', dadosQuiosque.nomGestor],
          ['Quiosque', dadosQuiosque.nomKiosque],
          ['Cidade', `${dadosQuiosque.ville} · ${dadosQuiosque.etat}`],
          ['Email', user?.primaryEmailAddress?.emailAddress ?? ''],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter,sans-serif' }}>{k}</span>
            <span style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/')} style={{ ...s.btnPrimary, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
        ← Voltar ao início
      </button>
    </div>
  )
}

// COMPOSANT PRINCIPAL
export default function Inscricao() {
  const [etapa, setEtapa] = useState('quiosque') // quiosque | clerk | sucesso
  const [dadosQuiosque, setDadosQuiosque] = useState(null)
  const [searchParams] = useSearchParams()
  const { isSignedIn } = useUser()

  // Si retour depuis Clerk SignUp avec succès
  useEffect(() => {
    if (searchParams.get('etapa') === 'sucesso' || window.location.pathname === '/inscricao/sucesso') {
      if (dadosQuiosque) setEtapa('sucesso')
    }
  }, [searchParams])

  // Persister dadosQuiosque dans sessionStorage
  useEffect(() => {
    if (dadosQuiosque) {
      sessionStorage.setItem('inscricao_dados', JSON.stringify(dadosQuiosque))
    }
  }, [dadosQuiosque])

  // Récupérer depuis sessionStorage au montage (retour depuis Clerk)
  useEffect(() => {
    const saved = sessionStorage.getItem('inscricao_dados')
    if (saved && !dadosQuiosque) {
      const parsed = JSON.parse(saved)
      setDadosQuiosque(parsed)
      // Si l'utilisateur est déjà connecté (retour après Clerk), aller au succès
      if (isSignedIn) setEtapa('sucesso')
    }
  }, [isSignedIn])

  return (
    <div style={s.page}>
      <WaveBg />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative', zIndex: 1 }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 26, fontWeight: 800, color: '#F5E6C8' }}>
            Quiosque <span style={{ color: '#00B4D8' }}>Praia</span>
          </div>
        </a>
      </div>

      {etapa === 'quiosque' && (
        <FormQuiosque onNext={dados => { setDadosQuiosque(dados); setEtapa('clerk') }} />
      )}

      {etapa === 'clerk' && dadosQuiosque && (
        <ClerkSignUpStep dadosQuiosque={dadosQuiosque} onComplete={() => setEtapa('sucesso')} />
      )}

      {(etapa === 'sucesso' || window.location.pathname === '/inscricao/sucesso') && dadosQuiosque && (
        <SucessoStep dadosQuiosque={dadosQuiosque} />
      )}
    </div>
  )
}

function WaveBg() {
  return (
    <svg style={{ position: 'fixed', bottom: 0, left: 0, right: 0, opacity: 0.07, pointerEvents: 'none', zIndex: 0 }} viewBox="0 0 1440 320" preserveAspectRatio="none" height="320">
      <path fill="#00B4D8" d="M0,160 C240,80 480,240 720,160 C960,80 1200,240 1440,160 L1440,320 L0,320Z" />
      <path fill="#06D6A0" d="M0,200 C360,120 1080,280 1440,200 L1440,320 L0,320Z" opacity="0.5" />
    </svg>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #04111F 0%, #0D2137 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '40px 20px', position: 'relative',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(0,180,216,0.2)',
    borderRadius: 24, padding: '28px 24px',
    width: '100%', maxWidth: 420,
    position: 'relative', zIndex: 1,
    backdropFilter: 'blur(10px)',
  },
  label: {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'rgba(255,255,255,0.6)', marginBottom: 6,
    fontFamily: 'Inter, sans-serif',
  },
  input: {
    width: '100%', background: 'rgba(255,255,255,0.07)',
    border: '1.5px solid rgba(0,180,216,0.25)', borderRadius: 12,
    padding: '13px 16px', fontSize: 15, color: 'white',
    fontFamily: 'Inter, sans-serif', outline: 'none',
    marginBottom: 14, boxSizing: 'border-box',
  },
  select: {
    width: '100%', background: '#0D2137',
    border: '1.5px solid rgba(0,180,216,0.25)', borderRadius: 12,
    padding: '13px 16px', fontSize: 15, color: 'white',
    fontFamily: 'Inter, sans-serif', outline: 'none',
    marginBottom: 14, boxSizing: 'border-box', cursor: 'pointer',
  },
  btnPrimary: {
    width: '100%', background: '#06D6A0', color: '#0D2137',
    border: 'none', borderRadius: 12, padding: '14px',
    fontSize: 15, fontWeight: 800, cursor: 'pointer',
    fontFamily: "'Baloo 2', cursive", marginTop: 4,
  },
  erro: {
    fontSize: 13, color: '#FF6B6B', background: 'rgba(255,107,107,0.1)',
    borderRadius: 8, padding: '8px 12px', marginBottom: 12,
    fontFamily: 'Inter, sans-serif',
  },
}
