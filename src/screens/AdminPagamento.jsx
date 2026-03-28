import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import { useToast } from '../context/ToastContext'

export default function AdminPagamento({ kiosque }) {
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [confirmRemove, setConfirmRemove] = useState(false)

  const config = useQuery(api.pagamentos.getConfigGestor)
  const oauthUrlData = useQuery(api.pagamentos.getMPOAuthUrl)
  const desconectar = useMutation(api.pagamentos.desconectarOAuthMP)

  useEffect(() => {
    const status = searchParams.get('mp_oauth')
    if (status === 'success') {
      showToast('✅ MercadoPago conectado com sucesso!')
      setSearchParams({})
    } else if (status === 'error') {
      showToast('❌ Erro ao conectar MercadoPago. Tente novamente.')
      setSearchParams({})
    }
  }, [searchParams])

  const isConfigured = config?.configurado
  const isMPOAuth = config?.mp_oauth

  async function handleDesconectar() {
    try {
      await desconectar()
      showToast('🔌 Conta desconectada')
      setConfirmRemove(false)
    } catch (e) {
      showToast('❌ ' + e.message)
    }
  }

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* Status */}
      <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-card)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, fontWeight: 700, color: 'var(--ocean)' }}>
            Status do Pagamento
          </h3>
          <span style={{
            background: isConfigured ? '#D1FAE5' : '#FEE2E2',
            color: isConfigured ? '#059669' : '#DC2626',
            padding: '5px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700
          }}>
            {isConfigured ? '✅ Conectado' : '❌ Não conectado'}
          </span>
        </div>

        {isConfigured ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface)', borderRadius: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 32 }}>🇧🇷</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: 'var(--ocean)' }}>
                  MercadoPago
                  {isMPOAuth && (
                    <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: 11, padding: '2px 8px', borderRadius: 6, marginLeft: 8, fontWeight: 600 }}>
                      OAuth ✓
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>PIX · Cartão · Boleto</div>
                {config?.testadoEm && (
                  <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>
                    ✅ Conectado em {new Date(config.testadoEm).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setConfirmRemove(true)} style={{
              width: '100%', background: '#FEE2E2', border: '1.5px solid #FECACA',
              borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', color: '#DC2626', fontFamily: 'Inter,sans-serif'
            }}>
              🔌 Desconectar conta
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Conecte sua conta para começar a receber pedidos.
            </p>
          </div>
        )}
      </div>

      {/* Info OAuth */}
      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: 16, marginBottom: 20, display: 'flex', gap: 12 }}>
        <div style={{ fontSize: 24, flexShrink: 0 }}>🔐</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#065F46', marginBottom: 4 }}>Conexão segura via OAuth</div>
          <div style={{ fontSize: 12, color: '#047857', lineHeight: 1.6 }}>
            Você será redirecionado para o MercadoPago para autorizar. Nenhuma chave é digitada manualmente.
          </div>
        </div>
      </div>

      {/* Opções de conexão */}
      {!isConfigured && (
        <>
          <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: 'var(--ocean)', marginBottom: 14 }}>
            Conectar plataforma de pagamento
          </p>

          {/* MercadoPago */}
          <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-card)', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#E8F4FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🇧🇷</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 17, fontWeight: 800, color: '#009EE3' }}>MercadoPago</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>PIX · Cartão · Boleto · Parcelamento</div>
              </div>
              <span style={{ background: '#E8F4FD', color: '#0077B6', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Recomendado 🇧🇷</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              Clique abaixo e autorize no MercadoPago. Você voltará automaticamente com a conta conectada.
            </p>
            <a
              href={oauthUrlData?.url ?? '#'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: oauthUrlData?.url ? '#009EE3' : '#94A3B8',
                color: 'white', borderRadius: 14, padding: '14px 20px',
                textDecoration: 'none', fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700,
                pointerEvents: oauthUrlData?.url ? 'auto' : 'none',
              }}
            >
              🔗 Conectar com MercadoPago
            </a>
          </div>

          {/* Stripe — em breve */}
          <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-card)', opacity: 0.55 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F0EFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🌎</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 17, fontWeight: 800, color: '#635BFF' }}>Stripe</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Cartão Internacional · Apple Pay · Google Pay</div>
              </div>
              <span style={{ background: '#F1F5F9', color: '#64748B', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Em breve</span>
            </div>
          </div>
        </>
      )}

      {/* Como funciona */}
      <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-card)', marginTop: 20 }}>
        <h3 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: 'var(--ocean)', marginBottom: 14 }}>
          Como funciona o pagamento?
        </h3>
        {[
          { icon: '📱', text: 'Cliente escaneia o QR do guarda-sol' },
          { icon: '🛒', text: 'Faz o pedido e escolhe a forma de pagamento' },
          { icon: '💰', text: 'Paga via PIX ou cartão com sua conta conectada' },
          { icon: '🏖️', text: 'O dinheiro vai direto para sua conta MercadoPago' },
          { icon: '👨‍🍳', text: 'Cozinha recebe o pedido em tempo real' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 4 ? '1px solid #F1F5F9' : 'none' }}>
            <span style={{ fontSize: 22, width: 32, textAlign: 'center', flexShrink: 0 }}>{s.icon}</span>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{s.text}</span>
          </div>
        ))}
      </div>

      {/* Modal desconexão */}
      {confirmRemove && (
        <div className="modal-overlay open" onClick={() => setConfirmRemove(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
              <div className="modal-title" style={{ textAlign: 'center' }}>Desconectar conta?</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                O quiosque não poderá receber pagamentos digitais até reconectar.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button onClick={() => setConfirmRemove(false)} style={{ background: 'var(--surface)', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: "'Baloo 2',cursive" }}>
                  Cancelar
                </button>
                <button onClick={handleDesconectar} style={{ background: '#FF6B6B', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', color: 'white', fontFamily: "'Baloo 2',cursive" }}>
                  🔌 Desconectar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
