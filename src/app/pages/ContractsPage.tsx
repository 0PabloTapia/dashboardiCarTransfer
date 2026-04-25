import { useEffect, useMemo, useState } from 'react'
import { listContracts } from '../mock/api'
import type { Contract, ContractStatus } from '../types'
import { fmtDate, statusLabel, statusTone } from '../utils/format'
import { Button, Card, Col, Input, Row, Select, Space, Table, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

const STATUSES: Array<{ id: ContractStatus | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'Todos' },
  { id: 'VALIDATION_PENDING', label: 'Pendiente validación' },
  { id: 'VALIDATED', label: 'Validado' },
  { id: 'SIGNED', label: 'Firmado' },
  { id: 'REJECTED', label: 'Rechazado' },
  { id: 'DRAFT', label: 'Borrador' },
]

export function ContractsPage() {
  const nav = useNavigate()
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
    <Space direction="vertical" size={14} style={{ width: '100%' }}>
      <Row justify="space-between" align="top" gutter={[12, 12]}>
        <Col flex="auto">
          <Typography.Title level={3} style={{ margin: 0 }}>
            Contratos
          </Typography.Title>
          <Typography.Text type="secondary">Listado B2B con filtros para detectar fricción en el flujo.</Typography.Text>
        </Col>
        <Col>
          <Button type="primary" onClick={() => nav('/new-transfer')}>
            Nueva transferencia
          </Button>
        </Col>
      </Row>

      <Card>
        <Row gutter={[12, 12]} align="bottom">
          <Col xs={24} md={14}>
            <Typography.Text type="secondary">Buscar</Typography.Text>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Patente, VIN, comprador, vendedor, RUT..."
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Typography.Text type="secondary">Estado</Typography.Text>
            <Select
              value={status}
              style={{ width: '100%' }}
              options={STATUSES.map((s) => ({ value: s.id, label: s.label }))}
              onChange={(v) => setStatus(v as any)}
            />
          </Col>
          <Col xs={24} md={4}>
            <div style={{ height: 22 }} />
            <Typography.Text type="secondary">
              {summary.total} total · {summary.pending} pendientes · {summary.validated} validados · {summary.signed} firmados
            </Typography.Text>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table<Contract>
          rowKey="id"
          loading={loading}
          dataSource={items}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          onRow={(record) => ({
            onClick: () => nav(`/contracts/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          columns={[
            {
              title: 'ID',
              dataIndex: 'id',
              render: (v: string) => <Typography.Text code>{v.slice(0, 10)}…</Typography.Text>,
              width: 160,
            },
            {
              title: 'Vehículo',
              render: (_, c) => (
                <Space direction="vertical" size={0}>
                  <Typography.Text strong>{c.vehicle.plate}</Typography.Text>
                  <Typography.Text type="secondary">
                    {c.vehicle.brand} {c.vehicle.model} · {c.vehicle.year}
                  </Typography.Text>
                </Space>
              ),
            },
            { title: 'Vendedor', dataIndex: ['seller', 'name'], ellipsis: true },
            { title: 'Comprador', dataIndex: ['buyer', 'name'], ellipsis: true },
            {
              title: 'Estado',
              dataIndex: 'status',
              render: (s: ContractStatus) => {
                const tone = statusTone(s)
                const color = tone === 'green' ? 'green' : tone === 'red' ? 'red' : tone === 'yellow' ? 'gold' : tone === 'blue' ? 'purple' : 'default'
                return <Tag color={color}>{statusLabel(s)}</Tag>
              },
              width: 190,
            },
            { title: 'Actualizado', dataIndex: 'updatedAt', render: (v: string) => <Typography.Text type="secondary">{fmtDate(v)}</Typography.Text>, width: 220 },
          ]}
        />
      </Card>
    </Space>
  )
}

