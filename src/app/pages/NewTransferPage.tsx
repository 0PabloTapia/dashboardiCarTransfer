import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTransfer } from '../mock/api'
import type { Party, Vehicle } from '../types'
import { Button, Card, Input } from '../ui/components'
import { useToast } from '../ui/toast'

type StepId = 'vehicle' | 'parties' | 'review' | 'done'

const steps: Array<{ id: StepId; label: string }> = [
  { id: 'vehicle', label: 'Vehículo' },
  { id: 'parties', label: 'Partes' },
  { id: 'review', label: 'Revisión' },
  { id: 'done', label: 'Listo' },
]

function isEmail(v: string) {
  return /\S+@\S+\.\S+/.test(v)
}

export function NewTransferPage() {
  const nav = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState<StepId>('vehicle')
  const [busy, setBusy] = useState(false)

  const [intent, setIntent] = useState<'SELL' | 'BUY'>('SELL')
  const [quick, setQuick] = useState({
    plate: '',
    fullName: '',
    email: '',
  })
  const [started, setStarted] = useState(false)

  const [vehicle, setVehicle] = useState<Vehicle>({
    plate: '',
    vin: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
  })

  const [seller, setSeller] = useState<Party>({ name: '', rut: '', email: '', phone: '' })
  const [buyer, setBuyer] = useState<Party>({ name: '', rut: '', email: '', phone: '' })

  const progress = useMemo(() => steps.findIndex((s) => s.id === step), [step])

  const errors = useMemo(() => {
    const errs: string[] = []
    if (!started) {
      if (!quick.plate.trim()) errs.push('Patente requerida.')
      if (!quick.fullName.trim()) errs.push('Nombre requerido.')
      if (!quick.email.trim() || !isEmail(quick.email)) errs.push('Email inválido.')
      return errs
    }
    if (step === 'vehicle') {
      if (!vehicle.plate.trim()) errs.push('Patente requerida.')
      if (!vehicle.vin.trim()) errs.push('VIN requerido.')
      if (!vehicle.brand.trim()) errs.push('Marca requerida.')
      if (!vehicle.model.trim()) errs.push('Modelo requerido.')
      if (!vehicle.year || vehicle.year < 1980) errs.push('Año inválido.')
    }
    if (step === 'parties') {
      const party = (p: Party, label: string) => {
        if (!p.name.trim()) errs.push(`${label}: nombre requerido.`)
        if (!p.rut.trim()) errs.push(`${label}: RUT requerido.`)
        if (!p.email.trim() || !isEmail(p.email)) errs.push(`${label}: email inválido.`)
      }
      party(seller, 'Vendedor')
      party(buyer, 'Comprador')
    }
    return errs
  }, [buyer, quick.email, quick.fullName, quick.plate, seller, started, step, vehicle])

  const canNext = errors.length === 0

  return (
    <div className="stack">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Nueva transferencia</h1>
          <p className="muted">Wizard simple para validar el flujo con clientes B2B (sin backend).</p>
        </div>
        <div className="row">
          <Button tone="neutral" type="button" onClick={() => nav('/contracts')}>
            Cancelar
          </Button>
        </div>
      </div>

      {!started ? (
        <div className="heroSplit">
          <div className="heroCopy">
            <div className="heroTag">¡Flash sale!</div>
            <div className="heroTitle">
              <span className="heroTitle__accent">Transferencia</span> de vehículo con seguridad garantizada
            </div>
            <div className="heroDesc">
              Sin filas ni riesgos. Transfiere de forma rápida y segura con firma electrónica avanzada y trazabilidad contractual.
            </div>
            <div className="heroPrice">
              por sólo ahora <span className="heroPrice__accent">$44.990</span>
            </div>
          </div>

          <Card className="heroFormCard">
            <div className="heroFormTitle">Ingresa los siguientes datos para comenzar con la transferencia</div>

            <div className="field">
              <label className="label">¿Vas a vender o comprar?</label>
              <div className="segmented">
                <button
                  type="button"
                  className={`segmented__btn ${intent === 'SELL' ? 'segmented__btn--active' : ''}`}
                  onClick={() => setIntent('SELL')}
                >
                  Vender
                </button>
                <button
                  type="button"
                  className={`segmented__btn ${intent === 'BUY' ? 'segmented__btn--active' : ''}`}
                  onClick={() => setIntent('BUY')}
                >
                  Comprar
                </button>
              </div>
            </div>

            <div className="formGrid formGrid--hero">
              <div className="field">
                <label className="label">Patente</label>
                <Input value={quick.plate} onChange={(e) => setQuick({ ...quick, plate: e.target.value })} placeholder="ABCD-12" />
              </div>
              <div className="field">
                <label className="label">Nombre completo</label>
                <Input
                  value={quick.fullName}
                  onChange={(e) => setQuick({ ...quick, fullName: e.target.value })}
                  placeholder="Ej: Pedro Díaz"
                />
              </div>
              <div className="field formGrid__span2">
                <label className="label">Correo electrónico</label>
                <Input
                  value={quick.email}
                  onChange={(e) => setQuick({ ...quick, email: e.target.value })}
                  placeholder="Ej: pedro@correo.com"
                />
              </div>
            </div>

            <Button
              type="button"
              disabled={busy || !canNext}
              className="heroCta"
              onClick={() => {
                // prefill basics and jump into full wizard
                setVehicle((v) => ({ ...v, plate: quick.plate.trim() }))
                if (intent === 'SELL') setSeller((s) => ({ ...s, name: quick.fullName.trim(), email: quick.email.trim() }))
                else setBuyer((b) => ({ ...b, name: quick.fullName.trim(), email: quick.email.trim() }))
                setStarted(true)
                setStep('vehicle')
                toast.push({ tone: 'info', title: 'Transferencia iniciada', message: 'Completa los datos para generar el contrato.' })
              }}
            >
              Comenzar transferencia
            </Button>

            <div className="muted heroFormHint">Mock: la validación con Registro Civil se ejecuta desde el detalle del contrato.</div>
          </Card>
        </div>
      ) : (
        <Card>
        <div className="stepper" aria-label="Progreso">
          {steps.map((s, idx) => (
            <div key={s.id} className={`step ${idx <= progress ? 'step--active' : ''}`}>
              <div className="step__dot">{idx + 1}</div>
              <div className="step__label">{s.label}</div>
            </div>
          ))}
        </div>

        {step === 'vehicle' ? (
          <div className="formGrid">
            <div className="field">
              <label className="label">Patente</label>
              <Input value={vehicle.plate} onChange={(e) => setVehicle({ ...vehicle, plate: e.target.value })} placeholder="ABCD-12" />
            </div>
            <div className="field">
              <label className="label">VIN</label>
              <Input value={vehicle.vin} onChange={(e) => setVehicle({ ...vehicle, vin: e.target.value })} placeholder="17 caracteres" />
            </div>
            <div className="field">
              <label className="label">Marca</label>
              <Input value={vehicle.brand} onChange={(e) => setVehicle({ ...vehicle, brand: e.target.value })} placeholder="Toyota" />
            </div>
            <div className="field">
              <label className="label">Modelo</label>
              <Input value={vehicle.model} onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })} placeholder="Corolla" />
            </div>
            <div className="field">
              <label className="label">Año</label>
              <Input
                type="number"
                value={vehicle.year}
                onChange={(e) => setVehicle({ ...vehicle, year: Number(e.target.value) })}
                min={1980}
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>
        ) : null}

        {step === 'parties' ? (
          <div className="grid grid--2">
            <div className="stack">
              <div className="h2">Vendedor</div>
              <div className="field">
                <label className="label">Razón social</label>
                <Input value={seller.name} onChange={(e) => setSeller({ ...seller, name: e.target.value })} placeholder="Empresa vendedora" />
              </div>
              <div className="field">
                <label className="label">RUT</label>
                <Input value={seller.rut} onChange={(e) => setSeller({ ...seller, rut: e.target.value })} placeholder="76.123.456-7" />
              </div>
              <div className="field">
                <label className="label">Email</label>
                <Input value={seller.email} onChange={(e) => setSeller({ ...seller, email: e.target.value })} placeholder="legal@empresa.cl" />
              </div>
              <div className="field">
                <label className="label">Teléfono (opcional)</label>
                <Input value={seller.phone ?? ''} onChange={(e) => setSeller({ ...seller, phone: e.target.value })} placeholder="+56 9 1234 5678" />
              </div>
            </div>

            <div className="stack">
              <div className="h2">Comprador</div>
              <div className="field">
                <label className="label">Razón social</label>
                <Input value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} placeholder="Empresa compradora" />
              </div>
              <div className="field">
                <label className="label">RUT</label>
                <Input value={buyer.rut} onChange={(e) => setBuyer({ ...buyer, rut: e.target.value })} placeholder="77.555.111-2" />
              </div>
              <div className="field">
                <label className="label">Email</label>
                <Input value={buyer.email} onChange={(e) => setBuyer({ ...buyer, email: e.target.value })} placeholder="ops@empresa.cl" />
              </div>
              <div className="field">
                <label className="label">Teléfono (opcional)</label>
                <Input value={buyer.phone ?? ''} onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })} placeholder="+56 9 9876 5432" />
              </div>
            </div>
          </div>
        ) : null}

        {step === 'review' ? (
          <div className="stack">
            <div className="muted">
              En un entorno real aquí revisarías cláusulas, consentimientos y costos antes de enviar a validación Registro Civil.
            </div>

            <div className="grid grid--2">
              <div>
                <div className="h2">Resumen vehículo</div>
                <div className="kv">
                  <div className="kv__k">Patente</div>
                  <div className="kv__v mono">{vehicle.plate || '—'}</div>
                  <div className="kv__k">VIN</div>
                  <div className="kv__v mono">{vehicle.vin || '—'}</div>
                  <div className="kv__k">Modelo</div>
                  <div className="kv__v">{vehicle.brand + ' ' + vehicle.model + ' · ' + vehicle.year}</div>
                </div>
              </div>
              <div>
                <div className="h2">Partes</div>
                <div className="kv">
                  <div className="kv__k">Vendedor</div>
                  <div className="kv__v">{seller.name}</div>
                  <div className="kv__k">Comprador</div>
                  <div className="kv__v">{buyer.name}</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="actions">
          <div className="muted">
            {errors.length ? (
              <span>
                {errors[0]} {errors.length > 1 ? `(+${errors.length - 1} más)` : ''}
              </span>
            ) : (
              <span>Listo para continuar.</span>
            )}
          </div>
          <div className="row">
            <Button
              tone="neutral"
              type="button"
              disabled={busy || step === 'vehicle'}
              onClick={() => {
                if (step === 'parties') setStep('vehicle')
                else if (step === 'review') setStep('parties')
              }}
            >
              Atrás
            </Button>

            {step !== 'review' ? (
              <Button
                type="button"
                disabled={busy || !canNext}
                onClick={() => {
                  if (step === 'vehicle') setStep('parties')
                  else if (step === 'parties') setStep('review')
                }}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="button"
                disabled={busy || !canNext}
                onClick={async () => {
                  setBusy(true)
                  try {
                    const created = await createTransfer({ vehicle, seller, buyer })
                    toast.push({ tone: 'success', title: 'Transferencia creada', message: 'Ahora valida con Registro Civil desde el detalle.' })
                    setStep('done')
                    nav(`/contracts/${created.id}`)
                  } catch (e: any) {
                    toast.push({ tone: 'error', title: 'Error', message: String(e?.message ?? e) })
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Crear contrato (mock)
              </Button>
            )}
          </div>
        </div>
      </Card>
      )}
    </div>
  )
}

