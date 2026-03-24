import { SignIn } from '@clerk/clerk-react'
import { useParams } from 'react-router-dom'

export default function LoginGestor() {
  const { slug } = useParams()
  return (
    <div style={{
      minHeight: '100vh', background: '#0D2137',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px'
    }}>
      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 32, fontWeight: 800, color: '#F5E6C8', marginBottom: 4 }}>
        Quiosque <span style={{ color: '#00B4D8' }}>Praia</span>
      </div>
      <div style={{ fontSize: 14, color: '#48CAE4', marginBottom: 32, background: 'rgba(0,180,216,0.1)', padding: '6px 16px', borderRadius: 20 }}>
        Acesso do Gestor · {slug}
      </div>
      <SignIn
        redirectUrl={`/admin/${slug}`}
        appearance={{
          variables: { colorPrimary: '#00B4D8', colorBackground: '#1A3A5C', colorText: '#F5E6C8', colorInputBackground: '#0D2137', colorInputText: '#F5E6C8' },
          elements: { card: { background: '#1A3A5C', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 20 }, rootBox: { width: '100%', maxWidth: 400 } }
        }}
      />
      <a href={`/login/${slug}`} style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
        ← Voltar ao login da equipe
      </a>
    </div>
  )
}
