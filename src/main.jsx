import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { BrowserRouter } from 'react-router-dom'
import { ptBR } from '@clerk/localizations'
import App from './App'
import './styles/global.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// PT-BR officiel + surcharges manquantes
const localization = {
  ...ptBR,
  unstable__errors: {
    ...ptBR.unstable__errors,
    passwordBreached: 'Esta senha foi encontrada em vazamentos de dados. Por segurança, escolha uma senha diferente.',
    passwordTooShort: 'A senha deve ter pelo menos {{length}} caracteres.',
    passwordTooLong: 'A senha deve ter no máximo {{length}} caracteres.',
    passwordNoUppercase: 'A senha deve conter pelo menos uma letra maiúscula.',
    passwordNoLowercase: 'A senha deve conter pelo menos uma letra minúscula.',
    passwordNoNumber: 'A senha deve conter pelo menos um número.',
    passwordNoSpecialChar: 'A senha deve conter pelo menos um caractere especial.',
    passwordBreached: 'Esta senha foi encontrada em vazamentos de dados. Por segurança, escolha uma senha diferente.',
},
  formFieldError__notMatchingPasswords: 'As senhas não conferem.',
  formFieldError__matchingPasswords: 'As senhas conferem.',
  formFieldInputPlaceholder__password: 'Sua senha',
  formFieldInputPlaceholder__newPassword: 'Nova senha',
  formFieldInputPlaceholder__confirmPassword: 'Confirme a senha',
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   const localization = {
  ...ptBR,
  unstable__errors: {
    ...ptBR.unstable__errors,
    passwordBreached: 'Esta senha foi encontrada em vazamentos de dados. Por segurança, escolha uma senha diferente.',
  },
}
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </React.StrictMode>
)
