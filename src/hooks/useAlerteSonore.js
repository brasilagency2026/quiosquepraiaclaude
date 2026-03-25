import { useEffect, useRef, useCallback } from 'react'

// Sons différents selon le panel
const SONS = {
  cozinha: { freqs: [880, 1100], duree: 0.12, volume: 0.4, repetitions: 2 },    // Bip aigu double — urgence cuisine
  garcom:  { freqs: [660, 880],  duree: 0.15, volume: 0.35, repetitions: 2 },   // Bip moyen double — livraison prête
  caixa:   { freqs: [440, 550],  duree: 0.2,  volume: 0.3,  repetitions: 1 },   // Bip grave simple — nouveau paiement
  admin:   { freqs: [330, 440],  duree: 0.18, volume: 0.25, repetitions: 1 },   // Bip doux — notification
}

function jouerBip(config) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    config.freqs.forEach((freq, i) => {
      for (let r = 0; r < config.repetitions; r++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.type = 'sine'
        osc.frequency.value = freq

        const startTime = ctx.currentTime + i * (config.duree + 0.05) + r * (config.duree * config.freqs.length + 0.15)
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(config.volume, startTime + 0.01)
        gain.gain.linearRampToValueAtTime(0, startTime + config.duree)

        osc.start(startTime)
        osc.stop(startTime + config.duree + 0.01)
      }
    })

    // Fermer le contexte après la dernière note
    const totalDuree = config.repetitions * (config.freqs.length * (config.duree + 0.05) + 0.15)
    setTimeout(() => ctx.close(), totalDuree * 1000 + 500)
  } catch (e) {
    // Web Audio non supporté — silencieux
    console.warn('Web Audio API non disponible')
  }
}

/**
 * Hook d'alerte sonore pour les panels temps réel
 * 
 * @param {Array} items - La liste d'items à surveiller (pedidos, notifications...)
 * @param {string} panel - 'cozinha' | 'garcom' | 'caixa' | 'admin'
 * @param {function} filter - Optionnel: filtre les items qui déclenchent l'alerte
 * 
 * Usage:
 *   useAlerteSonore(pedidos, 'cozinha')
 *   useAlerteSonore(notifs, 'admin', n => !n.lue)
 */
export function useAlerteSonore(items, panel, filter = null) {
  const prevCountRef = useRef(null)
  const activatedRef = useRef(false) // évite l'alerte au premier chargement

  const jouer = useCallback(() => {
    const config = SONS[panel] ?? SONS.admin
    jouerBip(config)
  }, [panel])

  useEffect(() => {
    if (items === undefined || items === null) return

    const filtered = filter ? items.filter(filter) : items
    const count = filtered.length

    if (prevCountRef.current === null) {
      // Premier chargement — on enregistre le compte sans jouer
      prevCountRef.current = count
      activatedRef.current = true
      return
    }

    if (activatedRef.current && count > prevCountRef.current) {
      jouer()
    }

    prevCountRef.current = count
  }, [items, filter, jouer])
}

/**
 * Bouton pour tester/activer le son (nécessaire sur mobile pour débloquer l'AudioContext)
 * À afficher la première fois dans chaque panel
 */
export function useSonActif() {
  const activatedRef = useRef(false)

  const activer = useCallback(() => {
    if (activatedRef.current) return
    // Joue un son silencieux pour débloquer l'AudioContext sur mobile
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      gain.gain.value = 0.001
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
      setTimeout(() => ctx.close(), 200)
      activatedRef.current = true
    } catch (e) {}
  }, [])

  return { activer, actif: activatedRef.current }
}
