import { useState } from 'react'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useToast } from '../context/ToastContext'

export default function AdminPagamento({ kiosque }) {
  const { showToast } = useToast()
  const [provider, setProvider] = useState('mercadopago')
  const [form, setForm] = useState({ publicKey: '', secretKey: '' })
  const [showKeys, setShowKeys] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const config = useQuery(api.pagamentos.getConfigGestor)
  const configurarMP = useMutation(api.pagamentos.configurarMercadoPago)
  const configurarStripe = useMutation(api.pagamentos.configurarStripe)
  const remover = useMutation(api.pagamentos.removerConfigPagamento)
  const testar = useAction(api.pagamentos.testarConexao)

  const isConfigured = config?.configurado
  const currentProvider = config?.provider

  async function salvar() {
    if (!form.publicKey.trim() || !form.secretKey.trim()) {
      showToast('⚠️ Preencha as duas chaves'); return
    }
    setSaving(true)
    try {
      if (provider === 'mercadopago') {
        await configurarMP({
          mp_public_key: form.publicKey.trim(),
          mp_access_token: form.secretKey.trim(),
        })
      } else {
        await configurarStripe({
          stripe_publishable_key: form.publicKey.trim(),
          stripe_secret_key: form.secretKey.trim(),
        })
      }
      showToast('🔐 Credenciais salvas com segurança!')
      setForm({ publicKey: '', secretKey: '' })
      setShowKeys(false)
    } catch (e) {
      showToast('❌ ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function testarConexao() {
    setTesting(true)
    try {
      const result = await testar({})
      if (result.ok) {
        showToast(`✅ Conectado! Conta: ${result.nome || result.email}`)
      } else {
        showToast('❌ ' + (result.error || 'Credenciais inválidas'))
      }
    } catch (e) {
      showToast('❌ Erro de conexão')
    } finally {
      setTesting(false)
    }
  }

  async function handleRemover() {
    try {
      await remover({})
      showToast('🗑️ Configuração de pagamento removida')
      setConfirmRemove(false)
    } catch (e) {
      showToast('❌ ' + e.message)
    }
  }

  const PROVIDERS = [
    {
      id: 'mercadopago',
      flag: '🇧🇷',
      label: 'MercadoPago',
      desc: 'PIX · Cartão · Boleto',
      color: '#009EE3',
      pubLabel: 'Public Key',
      pubPlaceholder: 'APP_USR-xxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx',
      secLabel: 'Access Token',
      secPlaceholder: 'APP_USR-xxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx',
      guide: [
        'Acessar mercadopago.com.br',
        'Menu → Seu negócio → Credenciais',
        'Escolher: Produção ou Testes',
        'Copiar Public key e Access token',
      ],
      docsUrl: 'https://www.mercadopago.com.br/developers/pt/docs/getting-started',
    },
    {
      id: 'stripe',
      flag: '🌎',
      label: 'Stripe',
      desc: 'Cartão · Internacional',
      color: '#635BFF',
      pubLabel: 'Publishable Key',
      pubPlaceholder: 'sua-chave-publica-stripe-aqui',
      secLabel: 'Secret Key',
      secPlaceholder: 'sua-chave-secreta-stripe-aqui',
      guide: [
        'Acessar dashboard.stripe.com',
        'Developers → API Keys',
        'Copiar Publishable key e Secret key',
        'Para PIX no Brasil: ativar em Payment methods',
      ],
      docsUrl: 'https://stripe.com/docs/keys',
    },
  ]

  const selectedProvider = PROVIDERS.find(p => p.id === provider)

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* ── STATUS ATUAL ─────────────────────────────── */}
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
            {isConfigured ? `✅ Configurado` : '❌ Não configurado'}
          </span>
        </div>

        {isConfigured ? (
          <>
            {/* Provider badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface)', borderRadius: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 32 }}>
                {currentProvider === 'mercadopago' ? '🇧🇷' : '🌎'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: 'var(--ocean)' }}>
                  {currentProvider === 'mercadopago' ? 'MercadoPago' : 'Stripe'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Chave pública: <code style={{ fontSize: 11, background: 'white', padding: '1px 6px', borderRadius: 4 }}>{config?.publicKeyMask}</code>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Chave secreta: <code style={{ fontSize: 11, background: 'white', padding: '1px 6px', borderRadius: 4 }}>🔒 {config?.secretKeyMask}</code>
                </div>
                {config?.testadoEm && (
                  <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>
                    ✅ Testado em {new Date(config.testadoEm).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={testarConexao} disabled={testing} style={{
                flex: 1, background: 'var(--surface)', border: '1.5px solid var(--border)',
                borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600,
                cursor: testing ? 'not-allowed' : 'pointer', color: 'var(--ocean)',
                fontFamily: 'Inter,sans-serif', transition: 'all 0.2s',
                opacity: testing ? 0.6 : 1
              }}>
                {testing ? '⏳ Testando...' : '🔌 Testar Conexão'}
              </button>
              <button onClick={() => setShowKeys(true)} style={{
                flex: 1, background: 'var(--surface)', border: '1.5px solid var(--border)',
                borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', color: 'var(--ocean)', fontFamily: 'Inter,sans-serif'
              }}>
                ✏️ Atualizar Chaves
              </button>
              <button onClick={() => setConfirmRemove(true)} style={{
                background: '#FEE2E2', border: '1.5px solid #FECACA',
                borderRadius: 10, padding: '10px 14px', fontSize: 16,
                cursor: 'pointer', color: '#DC2626'
              }}>
                🗑️
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              Configure seu provedor de pagamento para começar a receber pedidos.
              O dinheiro vai diretamente para sua conta.
            </p>
            <button onClick={() => setShowKeys(true)} className="btn-primary" style={{ maxWidth: 280 }}>
              ⚙️ Configurar Agora
            </button>
          </div>
        )}
      </div>

      {/* ── SEGURANÇA INFO ───────────────────────────── */}
      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: 16, marginBottom: 20, display: 'flex', gap: 12 }}>
        <div style={{ fontSize: 24, flexShrink: 0 }}>🔐</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#065F46', marginBottom: 4 }}>
            Suas chaves estão seguras
          </div>
          <div style={{ fontSize: 12, color: '#047857', lineHeight: 1.6 }}>
            As chaves secretas são <strong>criptografadas com AES-256</strong> antes de serem armazenadas.
            Nem o Quiosque Praia tem acesso ao valor original. Só você pode usar estas credenciais.
          </div>
        </div>
      </div>

      {/* ── COMO FUNCIONA ────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow-card)', marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 16, fontWeight: 700, color: 'var(--ocean)', marginBottom: 14 }}>
          Como funciona o pagamento?
        </h3>
        {[
          { icon: '📱', text: 'Cliente escaneia o QR do guarda-sol' },
          { icon: '🛒', text: 'Faz o pedido e escolhe a forma de pagamento' },
          { icon: '💰', text: 'Paga via PIX ou cartão com suas credenciais' },
          { icon: '🏖️', text: 'O dinheiro vai direto para sua conta MercadoPago/Stripe' },
          { icon: '👨‍🍳', text: 'Cozinha recebe o pedido em tempo real' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 4 ? '1px solid #F1F5F9' : 'none' }}>
            <span style={{ fontSize: 22, width: 32, textAlign: 'center', flexShrink: 0 }}>{s.icon}</span>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{s.text}</span>
          </div>
        ))}
      </div>

      {/* ── MODAL CONFIGURAR ─────────────────────────── */}
      {showKeys && (
        <div className="modal-overlay open" onClick={() => !saving && setShowKeys(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '95vh', overflowY: 'auto' }}>
            <div className="modal-handle" />
            <div className="modal-title">
              {isConfigured ? 'Atualizar Credenciais' : 'Configurar Pagamento'}
            </div>

            {/* Escolher provider */}
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Escolha o provedor de pagamento:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {PROVIDERS.map(p => (
                <div key={p.id} onClick={() => setProvider(p.id)} style={{
                  border: `2px solid ${provider === p.id ? p.color : '#E2E8F0'}`,
                  borderRadius: 14, padding: '16px 12px', cursor: 'pointer',
                  textAlign: 'center', transition: 'all 0.2s',
                  background: provider === p.id ? p.color + '11' : 'white'
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{p.flag}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 15, fontWeight: 700, color: 'var(--ocean)', marginBottom: 3 }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.desc}</div>
                </div>
              ))}
            </div>

            {/* Guia */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: 14, marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#1E40AF', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>📋 Como obter as chaves</span>
                <a href={selectedProvider?.docsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: '#3B82F6', textDecoration: 'none' }}>
                  Ver documentação →
                </a>
              </div>
              {selectedProvider?.guide.map((step, i) => (
                <div key={i} style={{ fontSize: 12, color: '#1E3A8A', display: 'flex', gap: 8, marginBottom: 4 }}>
                  <span style={{ background: '#3B82F6', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>

            {/* Formulaire clés */}
            <div className="form-group">
              <label className="form-label">
                {selectedProvider?.pubLabel}
                <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: 10, padding: '2px 8px', borderRadius: 6, marginLeft: 8, fontWeight: 700 }}>PÚBLICA</span>
              </label>
              <input
                className="form-input"
                value={form.publicKey}
                onChange={e => setForm(f => ({ ...f, publicKey: e.target.value }))}
                placeholder={selectedProvider?.pubPlaceholder}
                style={{ fontFamily: 'monospace', fontSize: 12 }}
                autoComplete="off"
              />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Esta chave é visível no frontend — é normal e necessária.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                {selectedProvider?.secLabel}
                <span style={{ background: '#FEE2E2', color: '#991B1B', fontSize: 10, padding: '2px 8px', borderRadius: 6, marginLeft: 8, fontWeight: 700 }}>🔒 SECRETA</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showKeys && form.secretKey && false ? 'text' : 'password'}
                  value={form.secretKey}
                  onChange={e => setForm(f => ({ ...f, secretKey: e.target.value }))}
                  placeholder={selectedProvider?.secPlaceholder}
                  style={{ fontFamily: 'monospace', fontSize: 12, paddingRight: 44 }}
                  autoComplete="new-password"
                />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                🔐 Será criptografada com AES-256 antes de ser armazenada. Nunca será exibida novamente.
              </p>
            </div>

            {/* Warning ambiente */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
              ⚠️ <strong>Atenção:</strong> Use credenciais de <strong>Produção</strong> apenas quando seu quiosque estiver pronto para receber pagamentos reais. Para testes, use as credenciais de <strong>Sandbox/Testes</strong>.
            </div>

            <button className="btn-primary" onClick={salvar} disabled={saving}
              style={{ background: saving ? '#CBD5E0' : 'var(--lime)', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? '⏳ Salvando...' : '🔐 Salvar Credenciais'}
            </button>

            <button onClick={() => setShowKeys(false)} style={{
              width: '100%', background: 'none', border: 'none',
              color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer',
              marginTop: 12, padding: '8px', fontFamily: 'Inter,sans-serif'
            }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMAR REMOÇÃO ───────────────────── */}
      {confirmRemove && (
        <div className="modal-overlay open" onClick={() => setConfirmRemove(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
              <div className="modal-title" style={{ textAlign: 'center' }}>Remover Configuração?</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                As credenciais de pagamento serão removidas permanentemente. O quiosque não poderá receber pagamentos até uma nova configuração.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button onClick={() => setConfirmRemove(false)} style={{ background: 'var(--surface)', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: "'Baloo 2',cursive" }}>
                  Cancelar
                </button>
                <button onClick={handleRemover} style={{ background: '#FF6B6B', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', color: 'white', fontFamily: "'Baloo 2',cursive" }}>
                  🗑️ Remover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
