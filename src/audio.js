// Short edits of real CC0 field recordings. Source IDs and license are in README.md.
const clips = {
  tape:'tape', box:'box', pick:'bag', put:'box', paper:'paper',
  bracelet:'jewelry', pen:'paper', book:'paper', dates:'box', roti:'lid',
  khaomao:'leaf', redsnack:'wrapper', berries:'wrapper', chime:'jewelry',
  fish:'lid', case:'lid', ticket:'paper', controller:'lid', listening:'jewelry',
}
const cache = new Map()
const active = new Set()

export function playSound(name) {
  const clip = clips[name]
  if (!clip) return
  try {
    const base = cache.get(clip) ?? new Audio(`${import.meta.env.BASE_URL}foley/${clip}.mp3`)
    if (!cache.has(clip)) { base.preload = 'auto'; cache.set(clip, base) }
    const voice = base.cloneNode()
    voice.volume = name === 'chime' ? .27 : .62
    active.add(voice)
    const release = () => active.delete(voice)
    voice.addEventListener('ended', release, { once: true })
    voice.addEventListener('error', release, { once: true })
    voice.play().catch(release)
  } catch { /* Sound is optional; controls remain usable. */ }
}
