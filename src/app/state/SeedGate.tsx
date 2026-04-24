import { useEffect, useState } from 'react'
import { ensureSeeded } from '../mock/api'

export function SeedGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ensureSeeded()
    setReady(true)
  }, [])

  if (!ready) return null
  return <>{children}</>
}

