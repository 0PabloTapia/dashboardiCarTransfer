import { useEffect, useMemo, useState } from 'react'
import { getCurrentOrgId, getOrgs, setCurrentOrgId } from '../mock/api'
import { resetDB } from '../mock/storage'
import type { B2BOrg } from '../types'
import { Button, Layout, Select, Space, Typography, message } from 'antd'

export function TopBar() {
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
    <Layout.Header className="antTopbar">
      <div className="antTopbar__left">
        <Typography.Title level={5} className="antTopbar__title">
          Plataforma B2B de Contratos Digitales
        </Typography.Title>
        <Typography.Text type="secondary" className="antTopbar__sub">
          Mock sin backend · Validación de identidad/registro simulada
        </Typography.Text>
      </div>

      <Space size={12} align="end">
        <div className="antTopbar__field">
          <Typography.Text type="secondary" className="antTopbar__label">
            Cliente B2B
          </Typography.Text>
          <Select
            value={orgId}
            style={{ width: 240 }}
            options={orgs.map((o) => ({ value: o.id, label: o.name }))}
            onChange={async (next) => {
              setOrgId(next)
              await setCurrentOrgId(next)
              message.info(`Cliente cambiado: ${orgs.find((x) => x.id === next)?.name ?? ''}`)
            }}
          />
        </div>

        <Button
          onClick={() => {
            resetDB()
            window.location.reload()
          }}
        >
          Reset mock
        </Button>

        <div className="antTopbar__pill" title={currentOrg?.name ?? ''}>
          {currentOrg?.name ?? '—'}
        </div>
      </Space>
    </Layout.Header>
  )
}

