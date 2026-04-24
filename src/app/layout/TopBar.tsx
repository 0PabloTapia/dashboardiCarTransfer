import { useEffect, useMemo, useState } from 'react'
import { getCurrentOrgId, getOrgs, setCurrentOrgId } from '../mock/api'
import { resetDB } from '../mock/storage'
import type { B2BOrg } from '../types'
import { Button, Select } from '../ui/components'
import { useToast } from '../ui/toast'

export function TopBar() {
  const toast = useToast()
  const [orgs, setOrgs] = useState<B2BOrg[]>([])
  const [orgId, setOrgId] = useState<string>('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [o, current] = await Promise.all([getOrgs(), getCurrentOrgId()])
      if (!alive) return
      setOrgs(o)
      setOrgId(current)
    })()
    return () => {
      alive = false
    }
  }, [])

  const currentOrg = useMemo(() => orgs.find((o) => o.id === orgId), [orgId, orgs])

  return (
    <header className="topBar">
      <div className="topBar__left">
        <div className="topBar__title">Plataforma B2B de Transferencia Digital</div>
        <div className="topBar__subtitle">Mock sin backend · Integración “Registro Civil” simulada</div>
      </div>

      <div className="topBar__right">
        <div className="fieldRow">
          <label className="label" htmlFor="org">
            Cliente B2B
          </label>
          <Select
            id="org"
            value={orgId}
            onChange={async (e) => {
              const next = e.target.value
              setOrgId(next)
              await setCurrentOrgId(next)
              toast.push({ tone: 'info', title: 'Cliente cambiado', message: orgs.find((x) => x.id === next)?.name })
            }}
          >
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        </div>

        <Button
          tone="neutral"
          type="button"
          onClick={() => {
            resetDB()
            window.location.reload()
          }}
          aria-label="Resetear datos mock"
        >
          Reset mock
        </Button>
        <div className="topBar__orgPill" title={currentOrg?.name ?? ''}>
          {currentOrg?.name ?? '—'}
        </div>
      </div>
    </header>
  )
}

