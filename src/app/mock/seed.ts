import type { Contract } from '../types'

function nowISO() {
  return new Date().toISOString()
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export const ORGS = [
  { id: 'org_autoplaza', name: 'AutoPlaza B2B' },
  { id: 'org_fleetmax', name: 'FleetMax Empresas' },
] as const

export function seedContracts(orgId: string): Contract[] {
  const baseVehicle = {
    plate: 'KLJP-12',
    vin: '1HGCM82633A004352',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2021,
  }

  const c1: Contract = {
    id: id('ctr'),
    orgId,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    status: 'VALIDATED',
    vehicle: baseVehicle,
    seller: { name: 'Comercial Sur SpA', rut: '76.123.456-7', email: 'ventas@comercialsur.cl' },
    buyer: { name: 'Transportes Rojas Ltda', rut: '77.555.111-2', email: 'admin@trojas.cl' },
    registryValidation: {
      status: 'OK',
      summary: 'Identidades validadas y vehículo habilitado para transferencia.',
      validatedAt: nowISO(),
    },
    signing: { status: 'NOT_STARTED' },
    audit: [
      { id: id('evt'), at: nowISO(), actor: 'Sistema', message: 'Contrato creado.' },
      { id: id('evt'), at: nowISO(), actor: 'Registro Civil', message: 'Validación aprobada.' },
    ],
  }

  const c2: Contract = {
    id: id('ctr'),
    orgId,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    status: 'VALIDATION_PENDING',
    vehicle: { plate: 'PPTR-44', vin: '2T1BURHE5JC048765', brand: 'Hyundai', model: 'Tucson', year: 2020 },
    seller: { name: 'Inversiones Norte SA', rut: '88.010.020-3', email: 'contacto@invnorte.cl' },
    buyer: { name: 'Logística Delta SpA', rut: '76.900.120-0', email: 'ops@deltalog.cl' },
    registryValidation: { status: 'NOT_STARTED' },
    signing: { status: 'NOT_STARTED' },
    audit: [{ id: id('evt'), at: nowISO(), actor: 'Sistema', message: 'Contrato creado.' }],
  }

  const c3: Contract = {
    id: id('ctr'),
    orgId,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    status: 'SIGNED',
    vehicle: { plate: 'ZKLD-09', vin: '3VW2K7AJ5EM388212', brand: 'Nissan', model: 'Sentra', year: 2019 },
    seller: { name: 'Rent a Car Andes', rut: '79.333.222-1', email: 'legal@andesrent.cl' },
    buyer: { name: 'Constructora Lira', rut: '76.444.888-9', email: 'compras@lira.cl' },
    registryValidation: {
      status: 'OK',
      summary: 'Validación aprobada. Sin multas ni prohibiciones.',
      validatedAt: nowISO(),
    },
    signing: {
      status: 'SIGNED',
      signedAt: nowISO(),
      method: 'ADVANCED_E-SIGN',
    },
    audit: [
      { id: id('evt'), at: nowISO(), actor: 'Sistema', message: 'Contrato creado.' },
      { id: id('evt'), at: nowISO(), actor: 'Registro Civil', message: 'Validación aprobada.' },
      { id: id('evt'), at: nowISO(), actor: 'Firmador', message: 'Contrato firmado electrónicamente.' },
    ],
  }

  return [c1, c2, c3]
}

