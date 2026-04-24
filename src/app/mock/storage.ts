const KEY = 'icartransfer.mockdb.v1'

export type PersistedDB = {
  seededAt: string
  orgId: string
  contracts: unknown[]
}

export function loadDB(): PersistedDB | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedDB
  } catch {
    return null
  }
}

export function saveDB(db: PersistedDB) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

export function resetDB() {
  localStorage.removeItem(KEY)
}

