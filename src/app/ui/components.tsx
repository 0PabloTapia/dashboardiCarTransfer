import { Link, NavLink } from 'react-router-dom'

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'neutral' }) {
  const { tone = 'primary', className, ...rest } = props
  return <button {...rest} className={`btn btn--${tone} ${className ?? ''}`} />
}

export function LinkButton(props: React.ComponentProps<typeof Link> & { tone?: 'primary' | 'neutral' }) {
  const { tone = 'primary', className, ...rest } = props
  return <Link {...rest} className={`btn btn--${tone} ${className ?? ''}`} />
}

export function TextLink(props: React.ComponentProps<typeof Link>) {
  const { className, ...rest } = props
  return <Link {...rest} className={`textLink ${className ?? ''}`} />
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props
  return <input {...rest} className={`input ${className ?? ''}`} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props
  return <select {...rest} className={`select ${className ?? ''}`} />
}

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return <div {...rest} className={`card ${className ?? ''}`} />
}

export function Badge({ tone, children }: { tone: 'green' | 'yellow' | 'red' | 'gray' | 'blue'; children: React.ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function SideNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sideNav__link ${isActive ? 'sideNav__link--active' : ''}`}
      end={to === '/'}
    >
      {children}
    </NavLink>
  )
}

export function RowLink(props: React.ComponentProps<typeof Link>) {
  const { className, ...rest } = props
  return <Link {...rest} className={`table__row table__link ${className ?? ''}`} />
}

