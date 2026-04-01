import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Localização PT-BR para Clerk
const ptBR = {
  locale: 'pt-BR',
  socialButtonsBlockButton: 'Continuar com {{provider|titleize}}',
  dividerText: 'ou',
  formFieldLabel__emailAddress: 'Endereço de email',
  formFieldLabel__password: 'Senha',
  formFieldLabel__firstName: 'Nome',
  formFieldLabel__lastName: 'Sobrenome',
  formFieldInputPlaceholder__emailAddress: 'seu@email.com',
  formFieldInputPlaceholder__password: 'Sua senha',
  formButtonPrimary: 'Continuar',
  signIn__subtitle: 'para continuar em Quiosque Praia',
  signUp__subtitle: 'para começar em Quiosque Praia',
  backButton: 'Voltar',
  footerActionLink__useAnotherMethod: 'Usar outro método',
  badge__primary: 'Principal',
  badge__thisDevice: 'Este dispositivo',
  badge__unverified: 'Não verificado',
  formFieldAction__forgotPassword: 'Esqueceu a senha?',
  footerActionText__useAnotherMethod: 'Usar outro método de login',
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey} localization={ptBR}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </React.StrictMode>
)
