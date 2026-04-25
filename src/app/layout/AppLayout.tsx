import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Typography } from 'antd'
import { FileTextOutlined, HomeOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { TopBar } from './TopBar'

export function AppLayout() {
  const location = useLocation()
  const nav = useNavigate()
  const selectedKey =
    location.pathname === '/'
      ? 'dashboard'
      : location.pathname.startsWith('/contracts')
        ? 'contracts'
        : location.pathname.startsWith('/new-transfer')
          ? 'new-transfer'
          : 'dashboard'

  return (
    <Layout className="antApp">
      <Layout.Sider width={260} className="antSide" breakpoint="lg" collapsedWidth={0}>
        <div className="antBrand">
          <Typography.Text strong className="antBrand__name">
            TransferSuite
          </Typography.Text>
          <Typography.Text type="secondary" className="antBrand__sub">
            B2B Contracts · Mock
          </Typography.Text>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            { key: 'dashboard', icon: <HomeOutlined />, label: 'Dashboard', onClick: () => nav('/') },
            { key: 'contracts', icon: <FileTextOutlined />, label: 'Contratos', onClick: () => nav('/contracts') },
            { key: 'new-transfer', icon: <PlusCircleOutlined />, label: 'Nueva transferencia', onClick: () => nav('/new-transfer') },
          ]}
        />
      </Layout.Sider>

      <Layout>
        <div className="topStrip" aria-hidden="true">
          <div className="topStrip__inner">
            <div className="topStrip__tabs">
              <span className="topStrip__tab topStrip__tab--active">transfer</span>
              <span className="topStrip__tab">check</span>
              <span className="topStrip__tab">wallet</span>
              <span className="topStrip__tab">empresas</span>
            </div>
          </div>
        </div>
        <TopBar />
        <Layout.Content className="antContent">
          <div className="contentSurface">
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

