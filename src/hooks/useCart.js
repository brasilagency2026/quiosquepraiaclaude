import { useState, useCallback } from 'react'

export function useCart() {
  const [cart, setCart] = useState([])

  const addItem = useCallback((item, qty = 1, obs = '') => {
    setCart(prev => {
      const existing = prev.find(c => c._id === item._id && c.obs === obs)
      if (existing) {
        return prev.map(c =>
          c._id === item._id && c.obs === obs
            ? { ...c, qty: c.qty + qty }
            : c
        )
      }
      return [...prev, { ...item, qty, obs }]
    })
  }, [])

  const removeItem = useCallback((itemId, obs = '') => {
    setCart(prev => prev.filter(c => !(c._id === itemId && c.obs === obs)))
  }, [])

  const changeQty = useCallback((itemId, obs, delta) => {
    setCart(prev => prev
      .map(c => c._id === itemId && c.obs === obs
        ? { ...c, qty: c.qty + delta }
        : c
      )
      .filter(c => c.qty > 0)
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const total = cart.reduce((s, i) => s + i.prix * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  return { cart, addItem, removeItem, changeQty, clearCart, total, count }
}
