import { useEffect, useMemo, useState } from 'react'
import { listContracts } from '../mock/api'
import type { Contract } from '../types'
import { fmtDate, statusLabel, statusTone } from '../utils/format'
import { Button, Card, Col, List, Row, Space, Tag, Typography } from 'antd'
import { Link, useNavigate } from 'react-router-dom'

export function DashboardPage() {
  const nav = useNavigate()
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
    <Space direction="vertical" size={14} style={{ width: '100%' }}>
      <Row justify="space-between" align="top" gutter={[12, 12]}>
        <Col flex="auto">
          <Typography.Title level={3} style={{ margin: 0 }}>
            Dashboard
          </Typography.Title>
          <Typography.Text type="secondary">
            Flujo principal: crear transferencia → validar con Registro Civil (mock) → firmar contrato.
          </Typography.Text>
        </Col>
        <Col>
          <Space>
            <Link to="/contracts">Ver contratos</Link>
            <Button type="primary" onClick={() => nav('/new-transfer')}>
              Nueva transferencia
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpiCard">
            <Typography.Text type="secondary">Contratos</Typography.Text>
            <div className="kpiValue">{kpis.total}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpiCard">
            <Typography.Text type="secondary">Firmados</Typography.Text>
            <div className="kpiValue">{kpis.signed}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpiCard">
            <Typography.Text type="secondary">Pendientes validación</Typography.Text>
            <div className="kpiValue">{kpis.pending}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpiCard">
            <Typography.Text type="secondary">Rechazados</Typography.Text>
            <div className="kpiValue">{kpis.rejected}</div>
          </Card>
        </Col>
      </Row>

      <Card
        title="Actividad reciente"
        extra={
          <Button type="link" onClick={() => nav('/contracts')} style={{ paddingInline: 0 }}>
            Abrir listado
          </Button>
        }
      >
        {loading ? (
          <Typography.Text type="secondary">Cargando...</Typography.Text>
        ) : recent.length === 0 ? (
          <Typography.Text type="secondary">No hay contratos.</Typography.Text>
        ) : (
          <List
            dataSource={recent}
            renderItem={(c) => (
              <List.Item
                className="listRowLink"
                onClick={() => nav(`/contracts/${c.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <List.Item.Meta
                  title={
                    <Space wrap>
                      <Typography.Text code>{c.id.slice(0, 10)}…</Typography.Text>
                      <Typography.Text strong>{c.vehicle.plate}</Typography.Text>
                      <Typography.Text type="secondary" ellipsis>
                        {c.buyer.name}
                      </Typography.Text>
                    </Space>
                  }
                  description={
                    <Space wrap>
                      <Tag color={statusTone(c.status) === 'green' ? 'green' : statusTone(c.status) === 'red' ? 'red' : statusTone(c.status) === 'yellow' ? 'gold' : statusTone(c.status) === 'blue' ? 'purple' : 'default'}>
                        {statusLabel(c.status)}
                      </Tag>
                      <Typography.Text type="secondary">{fmtDate(c.updatedAt)}</Typography.Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </Space>
  )
}

