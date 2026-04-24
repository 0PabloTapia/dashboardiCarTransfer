import { useEffect, useMemo, useState } from 'react'
import { listContracts } from '../mock/api'
import type { Contract, ContractStatus } from '../types'
import { Badge, Card, Input, RowLink, Select, TextLink } from '../ui/components'
import { fmtDate, statusLabel, statusTone } from '../utils/format'

const STATUSES: Array<{ id: ContractStatus | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'Todos' },
  { id: 'VALIDATION_PENDING', label: 'Pendiente validación' },
  { id: 'VALIDATED', label: 'Validado' },
  { id: 'SIGNED', label: 'Firmado' },
  { id: 'REJECTED', label: 'Rechazado' },
  { id: 'DRAFT', label: 'Borrador' },
]

export function ContractsPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<(typeof STATUSES)[number]['id']>('ALL')
  const [items, setItems] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const next = await listContracts({ q, status })
      if (!alive) return
      setItems(next)
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [q, status])

  const summary = useMemo(() => {
    const by = (s: ContractStatus) => items.filter((c) => c.status === s).length
    return { total: items.length, pending: by('VALIDATION_PENDING'), validated: by('VALIDATED'), signed: by('SIGNED') }
  }, [items])

  return (
    <div className="stack">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Contratos</h1>
          <p className="muted">Listado B2B con filtros básicos para detectar fricción en el flujo.</p>
        </div>
        <TextLink to="/new-transfer">Nueva transferencia</TextLink>
      </div>

      <Card>
        <div className="filters">
          <div className="field">
            <label className="label" htmlFor="q">
              Buscar
            </label>
            <Input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Patente, VIN, comprador, vendedor, RUT..."
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="status">
              Estado
            </label>
            <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="filters__meta">
            <div className="muted">
              Total: <span className="mono">{summary.total}</span> · Pendientes:{' '}
              <span className="mono">{summary.pending}</span> · Validados: <span className="mono">{summary.validated}</span>{' '}
              · Firmados: <span className="mono">{summary.signed}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="muted">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="muted">Sin resultados.</div>
        ) : (
          <div className="table">
            <div className="table__row table__head">
              <div>ID</div>
              <div>Vehículo</div>
              <div>Vendedor</div>
              <div>Comprador</div>
              <div>Estado</div>
              <div>Actualizado</div>
            </div>
            {items.map((c) => (
              <RowLink key={c.id} to={`/contracts/${c.id}`}>
                <div className="mono">{c.id.slice(0, 10)}…</div>
                <div className="truncate">
                  <div>{c.vehicle.plate}</div>
                  <div className="muted">{c.vehicle.brand + ' ' + c.vehicle.model + ' · ' + c.vehicle.year}</div>
                </div>
                <div className="truncate">{c.seller.name}</div>
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

