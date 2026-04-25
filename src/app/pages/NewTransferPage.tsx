import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTransfer } from '../mock/api'
import type { Party, Vehicle } from '../types'
import { Button, Card, Col, Form, Input, Row, Segmented, Space, Steps, Typography, message } from 'antd'

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
    <Space direction="vertical" size={14} style={{ width: '100%' }}>
      <Row justify="space-between" align="top" gutter={[12, 12]}>
        <Col flex="auto">
          <Typography.Title level={3} style={{ margin: 0 }}>
            Nueva transferencia
          </Typography.Title>
          <Typography.Text type="secondary">Flujo mock para validación con clientes B2B (sin backend).</Typography.Text>
        </Col>
        <Col>
          <Button onClick={() => nav('/contracts')}>Cancelar</Button>
        </Col>
      </Row>

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

            <Form layout="vertical">
              <Form.Item label="¿Vas a vender o comprar?">
                <Segmented
                  value={intent}
                  onChange={(v) => setIntent(v as any)}
                  options={[
                    { label: 'Vender', value: 'SELL' },
                    { label: 'Comprar', value: 'BUY' },
                  ]}
                  block
                />
              </Form.Item>

              <Row gutter={[12, 12]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Patente" required>
                    <Input value={quick.plate} onChange={(e) => setQuick({ ...quick, plate: e.target.value })} placeholder="ABCD-12" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Nombre completo" required>
                    <Input
                      value={quick.fullName}
                      onChange={(e) => setQuick({ ...quick, fullName: e.target.value })}
                      placeholder="Ej: Pedro Díaz"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Correo electrónico" required>
                    <Input
                      value={quick.email}
                      onChange={(e) => setQuick({ ...quick, email: e.target.value })}
                      placeholder="Ej: pedro@correo.com"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <Button
              type="primary"
              disabled={busy || !canNext}
              className="heroCta"
              onClick={() => {
                // prefill basics and jump into full wizard
                setVehicle((v) => ({ ...v, plate: quick.plate.trim() }))
                if (intent === 'SELL') setSeller((s) => ({ ...s, name: quick.fullName.trim(), email: quick.email.trim() }))
                else setBuyer((b) => ({ ...b, name: quick.fullName.trim(), email: quick.email.trim() }))
                setStarted(true)
                setStep('vehicle')
                message.info('Transferencia iniciada. Completa los datos para generar el contrato.')
              }}
            >
              Comenzar transferencia
            </Button>

            <div className="muted heroFormHint">Mock: la validación con Registro Civil se ejecuta desde el detalle del contrato.</div>
          </Card>
        </div>
      ) : (
        <Card>
          <Steps
            current={progress}
            items={steps.map((s) => ({ title: s.label }))}
            style={{ marginBottom: 14 }}
          />

        {step === 'vehicle' ? (
          <Form layout="vertical">
            <Row gutter={[12, 12]}>
              <Col xs={24} md={12}>
                <Form.Item label="Patente" required>
                  <Input value={vehicle.plate} onChange={(e) => setVehicle({ ...vehicle, plate: e.target.value })} placeholder="ABCD-12" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="VIN" required>
                  <Input value={vehicle.vin} onChange={(e) => setVehicle({ ...vehicle, vin: e.target.value })} placeholder="17 caracteres" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Marca" required>
                  <Input value={vehicle.brand} onChange={(e) => setVehicle({ ...vehicle, brand: e.target.value })} placeholder="Toyota" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Modelo" required>
                  <Input value={vehicle.model} onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })} placeholder="Corolla" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Año" required>
                  <Input
                    type="number"
                    value={vehicle.year}
                    onChange={(e) => setVehicle({ ...vehicle, year: Number(e.target.value) })}
                    min={1980}
                    max={new Date().getFullYear() + 1}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        ) : null}

        {step === 'parties' ? (
          <Row gutter={[12, 12]}>
            <Col xs={24} lg={12}>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Vendedor
              </Typography.Title>
              <Form layout="vertical">
                <Form.Item label="Razón social" required>
                  <Input value={seller.name} onChange={(e) => setSeller({ ...seller, name: e.target.value })} placeholder="Empresa vendedora" />
                </Form.Item>
                <Form.Item label="RUT" required>
                  <Input value={seller.rut} onChange={(e) => setSeller({ ...seller, rut: e.target.value })} placeholder="76.123.456-7" />
                </Form.Item>
                <Form.Item label="Email" required>
                  <Input value={seller.email} onChange={(e) => setSeller({ ...seller, email: e.target.value })} placeholder="legal@empresa.cl" />
                </Form.Item>
                <Form.Item label="Teléfono (opcional)">
                  <Input value={seller.phone ?? ''} onChange={(e) => setSeller({ ...seller, phone: e.target.value })} placeholder="+56 9 1234 5678" />
                </Form.Item>
              </Form>
            </Col>

            <Col xs={24} lg={12}>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Comprador
              </Typography.Title>
              <Form layout="vertical">
                <Form.Item label="Razón social" required>
                  <Input value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} placeholder="Empresa compradora" />
                </Form.Item>
                <Form.Item label="RUT" required>
                  <Input value={buyer.rut} onChange={(e) => setBuyer({ ...buyer, rut: e.target.value })} placeholder="77.555.111-2" />
                </Form.Item>
                <Form.Item label="Email" required>
                  <Input value={buyer.email} onChange={(e) => setBuyer({ ...buyer, email: e.target.value })} placeholder="ops@empresa.cl" />
                </Form.Item>
                <Form.Item label="Teléfono (opcional)">
                  <Input value={buyer.phone ?? ''} onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })} placeholder="+56 9 9876 5432" />
                </Form.Item>
              </Form>
            </Col>
          </Row>
        ) : null}

        {step === 'review' ? (
          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            <Typography.Text type="secondary">
              En un entorno real aquí revisarías cláusulas, consentimientos y costos antes de enviar a validación Registro Civil.
            </Typography.Text>

            <Row gutter={[12, 12]}>
              <Col xs={24} lg={12}>
                <Card size="small" title="Resumen vehículo">
                  <Space direction="vertical" size={2}>
                    <Typography.Text type="secondary">Patente</Typography.Text>
                    <Typography.Text code>{vehicle.plate || '—'}</Typography.Text>
                    <Typography.Text type="secondary">VIN</Typography.Text>
                    <Typography.Text code>{vehicle.vin || '—'}</Typography.Text>
                    <Typography.Text type="secondary">Modelo</Typography.Text>
                    <Typography.Text>
                      {vehicle.brand} {vehicle.model} · {vehicle.year}
                    </Typography.Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card size="small" title="Partes">
                  <Space direction="vertical" size={2}>
                    <Typography.Text type="secondary">Vendedor</Typography.Text>
                    <Typography.Text>{seller.name || '—'}</Typography.Text>
                    <Typography.Text type="secondary">Comprador</Typography.Text>
                    <Typography.Text>{buyer.name || '—'}</Typography.Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Space>
        ) : null}

        <div className="actions">
          <Typography.Text type="secondary">
            {errors.length ? `${errors[0]}${errors.length > 1 ? ` (+${errors.length - 1} más)` : ''}` : 'Listo para continuar.'}
          </Typography.Text>
          <Space>
            <Button
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
                type="primary"
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
                type="primary"
                disabled={busy || !canNext}
                loading={busy}
                onClick={async () => {
                  setBusy(true)
                  try {
                    const created = await createTransfer({ vehicle, seller, buyer })
                    message.success('Transferencia creada. Ahora valida con Registro Civil desde el detalle.')
                    setStep('done')
                    nav(`/contracts/${created.id}`)
                  } catch (e: any) {
                    message.error(String(e?.message ?? e))
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Crear contrato (mock)
              </Button>
            )}
          </Space>
        </div>
      </Card>
      )}
    </Space>
  )
}

