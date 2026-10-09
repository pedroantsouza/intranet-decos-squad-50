import { IconeUsuario, IconeUsuarios } from '../../../shared/components/icones'
import { NOMES_MESES } from '../formatadores'
import type { Aniversariante } from '../types'

interface PropriedadesPainelAniversariantes {
  mes: number
  aniversariantes: Aniversariante[]
}

function PainelAniversariantes({ mes, aniversariantes }: PropriedadesPainelAniversariantes) {
  const ordenados = [...aniversariantes].sort((a, b) => a.dia - b.dia)

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden surface">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 bg-white/40 px-[18px] py-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-600">
          <IconeUsuarios tamanho={16} className="text-brand-600" />
          ANIVERSARIANTES DE {NOMES_MESES[mes].toUpperCase()}
        </span>
        <span className="flex-none text-[11px] text-slate-500 tabular-nums">{ordenados.length} PESSOAS</span>
      </div>
      <div className="flex flex-col px-[18px] pb-[18px]">
        {ordenados.length === 0 && (
          <p className="m-0 py-6 text-center text-[13px] text-slate-600">
            Nenhum aniversariante neste mês.
          </p>
        )}
        {ordenados.map((pessoa) => (
          <div key={pessoa.id} className="flex items-center gap-[11px] border-t border-slate-200/60 py-2.5 first:border-t-0">
            <span className="flex size-[34px] flex-none items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <IconeUsuario tamanho={19} />
            </span>
            <div className="flex min-w-0 flex-col leading-snug">
              <span className="truncate text-[13px] font-semibold text-slate-900">{pessoa.nome}</span>
              <span className="truncate text-xs text-slate-500">{pessoa.setorNome ?? 'Sem setor'}</span>
            </div>
            <span className="ml-auto flex-none text-xs text-slate-600 tabular-nums">
              {String(pessoa.dia).padStart(2, '0')}/{String(mes + 1).padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PainelAniversariantes
