import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ScanQR from './screens/ScanQR'
import Landing from './screens/Landing'
import DemoChoix from './screens/DemoChoix'
import DemoCliente from './screens/DemoCliente'
import DemoGestor from './screens/DemoGestor'
import DemoLoginEquipe from './screens/DemoLoginEquipe'
import DemoCozinha from './screens/DemoCozinha'
import DemoGarcom from './screens/DemoGarcom'
import Menu from './screens/Menu'
import MenuVitrine from './screens/MenuVitrine'
import Cozinha from './screens/Cozinha'
import Garcom from './screens/Garcom'
import Caixa from './screens/Caixa'
import Admin from './screens/Admin'
import SuperAdmin from './screens/SuperAdmin'
import LoginPIN from './screens/LoginPIN'
import LoginGestor from './screens/LoginGestor'
import Inscricao from './screens/Inscricao'
import ConfirmadoRetorno from './screens/ConfirmadoRetorno'
import QuemSomos from './screens/QuemSomos'
import Toast from './components/Toast'
import { ToastProvider } from './context/ToastContext'

export default function App() {
  return (
    <ToastProvider>
      <Toast />
      <Routes>
        {/* Cliente — via QR code */}
        <Route path="/" element={<Landing />} />
        <Route path="/quem-somos" element={<QuemSomos />} />
        <Route path="/scan" element={<ScanQR />} />
        <Route path="/demo" element={<DemoChoix />} />
        <Route path="/demo/cliente" element={<DemoCliente />} />
        <Route path="/demo/gestor" element={<DemoGestor />} />
        <Route path="/demo/equipe" element={<DemoLoginEquipe />} />
        <Route path="/demo/cozinha" element={<DemoCozinha />} />
        <Route path="/demo/garcom" element={<DemoGarcom />} />
        <Route path="/:slug/:parasol" element={<Menu />} />

        {/* Staff — login PIN */}
        <Route path="/login/:slug" element={<LoginPIN />} />

        {/* Staff — écrans protégés */}
        <Route path="/cozinha/:slug" element={<Cozinha />} />
        <Route path="/garcom/:slug" element={<Garcom />} />

        {/* Cardápio vitrine */}
        <Route path="/menu/:slug" element={<MenuVitrine />} />

        {/* Staff */}
        <Route path="/caixa/:slug" element={<Caixa />} />

        {/* Gestor */}
        <Route path="/admin/:slug/login" element={<LoginGestor />} />
        <Route path="/admin/:slug" element={<Admin />} />

        {/* Inscrição */}
        <Route path="/inscricao" element={<Inscricao />} />
        <Route path="/inscricao/sucesso" element={<Inscricao />} />

        {/* Retour MercadoPago / Stripe */}
        <Route path="/confirmado" element={<ConfirmadoRetorno />} />

        {/* Super Admin */}
        <Route path="/superadmin" element={<SuperAdmin />} />

        {/* OAuth redirects — MP callback redirige vers admin */}
        <Route path="/oauth/mp/success" element={<Navigate to="/scan" />} />
        <Route path="/oauth/mp/error" element={<Navigate to="/scan" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/scan" />} />
      </Routes>
    </ToastProvider>
  )
}
