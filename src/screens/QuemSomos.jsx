import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function QuemSomos() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: '#050F1A', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Baloo+2:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,180,216,0.15); }
      `}</style>

      {/* HEADER / VOLTAR */}
      <nav style={{ padding: '24px 32px', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Sora', sans-serif" }}>
          <span>←</span> Voltar
        </button>
      </nav>

      <main style={{ flex: 1, padding: '40px 24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        
        {/* HEADER SECTION */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 24 }}>
            <span style={{ color: '#F5E6C8' }}>Nossa missão é</span>
            <br />
            <span style={{ background: 'linear-gradient(90deg, #00B4D8, #06D6A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              popularizar o cardápio digital
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 640, margin: '0 auto' }}>
            Trazemos a transformação digital para bares, restaurantes, food trucks e quiosques de praia. Permitimos uma inclusão fácil, rápida e econômica no mundo das vendas online.
          </p>
        </div>

        {/* MERCADO PAGO CARD */}
        <div className="hover-lift" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px', marginBottom: 64, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
            📱
          </div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F5E6C8', marginBottom: 12 }}>Tudo via Mercado Pago</h3>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
              Chega de complicações. Nossas 3 aplicações são integradas a uma única conta Mercado Pago, garantindo que você receba os pagamentos digitais dos seus clientes de forma segura e com o dinheiro caindo direto na sua conta, sem intermediários segurando seu fluxo de caixa.
            </p>
          </div>
        </div>

        {/* NOSSAS APLICAÇÕES */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5E6C8' }}>Nossas Aplicações</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* APP 1: QUIOSQUE PRAIA */}
          <div className="hover-lift" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ background: '#00B4D8', borderRadius: 16, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
              🏖️
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F5E6C8', marginBottom: 4 }}>Quiosque Praia</h3>
              <a href="https://quiosquepraia.com.br" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#06D6A0', textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>quiosquepraia.com.br</a>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                A solução perfeita para quiosques de praia. Permite que os garçons atendam e sirvam os clientes diretamente nos guarda-sóis com um cardápio 100% digital e pedidos em tempo real.
              </p>
            </div>
          </div>

          {/* APP 2: FOOD PRONTO */}
          <div className="hover-lift" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ background: '#F59E0B', borderRadius: 16, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
              🏪
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F5E6C8', marginBottom: 4 }}>Food Pronto</h3>
              <a href="https://foodpronto.com.br" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#F59E0B', textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>foodpronto.com.br</a>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                Ideal para food trucks e estabelecimentos de balcão. O cliente faz o pedido pelo menu digital e recebe um alerta sonoro e visual em seu celular assim que o pedido está pronto para ser retirado.
              </p>
            </div>
          </div>

          {/* APP 3: DELIVERY FOOD PRONTO */}
          <div className="hover-lift" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ background: '#EF4444', borderRadius: 16, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, color: 'white' }}>
              🛵
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F5E6C8', marginBottom: 4 }}>Delivery Food Pronto</h3>
              <a href="https://delivery.foodpronto.com.br" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#EF4444', textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>delivery.foodpronto.com.br</a>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                A plataforma completa para gerenciar o delivery do seu restaurante. Catálogo digital, cálculo de taxa de entrega, e gestão de pedidos simplificada para você vender mais.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer style={{ padding: '28px 32px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© 2026 Quiosque Praia</div>
      </footer>
    </div>
  )
}
