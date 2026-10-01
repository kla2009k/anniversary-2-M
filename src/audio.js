// Original 48 kHz stereo close-mic-style Foley, rendered in tools/generate_sfx.py.
// Audio objects are created lazily after a click, so mobile browsers permit playback.
const names = new Set(['tape','box','pick','put','paper','bracelet','pen','book','dates','roti','khaomao','redsnack','berries','chime'])
const cache = new Map()

export function playSound(name) {
  if (!names.has(name)) return
  try {
    const base = cache.get(name) ?? new Audio(`${import.meta.env.BASE_URL}sfx/${name}.wav`)
    if (!cache.has(name)) { base.preload = 'auto'; cache.set(name, base) }
    const voice = base.cloneNode()
    voice.volume = name === 'chime' ? .34 : .52
    voice.play().catch(() => {})
  } catch { /* Audio is optional; the game remains fully playable. */ }
}
