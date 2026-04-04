import { useState, useEffect, useRef } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'

const FEATURES = [
  { icon: '📲', title: 'QR Code por guarda-sol', desc: 'Cada guarda-sol tem seu QR único. Cliente abre o cardápio sem instalar nada.' },
  { icon: '💳', title: 'PIX + Cartão + Dinheiro', desc: 'MercadoPago integrado. Receba em qualquer forma de pagamento.' },
  { icon: '👨‍🍳', title: 'Cozinha em tempo real', desc: 'Pedidos chegam instantaneamente. Sem papel, sem ruído, sem erro.' },
  { icon: '🛵', title: 'Gestão de entregas', desc: 'Garçom sabe exatamente o que entregar e onde. Troco calculado automaticamente.' },
  { icon: '📊', title: 'Dashboard completo', desc: 'Veja faturamento, pedidos e desempenho dos garçons em tempo real.' },
  { icon: '🔔', title: 'Alertas sonoros', desc: 'Cada panel recebe alertas diferentes. Nunca perde um pedido.' },
]

const STEPS = [
  { num: '01', icon: '📱', title: 'Cliente escaneia o QR', desc: 'Um QR colado no guarda-sol. Abre o cardápio em segundos, direto no celular.' },
  { num: '02', icon: '🛒', title: 'Faz o pedido e paga', desc: 'Escolhe, adiciona observações e paga via PIX ou cartão. Dinheiro também.' },
  { num: '03', icon: '🍳', title: 'Cozinha recebe na hora', desc: 'O pedido aparece instantaneamente. Garçom entrega no guarda-sol.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const enviarContato = useAction(api.inscricoes.enviarContato)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleCadastro(e) {
    e.preventDefault()
    if (!email || enviando) return
    setEnviando(true)
    try {
      await enviarContato({ email })
      setEnviado(true)
    } catch (err) {
      console.error(err)
      setEnviado(true) // show success anyway
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: '#050F1A', color: 'white', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Baloo+2:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes wave1 { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2);opacity:0} }
        @keyframes fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .fade-up { animation: fade-up 0.7s ease forwards; }
        .fade-up-d1 { animation: fade-up 0.7s 0.15s ease both; }
        .fade-up-d2 { animation: fade-up 0.7s 0.3s ease both; }
        .fade-up-d3 { animation: fade-up 0.7s 0.45s ease both; }
        .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,180,216,0.15); }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(5,15,26,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,180,216,0.1)' : 'none',
        transition: 'all 0.3s',
      }}>
        <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 800, color: '#F5E6C8' }}>
          Quiosque <span style={{ color: '#00B4D8' }}>Praia</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="#como-funciona" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Como funciona</a>
          <a href="#funcionalidades" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Funcionalidades</a>
          <button onClick={() => navigate('/inscricao')} style={{ background: '#06D6A0', color: '#050F1A', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Começar grátis
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,180,216,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(6,214,160,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, overflow: 'hidden', pointerEvents: 'none' }}>
          <svg style={{ position: 'absolute', bottom: 0, width: '200%', animation: 'wave1 12s linear infinite' }} viewBox="0 0 1440 80" preserveAspectRatio="none" height="80">
            <path fill="rgba(0,180,216,0.06)" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80Z" />
          </svg>
        </div>

        <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.25)', borderRadius: 50, padding: '7px 18px', fontSize: 13, color: '#48CAE4', marginBottom: 32, fontWeight: 600 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#06D6A0', display: 'inline-block', position: 'relative' }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#06D6A0', animation: 'pulse-ring 1.5s infinite' }} />
          </span>
          Pedidos via QR Code para quiosques de praia
        </div>

        <h1 className="fade-up-d1" style={{ fontSize: 'clamp(38px, 8vw, 78px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, maxWidth: 820 }}>
          <span style={{ color: '#F5E6C8' }}>Seu quiosque</span>
          <br />
          <span style={{ background: 'linear-gradient(90deg, #00B4D8, #06D6A0, #00B4D8)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 4s linear infinite' }}>
            no digital
          </span>
          <span style={{ color: '#F5E6C8' }}> em minutos</span>
        </h1>

        <p className="fade-up-d2" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 44, maxWidth: 560, fontWeight: 400 }}>
          Clientes pedem pelo celular escaneando o QR do guarda-sol.
          Você recebe na cozinha em segundos. Sem app, sem complicação.
        </p>

        <div className="fade-up-d3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 72 }}>
          <button onClick={() => navigate('/inscricao')} className="hover-lift" style={{ background: 'linear-gradient(135deg, #06D6A0, #00B4D8)', color: '#050F1A', border: 'none', borderRadius: 14, padding: '16px 36px', fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 32px rgba(6,214,160,0.35)' }}>
            🚀 Começar grátis
          </button>
          <button onClick={() => navigate('/demo')} className="hover-lift" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '16px 36px', fontSize: 17, fontWeight: 600, cursor: 'pointer' }}>
            🏖️ Ver demo
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {[
            { icon: '📱', label: 'Cliente', sub: 'Menu + Pagamento', color: '#00B4D8', top: 0 },
            { icon: '👨‍🍳', label: 'Cozinha', sub: 'Pedidos em tempo real', color: '#F59E0B', top: -16 },
            { icon: '🛵', label: 'Garçom', sub: 'Entregas organizadas', color: '#06D6A0', top: 0 },
            { icon: '📊', label: 'Admin', sub: 'Dashboard completo', color: '#A78BFA', top: -16 },
          ].map((p, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${p.color}28`, borderRadius: 18, padding: '20px 22px', textAlign: 'center', minWidth: 110, transform: `translateY(${p.top}px)`, animation: `float 4s ${i * 0.3}s ease-in-out infinite`, backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{p.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3, lineHeight: 1.4 }}>{p.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#00B4D8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>COMO FUNCIONA</div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#F5E6C8', lineHeight: 1.2 }}>Do QR ao pedido em <span style={{ color: '#06D6A0' }}>menos de 1 minuto</span></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {STEPS.map((step, i) => (
              <div key={i} className="hover-lift" style={{ display: 'flex', gap: 24, alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,180,216,0.1)', borderRadius: 20, padding: '28px 32px' }}>
                <div style={{ fontSize: 44, flexShrink: 0, lineHeight: 1 }}>{step.icon}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#00B4D8', letterSpacing: '0.1em' }}>{step.num}</span>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F5E6C8' }}>{step.title}</h3>
                  </div>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#06D6A0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>FUNCIONALIDADES</div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#F5E6C8', lineHeight: 1.2 }}>Tudo que seu quiosque precisa</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="hover-lift" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '24px' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F5E6C8', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇO */}
      <section style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>PREÇO</div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#F5E6C8', marginBottom: 48, lineHeight: 1.2 }}>Simples e sem surpresas</h2>

          {/* Card preço */}
          <div className="hover-lift" style={{ background: 'linear-gradient(160deg, rgba(0,180,216,0.08), rgba(6,214,160,0.05))', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 24, padding: '40px 36px', marginBottom: 20 }}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 56, fontWeight: 800, color: '#06D6A0', marginBottom: 6 }}>Grátis 7 dias</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>Sem cartão de crédito · Comece agora</div>
            {[
              { icon: '✓', text: 'Pedidos ilimitados', dim: false },
              { icon: '✓', text: 'Todos os panels incluídos (Cozinha, Garçom, Caixa, Admin)', dim: false },
              { icon: '✓', text: 'Suporte por WhatsApp', dim: false },
              { icon: '✓', text: '💳 Sem maquininha — receba pelo celular via MercadoPago', dim: false },
              { icon: '✓', text: '🏖️ Cadastro Premium grátis em quiosquepraia.com', dim: false },
              { icon: '→', text: 'Após 7 dias: R$ 200/mês · você decide se quer continuar', dim: true },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <span style={{ color: item.dim ? 'rgba(255,255,255,0.3)' : '#06D6A0', fontSize: 16, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: item.dim ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)', textAlign: 'left', lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
            <div style={{ margin: '20px 0 4px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'rgba(255,205,85,0.8)', lineHeight: 1.6 }}>
              📩 Após os 7 dias, você receberá um email para continuar por <strong>R$ 200/mês</strong>.
            </div>
            <button onClick={() => navigate('/inscricao')} style={{ width: '100%', marginTop: 20, background: 'linear-gradient(135deg, #06D6A0, #00B4D8)', color: '#050F1A', border: 'none', borderRadius: 14, padding: '16px', fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 32px rgba(6,214,160,0.25)' }}>
              🚀 Quero começar agora
            </button>
          </div>

          {/* Bloc maquininha */}
          <div style={{ background: 'rgba(0,180,216,0.06)', border: '1px solid rgba(0,180,216,0.15)', borderRadius: 18, padding: '24px 28px', textAlign: 'left', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#00B4D8', marginBottom: 10 }}>
              💳 Sem maquininha de cartão
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              Esqueça o aluguel de maquininha. Com o Quiosque Praia, seus clientes pagam via <strong style={{ color: 'white' }}>PIX, cartão ou dinheiro</strong> diretamente pelo celular — o dinheiro cai na sua conta <strong style={{ color: '#06D6A0' }}>MercadoPago</strong> instantaneamente, sem intermediários.
            </p>
          </div>

          {/* Bloc quiosquepraia.com */}
          <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 18, padding: '24px 28px', textAlign: 'left' }}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#A78BFA', marginBottom: 10 }}>
              🏖️ Membro Premium em quiosquepraia.com
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 12 }}>
              Ao se inscrever, seu quiosque ganha automaticamente uma <strong style={{ color: 'white' }}>ficha premium e gratuita</strong> no portal geolocalizável dos quiosques de praia do Brasil — <a href="https://quiosquepraia.com" target="_blank" rel="noopener noreferrer" style={{ color: '#A78BFA', fontWeight: 600 }}>quiosquepraia.com</a>.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              Turistas e banhistas encontram seu quiosque pelo mapa, veem o cardápio e chegam até você. Visibilidade máxima, sem custo extra.
            </p>
          </div>
        </div>
      </section>

      {/* CADASTRO */}
      <section id="cadastro" style={{ padding: '100px 24px 80px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🏖️</div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, color: '#F5E6C8', marginBottom: 16, lineHeight: 1.2 }}>Pronto para digitalizar<br />seu quiosque?</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 40 }}>
            Deixe seu email e entraremos em contato para configurar tudo gratuitamente.
          </p>
          {enviado ? (
            <div style={{ background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.25)', borderRadius: 18, padding: '32px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 22, fontWeight: 700, color: '#06D6A0', marginBottom: 8 }}>Recebemos seu contato!</div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>Em breve entraremos em contato.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(0,180,216,0.25)', borderRadius: 14, padding: '16px 20px', fontSize: 16, color: 'white', outline: 'none' }} />
              <button onClick={handleCadastro} disabled={enviando} style={{ background: 'linear-gradient(135deg, #06D6A0, #00B4D8)', color: '#050F1A', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 700, cursor: enviando ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(6,214,160,0.25)', opacity: enviando ? 0.7 : 1 }}>
                {enviando ? '⏳ Enviando...' : 'Entrar em contato →'}
              </button>
              <button onClick={() => navigate('/inscricao')} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', color: 'rgba(255,255,255,0.55)' }}>
                Ou cadastre-se agora mesmo →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '28px 32px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: '#F5E6C8' }}>
          Quiosque <span style={{ color: '#00B4D8' }}>Praia</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>© 2026 · Feito com 🌊 para a praia brasileira</div>
        <button onClick={() => navigate('/superadmin')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.08)', fontSize: 11, cursor: 'pointer' }}>admin</button>
      </footer>
    </div>
  )
}
