import { createContext, useContext, useMemo, useState } from 'react'

type Toast = { id: string; title: string; message?: string; tone?: 'success' | 'error' | 'info' }

type ToastCtx = {
  push: (t: Omit<Toast, 'id'>) => void
}

const Ctx = createContext<ToastCtx | null>(null)

function id() {
  return `t_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const api = useMemo<ToastCtx>(
    () => ({
      push: (t) => {
        const toast: Toast = { id: id(), tone: 'info', ...t }
        setToasts((prev) => [toast, ...prev].slice(0, 4))
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((x) => x.id !== toast.id))
        }, 3200)
      },
    }),
    [],
  )

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="toastStack" role="region" aria-label="Notificaciones">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone ?? 'info'}`} role="status">
            <div className="toast__title">{t.title}</div>
            {t.message ? <div className="toast__msg">{t.message}</div> : null}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('ToastProvider missing')
  return ctx
}

