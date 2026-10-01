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
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_1px_2px_rgba(30,42,50,0.04),0_10px_22px_-16px_rgba(30,42,50,0.18)]">
      <div className="flex items-center justify-between bg-[#800020] px-[18px] py-3">
        <span className="flex items-center gap-1.5 text-[10.5px] font-medium tracking-wide text-white">
          <IconeUsuarios tamanho={14} />
          ANIVERSARIANTES DE {NOMES_MESES[mes - 1].toUpperCase()}
        </span>
        <span className="text-[10px] text-white/70">{ordenados.length} PESSOAS</span>
      </div>
      <div className="flex flex-col px-[18px] pb-[18px]">
        {ordenados.length === 0 && (
          <p className="m-0 py-6 text-center text-[12.5px] text-slate-500">
            Nenhum aniversariante neste mês.
          </p>
        )}
        {ordenados.map((pessoa) => (
          <div key={pessoa.id} className="flex items-center gap-[11px] border-t border-slate-100 py-2.5 first:border-t-0">
            <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-slate-300 text-white">
              <IconeUsuario tamanho={19} />
            </span>
            <div className="flex min-w-0 flex-col leading-snug">
              <span className="truncate text-[13px] font-semibold text-slate-900">{pessoa.nome}</span>
              <span className="truncate text-[11.5px] text-slate-500">{pessoa.setorNome ?? 'Sem setor'}</span>
            </div>
            <span className="ml-auto text-[11px] text-slate-600">
              {String(pessoa.dia).padStart(2, '0')}/{String(mes).padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PainelAniversariantes
