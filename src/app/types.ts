export type ContractStatus =
  | 'DRAFT'
  | 'VALIDATION_PENDING'
  | 'VALIDATED'
  | 'SIGNED'
  | 'REJECTED'

export type B2BOrg = {
  id: string
  name: string
}

export type Party = {
  name: string
  rut: string
  email: string
  phone?: string
}

export type Vehicle = {
  plate: string
  vin: string
  brand: string
  model: string
  year: number
}

export type AuditEvent = {
  id: string
  at: string // ISO
  actor: string
  message: string
}

export type Contract = {
  id: string
  orgId: string
  createdAt: string // ISO
  updatedAt: string // ISO
  status: ContractStatus
  vehicle: Vehicle
  seller: Party
  buyer: Party
  registryValidation: {
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'OK' | 'FAIL'
    summary?: string
    validatedAt?: string
  }
  signing: {
    status: 'NOT_STARTED' | 'SIGNED'
    signedAt?: string
    method?: 'ADVANCED_E-SIGN' | 'SIMPLE_E-SIGN'
  }
  audit: AuditEvent[]
}

