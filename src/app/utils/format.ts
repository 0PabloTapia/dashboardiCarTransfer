import type { ContractStatus } from '../types'

export function statusLabel(s: ContractStatus) {
  switch (s) {
    case 'DRAFT':
      return 'Borrador'
    case 'VALIDATION_PENDING':
      return 'Pendiente validación'
    case 'VALIDATED':
      return 'Validado'
    case 'SIGNED':
      return 'Firmado'
    case 'REJECTED':
      return 'Rechazado'
    default:
      return s
  }
}

export function statusTone(s: ContractStatus): 'green' | 'yellow' | 'red' | 'gray' | 'blue' {
  switch (s) {
    case 'SIGNED':
      return 'green'
    case 'VALIDATED':
      return 'blue'
    case 'VALIDATION_PENDING':
      return 'yellow'
    case 'REJECTED':
      return 'red'
    case 'DRAFT':
    default:
      return 'gray'
  }
}

export function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString()
}

