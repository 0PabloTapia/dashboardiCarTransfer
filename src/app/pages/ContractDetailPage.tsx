import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getContract, signContract, validateWithRegistry } from '../mock/api'
import type { Contract } from '../types'
import { Badge, Button, Card, TextLink } from '../ui/components'
import { useToast } from '../ui/toast'
import { fmtDate, statusLabel, statusTone } from '../utils/format'

export function ContractDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const [c, setC] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (!id) return
        setLoading(true)
        const next = await getContract(id)
        if (!alive) return
        setC(next)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [id])

  const canValidate = c && (c.status === 'VALIDATION_PENDING' || c.registryValidation.status === 'FAIL')
  const canSign = c && c.status === 'VALIDATED'

  const registryBadge = useMemo(() => {
    if (!c) return null
    const s = c.registryValidation.status
    if (s === 'OK') return <Badge tone="green">Registro Civil: OK</Badge>
    if (s === 'FAIL') return <Badge tone="red">Registro Civil: Error</Badge>
    if (s === 'IN_PROGRESS') return <Badge tone="yellow">Registro Civil: Validando…</Badge>
    return <Badge tone="gray">Registro Civil: Sin ejecutar</Badge>
  }, [c])

  if (!id) return null

  return (
    <div className="stack">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Detalle de contrato</h1>
          <p className="muted mono">{id}</p>
        </div>
        <div className="row">
          <TextLink to="/contracts">Volver</TextLink>
          <Button
            tone="neutral"
            type="button"
            onClick={() => {
              if (!c) return
              const content = [
                `Contrato ${c.id}`,
                `Estado: ${statusLabel(c.status)}`,
                `Vehículo: ${c.vehicle.brand} ${c.vehicle.model} ${c.vehicle.year} (${c.vehicle.plate})`,
                `VIN: ${c.vehicle.vin}`,
                `Vendedor: ${c.seller.name} (${c.seller.rut})`,
                `Comprador: ${c.buyer.name} (${c.buyer.rut})`,
                `Validación RC: ${c.registryValidation.status} ${c.registryValidation.summary ?? ''}`,
                `Firma: ${c.signing.status} ${c.signing.method ?? ''}`,
              ].join('\n')
              const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `contrato-${c.id}.txt`
              a.click()
              URL.revokeObjectURL(url)
              toast.push({ tone: 'success', title: 'Descarga iniciada', message: 'Archivo mock (TXT).' })
            }}
          >
            Descargar (mock)
          </Button>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="muted">Cargando...</div>
        ) : !c ? (
          <div className="muted">
            No encontrado. <button className="textLink" onClick={() => nav('/contracts')}>Volver</button>
          </div>
        ) : (
          <div className="stack">
            <div className="row row--spread">
              <div className="row">
                <Badge tone={statusTone(c.status)}>{statusLabel(c.status)}</Badge>
                {registryBadge}
              </div>
              <div className="muted">Actualizado: {fmtDate(c.updatedAt)}</div>
            </div>

            <div className="grid grid--2">
              <div>
                <div className="h2">Vehículo</div>
                <div className="kv">
                  <div className="kv__k">Patente</div>
                  <div className="kv__v mono">{c.vehicle.plate}</div>
                  <div className="kv__k">VIN</div>
                  <div className="kv__v mono">{c.vehicle.vin}</div>
                  <div className="kv__k">Modelo</div>
                  <div className="kv__v">
                    {c.vehicle.brand} {c.vehicle.model} · {c.vehicle.year}
                  </div>
                </div>
              </div>

              <div>
                <div className="h2">Partes</div>
                <div className="kv">
                  <div className="kv__k">Vendedor</div>
                  <div className="kv__v">{c.seller.name}</div>
                  <div className="kv__k">RUT</div>
                  <div className="kv__v mono">{c.seller.rut}</div>
                  <div className="kv__k">Comprador</div>
                  <div className="kv__v">{c.buyer.name}</div>
                  <div className="kv__k">RUT</div>
                  <div className="kv__v mono">{c.buyer.rut}</div>
                </div>
              </div>
            </div>

            <div className="row">
              <Button
                type="button"
                disabled={!canValidate || busy}
                onClick={async () => {
                  if (!c) return
                  setBusy(true)
                  try {
                    toast.push({ tone: 'info', title: 'Validando…', message: 'Simulando Registro Civil' })
                    const updated = await validateWithRegistry(c.id)
                    setC(updated)
                    toast.push({
                      tone: updated.registryValidation.status === 'OK' ? 'success' : 'error',
                      title: updated.registryValidation.status === 'OK' ? 'Validación OK' : 'Validación rechazada',
                      message: updated.registryValidation.summary,
                    })
                  } catch (e: any) {
                    toast.push({ tone: 'error', title: 'Error', message: String(e?.message ?? e) })
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Validar con Registro Civil
              </Button>

              <Button
                tone="neutral"
                type="button"
                disabled={!canSign || busy}
                onClick={async () => {
                  if (!c) return
                  setBusy(true)
                  try {
                    const updated = await signContract(c.id, 'ADVANCED_E-SIGN')
                    setC(updated)
                    toast.push({ tone: 'success', title: 'Contrato firmado', message: 'Firma electrónica avanzada (mock).' })
                  } catch (e: any) {
                    toast.push({ tone: 'error', title: 'Error', message: String(e?.message ?? e) })
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Firmar (mock)
              </Button>
            </div>

            <div>
              <div className="h2">Trazabilidad</div>
              <div className="timeline">
                {c.audit.map((e) => (
                  <div key={e.id} className="timeline__item">
                    <div className="timeline__dot" />
                    <div className="timeline__body">
                      <div className="timeline__top">
                        <div className="timeline__actor">{e.actor}</div>
                        <div className="muted">{fmtDate(e.at)}</div>
                      </div>
                      <div>{e.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

