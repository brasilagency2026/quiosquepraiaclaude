import { useNavigate } from 'react-router-dom'

export default function DemoChoix() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #04111F 0%, #0D2137 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

      <button onClick={() => navigate('/')} style={{ position: 'absolute', top: 24, left: 24, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
        ← Voltar
      </button>

      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 28, fontWeight: 800, color: '#F5E6C8', marginBottom: 8 }}>
          Quiosque <span style={{ color: '#00B4D8' }}>Praia</span>
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter,sans-serif' }}>
          Escolha qual simulação deseja explorar
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, width: '100%', maxWidth: 640 }}>

        {/* Demo Cliente */}
        <button onClick={() => navigate('/demo/cliente')} style={{ background: 'rgba(0,180,216,0.08)', border: '2px solid rgba(0,180,216,0.3)', borderRadius: 24, padding: '36px 28px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', fontFamily: 'inherit' }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📱</div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: '#00B4D8', marginBottom: 8 }}>
            Simulação Cliente
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontFamily: 'Inter,sans-serif' }}>
            Veja como o cliente faz o pedido — menu completo, carrinho e pagamento simulado.
          </div>
          <div style={{ marginTop: 20, background: '#00B4D8', color: '#0D2137', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, display: 'inline-block' }}>
            Explorar como cliente →
          </div>
        </button>

        {/* Demo Gestor */}
        <button onClick={() => navigate('/demo/gestor')} style={{ background: 'rgba(6,214,160,0.08)', border: '2px solid rgba(6,214,160,0.3)', borderRadius: 24, padding: '36px 28px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', fontFamily: 'inherit' }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⚙️</div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: '#06D6A0', marginBottom: 8 }}>
            Simulação Gestor
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontFamily: 'Inter,sans-serif' }}>
            Explore o painel completo — cardápio, categorias, equipe, QR codes e dashboard.
          </div>
          <div style={{ marginTop: 20, background: '#06D6A0', color: '#0D2137', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, display: 'inline-block' }}>
            Explorar como gestor →
          </div>
        </button>
      </div>

      <div style={{ marginTop: 32, fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter,sans-serif', textAlign: 'center' }}>
        🔄 Dados reiniciados a cada visita · Nenhum dado real é utilizado
      </div>
    </div>
  )
}
