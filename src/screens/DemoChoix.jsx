import { useNavigate } from 'react-router-dom'

export default function DemoChoix() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #04111F 0%, #0D2137 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

      <button onClick={() => navigate('/')} style={{ position: 'absolute', top: 24, left: 24, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
        ← Voltar
      </button>

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 28, fontWeight: 800, color: '#F5E6C8', marginBottom: 8 }}>
          Quiosque <span style={{ color: '#00B4D8' }}>Praia</span>
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter,sans-serif' }}>
          Escolha qual simulação deseja explorar
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 520 }}>

        {/* Demo Cliente */}
        <button onClick={() => navigate('/demo/cliente')} style={{ background: 'rgba(0,180,216,0.08)', border: '2px solid rgba(0,180,216,0.3)', borderRadius: 20, padding: '24px 28px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', fontFamily: 'inherit' }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' }}>
            <div style={{ fontSize: 44, flexShrink: 0 }}>📱</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#00B4D8', marginBottom: 4 }}>Simulação Cliente</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, fontFamily: 'Inter,sans-serif' }}>Menu completo, carrinho e pagamento simulado.</div>
            </div>
            <div style={{ background: '#00B4D8', color: '#0D2137', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>→</div>
          </div>
        </button>

        {/* Demo Gestor */}
        <button onClick={() => navigate('/demo/gestor')} style={{ background: 'rgba(6,214,160,0.08)', border: '2px solid rgba(6,214,160,0.3)', borderRadius: 20, padding: '24px 28px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', fontFamily: 'inherit' }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' }}>
            <div style={{ fontSize: 44, flexShrink: 0 }}>⚙️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#06D6A0', marginBottom: 4 }}>Simulação Gestor</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, fontFamily: 'Inter,sans-serif' }}>Cardápio, categorias, equipe, QR codes e dashboard.</div>
            </div>
            <div style={{ background: '#06D6A0', color: '#0D2137', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>→</div>
          </div>
        </button>

        {/* Demo Equipe */}
        <button onClick={() => navigate('/demo/equipe')} style={{ background: 'rgba(245,158,11,0.08)', border: '2px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '24px 28px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32 }}>👨‍🍳</div>
                <div style={{ fontSize: 11, color: '#F59E0B', fontFamily: 'Inter,sans-serif', fontWeight: 700 }}>1234</div>
              </div>
              <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }}>·</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32 }}>🛵</div>
                <div style={{ fontSize: 11, color: '#06D6A0', fontFamily: 'Inter,sans-serif', fontWeight: 700 }}>5678</div>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 20, fontWeight: 800, color: '#F59E0B', marginBottom: 4 }}>Simulação Equipe</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, fontFamily: 'Inter,sans-serif' }}>Login com PIN · Cozinha e Garçom com fluxo real de pedidos.</div>
            </div>
            <div style={{ background: '#F59E0B', color: '#0D2137', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>→</div>
          </div>
        </button>

      </div>

      <div style={{ marginTop: 28, fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter,sans-serif', textAlign: 'center' }}>
        🔄 Dados reiniciados a cada visita · Nenhum dado real é utilizado
      </div>
    </div>
  )
}
