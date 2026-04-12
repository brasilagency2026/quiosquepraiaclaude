import { useSearchParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import Confirmado from './Confirmado'

export default function ConfirmadoRetorno() {
  const [params] = useSearchParams()
  const externalRef = params.get('external_reference')
  const status = params.get('status') || params.get('collection_status')

  const pedido = useQuery(
    api.pedidos.acompanharPedido,
    externalRef ? { pedidoId: externalRef } : 'skip'
  )

  if (!externalRef) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D2137', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: "'Baloo 2',cursive", textAlign: 'center', padding: 24 }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 22, color: '#F5E6C8' }}>Referência não encontrada</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Não foi possível identificar o pedido.</p>
        </div>
      </div>
    )
  }

  if (pedido === undefined) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D2137', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12, animation: 'spin 1s linear infinite' }}>⏳</div>
          <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: 18, color: '#F5E6C8' }}>Carregando pedido...</p>
          <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
        </div>
      </div>
    )
  }

  if (pedido === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D2137', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: "'Baloo 2',cursive", textAlign: 'center', padding: 24 }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 22, color: '#F5E6C8' }}>Pedido não encontrado</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>O pedido pode ter expirado ou sido removido.</p>
        </div>
      </div>
    )
  }

  return (
    <Confirmado
      pedidoId={externalRef}
      numero={pedido.numero}
      onNewOrder={() => { window.location.href = '/' }}
    />
  )
}
