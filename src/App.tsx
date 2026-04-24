import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './app/layout/AppLayout'
import { ContractsPage } from './app/pages/ContractsPage'
import { DashboardPage } from './app/pages/DashboardPage'
import { NewTransferPage } from './app/pages/NewTransferPage'
import { ContractDetailPage } from './app/pages/ContractDetailPage'
import { SeedGate } from './app/state/SeedGate'

export default function App() {
  return (
    <SeedGate>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/contracts/:id" element={<ContractDetailPage />} />
          <Route path="/new-transfer" element={<NewTransferPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </SeedGate>
  )
}
