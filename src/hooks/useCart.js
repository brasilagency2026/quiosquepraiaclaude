import { useState, useCallback } from 'react'

export function useCart() {
  const [cart, setCart] = useState([])

  const addItem = useCallback((item, qty = 1, obs = '', variacao = null) => {
    setCart(prev => {
      // Clé unique = item + obs + variacao
      const key = v => `${v._id}|${v.obs}|${v.variacaoNom}`
      const newEntry = {
        ...item,
        qty,
        obs,
        variacaoNom: variacao?.nom || null,
        variacaoPrix: variacao?.prix || null,
        // Prix effectif = variacao ou prix de base
        prixEffectif: variacao ? variacao.prix : item.prix,
      }
      const existing = prev.find(c => key(c) === key(newEntry))
      if (existing) {
        return prev.map(c => key(c) === key(newEntry) ? { ...c, qty: c.qty + qty } : c)
      }
      return [...prev, newEntry]
    })
  }, [])

  const removeItem = useCallback((itemId, obs = '', variacaoNom = null) => {
    setCart(prev => prev.filter(c => !(c._id === itemId && c.obs === obs && c.variacaoNom === variacaoNom)))
  }, [])

  const changeQty = useCallback((itemId, obs, delta, variacaoNom = null) => {
    setCart(prev => prev
      .map(c => c._id === itemId && c.obs === obs && c.variacaoNom === variacaoNom
        ? { ...c, qty: c.qty + delta }
        : c
      )
      .filter(c => c.qty > 0)
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const total = cart.reduce((s, i) => s + (i.prixEffectif ?? i.prix) * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  return { cart, addItem, removeItem, changeQty, clearCart, total, count }
}
