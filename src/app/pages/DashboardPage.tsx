import { useEffect, useMemo, useState } from 'react'
import { listContracts } from '../mock/api'
import type { Contract } from '../types'
import { Badge, Card, LinkButton, RowLink, TextLink } from '../ui/components'
import { fmtDate, statusLabel, statusTone } from '../utils/format'

export function DashboardPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const items = await listContracts()
      if (!alive) return
      setContracts(items)
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  const kpis = useMemo(() => {
    const total = contracts.length
    const signed = contracts.filter((c) => c.status === 'SIGNED').length
    const pending = contracts.filter((c) => c.status === 'VALIDATION_PENDING').length
    const rejected = contracts.filter((c) => c.status === 'REJECTED').length
    return { total, signed, pending, rejected }
  }, [contracts])

  const recent = contracts.slice(0, 5)

  return (
    <div className="stack">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Dashboard</h1>
          <p className="muted">
            Flujo principal: crear transferencia → validar con Registro Civil (mock) → firmar contrato.
          </p>
        </div>
        <div className="row">
          <TextLink to="/contracts">Ver contratos</TextLink>
          <LinkButton to="/new-transfer">Nueva transferencia</LinkButton>
        </div>
      </div>

      <div className="grid grid--4">
        <Card>
          <div className="kpi">
            <div className="kpi__label">Contratos</div>
            <div className="kpi__value">{kpis.total}</div>
          </div>
        </Card>
        <Card>
          <div className="kpi">
            <div className="kpi__label">Firmados</div>
            <div className="kpi__value">{kpis.signed}</div>
          </div>
        </Card>
        <Card>
          <div className="kpi">
            <div className="kpi__label">Pendientes validación</div>
            <div className="kpi__value">{kpis.pending}</div>
          </div>
        </Card>
        <Card>
          <div className="kpi">
            <div className="kpi__label">Rechazados</div>
            <div className="kpi__value">{kpis.rejected}</div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="cardHeader">
          <div>
            <div className="h2">Actividad reciente</div>
            <div className="muted">Últimos contratos actualizados</div>
          </div>
          <TextLink to="/contracts">Abrir listado</TextLink>
        </div>

        {loading ? (
          <div className="muted">Cargando...</div>
        ) : recent.length === 0 ? (
          <div className="muted">No hay contratos.</div>
        ) : (
          <div className="table">
            <div className="table__row table__head">
              <div>ID</div>
              <div>Patente</div>
              <div>Comprador</div>
              <div>Estado</div>
              <div>Actualizado</div>
            </div>
            {recent.map((c) => (
              <RowLink key={c.id} to={`/contracts/${c.id}`}>
                <div className="mono">{c.id.slice(0, 10)}…</div>
                <div>{c.vehicle.plate}</div>
                <div className="truncate">{c.buyer.name}</div>
                <div>
                  <Badge tone={statusTone(c.status)}>{statusLabel(c.status)}</Badge>
                </div>
                <div className="muted">{fmtDate(c.updatedAt)}</div>
              </RowLink>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

