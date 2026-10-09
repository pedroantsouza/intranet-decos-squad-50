import type { ReactNode } from 'react'

interface PropriedadesCampo {
  rotulo: string
  erro?: string
  children: ReactNode
  className?: string
}

function Campo({ rotulo, erro, children, className }: PropriedadesCampo) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className="text-xs font-medium tracking-wide text-slate-700">{rotulo.toUpperCase()}</span>
      {children}
      {erro && <span className="text-xs text-critical">{erro}</span>}
    </label>
  )
}

export default Campo
