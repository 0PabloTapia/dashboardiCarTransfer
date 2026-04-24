import type { Contract, ContractStatus, Party, Vehicle } from '../types'
import { loadDB, saveDB, type PersistedDB } from './storage'
import { ORGS, seedContracts } from './seed'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function nowISO() {
  return new Date().toISOString()
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

function assertSeeded(): PersistedDB {
  const db = loadDB()
  if (!db) throw new Error('DB not seeded')
  return db
}

function readContracts(db: PersistedDB): Contract[] {
  return (db.contracts as Contract[]) ?? []
}

function writeContracts(db: PersistedDB, contracts: Contract[]) {
  saveDB({ ...db, contracts })
}

export async function getOrgs() {
  await sleep(80)
  return [...ORGS]
}

export async function getCurrentOrgId() {
  await sleep(30)
  const db = assertSeeded()
  return db.orgId
}

export async function setCurrentOrgId(orgId: string) {
  await sleep(80)
  const db = assertSeeded()
  saveDB({ ...db, orgId })
}

export async function listContracts(params?: {
  orgId?: string
  q?: string
  status?: ContractStatus | 'ALL'
}) {
  await sleep(180)
  const db = assertSeeded()
  const orgId = params?.orgId ?? db.orgId
  const q = (params?.q ?? '').trim().toLowerCase()
  const status = params?.status ?? 'ALL'

  let items = readContracts(db).filter((c) => c.orgId === orgId)

  if (status !== 'ALL') items = items.filter((c) => c.status === status)
  if (q) {
    items = items.filter((c) => {
      const hay = [
        c.id,
        c.vehicle.plate,
        c.vehicle.vin,
        c.vehicle.brand,
        c.vehicle.model,
        c.buyer.name,
        c.seller.name,
        c.buyer.rut,
        c.seller.rut,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }

  items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return items
}

export async function getContract(id: string) {
  await sleep(140)
  const db = assertSeeded()
  const contract = readContracts(db).find((c) => c.id === id)
  if (!contract) throw new Error('Contract not found')
  return contract
}

export async function createTransfer(input: {
  vehicle: Vehicle
  seller: Party
  buyer: Party
}) {
  await sleep(250)
  const db = assertSeeded()
  const contracts = readContracts(db)
  const createdAt = nowISO()
  const newContract: Contract = {
    id: id('ctr'),
    orgId: db.orgId,
    createdAt,
    updatedAt: createdAt,
    status: 'VALIDATION_PENDING',
    vehicle: input.vehicle,
    seller: input.seller,
    buyer: input.buyer,
    registryValidation: { status: 'NOT_STARTED' },
    signing: { status: 'NOT_STARTED' },
    audit: [{ id: id('evt'), at: createdAt, actor: 'Sistema', message: 'Contrato creado (mock).' }],
  }

  writeContracts(db, [newContract, ...contracts])
  return newContract
}

export async function validateWithRegistry(contractId: string) {
  const db = assertSeeded()
  const contracts = readContracts(db)
  const idx = contracts.findIndex((c) => c.id === contractId)
  if (idx < 0) throw new Error('Contract not found')

  // mark in progress quickly for UX
  contracts[idx] = {
    ...contracts[idx],
    updatedAt: nowISO(),
    registryValidation: { status: 'IN_PROGRESS' },
    audit: [
      { id: id('evt'), at: nowISO(), actor: 'Registro Civil', message: 'Validación en curso...' },
      ...contracts[idx].audit,
    ],
  }
  writeContracts(db, contracts)

  await sleep(900)

  const ok = Math.random() > 0.12
  const updatedAt = nowISO()
  const next = contracts[idx]
  const nextStatus: ContractStatus = ok ? 'VALIDATED' : 'REJECTED'

  const updated: Contract = {
    ...next,
    updatedAt,
    status: nextStatus,
    registryValidation: ok
      ? {
          status: 'OK',
          validatedAt: updatedAt,
          summary: 'Identidades validadas y vehículo habilitado para transferencia.',
        }
      : {
          status: 'FAIL',
          validatedAt: updatedAt,
          summary: 'No fue posible validar. Revisa datos y reintenta (mock).',
        },
    audit: [
      { id: id('evt'), at: updatedAt, actor: 'Registro Civil', message: ok ? 'Validación aprobada.' : 'Validación rechazada.' },
      ...next.audit,
    ],
  }

  const nextContracts = readContracts(assertSeeded()).map((c) => (c.id === contractId ? updated : c))
  writeContracts(assertSeeded(), nextContracts)
  return updated
}

export async function signContract(contractId: string, method: 'ADVANCED_E-SIGN' | 'SIMPLE_E-SIGN') {
  await sleep(450)
  const db = assertSeeded()
  const contracts = readContracts(db)
  const idx = contracts.findIndex((c) => c.id === contractId)
  if (idx < 0) throw new Error('Contract not found')
  const current = contracts[idx]
  if (current.status !== 'VALIDATED' && current.status !== 'SIGNED') {
    throw new Error('Contract must be validated before signing')
  }
  const signedAt = nowISO()
  const updated: Contract = {
    ...current,
    updatedAt: signedAt,
    status: 'SIGNED',
    signing: { status: 'SIGNED', signedAt, method },
    audit: [{ id: id('evt'), at: signedAt, actor: 'Firmador', message: 'Contrato firmado electrónicamente (mock).' }, ...current.audit],
  }
  contracts[idx] = updated
  writeContracts(db, contracts)
  return updated
}

export function ensureSeeded() {
  const existing = loadDB()
  if (existing?.seededAt) return
  const seededAt = nowISO()
  const orgId = ORGS[0].id
  const db: PersistedDB = {
    seededAt,
    orgId,
    contracts: seedContracts(orgId),
  }
  saveDB(db)
}

