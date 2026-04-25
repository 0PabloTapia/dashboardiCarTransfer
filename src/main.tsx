import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider
        componentSize="large"
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#7c3aed',
            colorInfo: '#7c3aed',
            colorSuccess: '#16a34a',
            colorWarning: '#f59e0b',
            colorError: '#e11d48',
            colorText: '#111827',
            colorTextSecondary: '#6b7280',
            colorBgBase: '#ffffff',
            colorBgContainer: '#ffffff',
            colorBorder: '#ececf1',
            borderRadius: 12,
            controlHeight: 42,
            controlHeightLG: 46,
            boxShadowSecondary: '0 10px 30px rgba(17, 24, 39, 0.08)',
            fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
)
