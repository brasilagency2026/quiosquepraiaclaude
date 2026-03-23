import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  let timer = null

  const showToast = useCallback((msg) => {
    setMessage(msg)
    setVisible(true)
    clearTimeout(timer)
    timer = setTimeout(() => setVisible(false), 2800)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, message, visible }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
