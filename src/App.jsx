import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ScanQR from './screens/ScanQR'
import Menu from './screens/Menu'
import MenuVitrine from './screens/MenuVitrine'
import Cozinha from './screens/Cozinha'
import Garcom from './screens/Garcom'
import Caixa from './screens/Caixa'
import Admin from './screens/Admin'
import SuperAdmin from './screens/SuperAdmin'
import LoginPIN from './screens/LoginPIN'
import LoginGestor from './screens/LoginGestor'
import Toast from './components/Toast'
import { ToastProvider } from './context/ToastContext'

export default function App() {
  return (
    <ToastProvider>
      <Toast />
      <Routes>
        {/* Cliente — via QR code */}
        <Route path="/" element={<Navigate to="/scan" />} />
        <Route path="/scan" element={<ScanQR />} />
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
