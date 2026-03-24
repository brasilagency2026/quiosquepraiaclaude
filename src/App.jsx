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
        <Route path="/" element={<Navigate to="/scan" />} />
        <Route path="/scan" element={<ScanQR />} />
        <Route path="/:slug/:parasol" element={<Menu />} />
        <Route path="/menu/:slug" element={<MenuVitrine />} />
        <Route path="/login/:slug" element={<LoginPIN />} />
        <Route path="/cozinha/:slug" element={<Cozinha />} />
        <Route path="/garcom/:slug" element={<Garcom />} />
        <Route path="/caixa/:slug" element={<Caixa />} />
        <Route path="/admin/:slug/login" element={<LoginGestor />} />
        <Route path="/admin/:slug" element={<Admin />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="*" element={<Navigate to="/scan" />} />
      </Routes>
    </ToastProvider>
  )
}
