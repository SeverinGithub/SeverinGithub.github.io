import { useEffect, useState } from 'react'

// Hash routing keeps GitHub Pages happy (no server rewrites).
export function go(path: string) {
  window.location.hash = path
}

export function useRoute() {
  const read = () => {
    const raw = window.location.hash.replace(/^#/, '') || '/learn'
    const [pathAndQuery, anchor] = raw.split('#')
    const [path, query = ''] = pathAndQuery.split('?')
    return { path, parts: path.split('/').filter(Boolean), query: new URLSearchParams(query), anchor }
  }
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}
