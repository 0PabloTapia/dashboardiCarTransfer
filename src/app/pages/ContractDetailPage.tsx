import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getContract, signContract, validateWithRegistry } from '../mock/api'
import type { Contract } from '../types'
import { fmtDate, statusLabel, statusTone } from '../utils/format'
import { Button, Card, Descriptions, Divider, List, Space, Tag, Typography, message } from 'antd'

export function ContractDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
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
    if (s === 'OK') return <Tag color="green">Registro Civil: OK</Tag>
    if (s === 'FAIL') return <Tag color="red">Registro Civil: Error</Tag>
    if (s === 'IN_PROGRESS') return <Tag color="gold">Registro Civil: Validando…</Tag>
    return <Tag>Registro Civil: Sin ejecutar</Tag>
  }, [c])

  if (!id) return null

  return (
    <Space direction="vertical" size={14} style={{ width: '100%' }}>
      <Space align="baseline" style={{ width: '100%', justifyContent: 'space-between' }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Detalle de contrato
          </Typography.Title>
          <Typography.Text type="secondary" code>
            {id}
          </Typography.Text>
        </div>
        <Space>
          <Button onClick={() => nav('/contracts')}>Volver</Button>
          <Button
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
              message.success('Descarga iniciada (mock).')
            }}
          >
            Descargar (mock)
          </Button>
        </Space>
      </Space>

      <Card>
        {loading ? (
          <Typography.Text type="secondary">Cargando...</Typography.Text>
        ) : !c ? (
          <Typography.Text type="secondary">
            No encontrado.{' '}
            <Button type="link" onClick={() => nav('/contracts')} style={{ paddingInline: 0 }}>
              Volver
            </Button>
          </Typography.Text>
        ) : (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
              <Space wrap>
                <Tag
                  color={
                    statusTone(c.status) === 'green'
                      ? 'green'
                      : statusTone(c.status) === 'red'
                        ? 'red'
                        : statusTone(c.status) === 'yellow'
                          ? 'gold'
                          : statusTone(c.status) === 'blue'
                            ? 'purple'
                            : 'default'
                  }
                >
                  {statusLabel(c.status)}
                </Tag>
                {registryBadge}
              </Space>
              <Typography.Text type="secondary">Actualizado: {fmtDate(c.updatedAt)}</Typography.Text>
            </Space>

            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Patente">
                <Typography.Text code>{c.vehicle.plate}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="VIN">
                <Typography.Text code>{c.vehicle.vin}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Vehículo" span={2}>
                {c.vehicle.brand} {c.vehicle.model} · {c.vehicle.year}
              </Descriptions.Item>
              <Descriptions.Item label="Vendedor">{c.seller.name}</Descriptions.Item>
              <Descriptions.Item label="RUT vendedor">
                <Typography.Text code>{c.seller.rut}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Comprador">{c.buyer.name}</Descriptions.Item>
              <Descriptions.Item label="RUT comprador">
                <Typography.Text code>{c.buyer.rut}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Validación Registro Civil" span={2}>
                <Space direction="vertical" size={0}>
                  <Typography.Text>{c.registryValidation.status}</Typography.Text>
                  {c.registryValidation.summary ? (
                    <Typography.Text type="secondary">{c.registryValidation.summary}</Typography.Text>
                  ) : null}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Firma" span={2}>
                <Space>
                  <Typography.Text>{c.signing.status}</Typography.Text>
                  {c.signing.method ? <Typography.Text type="secondary">({c.signing.method})</Typography.Text> : null}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Space>
              <Button
                type="primary"
                disabled={!canValidate || busy}
                loading={busy && c.registryValidation.status === 'IN_PROGRESS'}
                onClick={async () => {
                  if (!c) return
                  setBusy(true)
                  try {
                    message.loading({ content: 'Validando con Registro Civil…', key: 'rc' })
                    const updated = await validateWithRegistry(c.id)
                    setC(updated)
                    message.destroy('rc')
                    if (updated.registryValidation.status === 'OK') message.success('Validación OK')
                    else message.error('Validación rechazada')
                  } catch (e: any) {
                    message.error(String(e?.message ?? e))
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Validar con Registro Civil
              </Button>

              <Button
                disabled={!canSign || busy}
                onClick={async () => {
                  if (!c) return
                  setBusy(true)
                  try {
                    const updated = await signContract(c.id, 'ADVANCED_E-SIGN')
                    setC(updated)
                    message.success('Contrato firmado (mock).')
                  } catch (e: any) {
                    message.error(String(e?.message ?? e))
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Firmar (mock)
              </Button>
            </Space>

            <Divider style={{ marginBlock: 6 }} />
            <Typography.Title level={5} style={{ margin: 0 }}>
              Trazabilidad
            </Typography.Title>
            <List
              dataSource={c.audit}
              renderItem={(e) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Typography.Text strong>{e.actor}</Typography.Text>
                        <Typography.Text type="secondary">{fmtDate(e.at)}</Typography.Text>
                      </Space>
                    }
                    description={e.message}
                  />
                </List.Item>
              )}
            />
          </Space>
        )}
      </Card>
    </Space>
  )
}

