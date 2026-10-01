import { IconeLapis, IconeLixeira } from '../../../shared/components/icones'
import type { SetorComRamais } from '../types'

interface PropriedadesTabelaSetores {
  setores: SetorComRamais[]
  podeEditarSetor: (setor: SetorComRamais) => boolean
  podeExcluir: boolean
  aoEditar: (setor: SetorComRamais) => void
  aoExcluir: (setor: SetorComRamais) => void
}

const COLUNAS = 'grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_76px] gap-[18px]'

function TabelaSetores({ setores, podeEditarSetor, podeExcluir, aoEditar, aoExcluir }: PropriedadesTabelaSetores) {
  return (
    <div className="overflow-hidden rounded-[10px] bg-white px-6 pb-2 shadow-[0_1px_2px_rgba(30,42,50,0.04),0_10px_22px_-16px_rgba(30,42,50,0.18)]">
      <div className={`${COLUNAS} -mx-6 bg-[#800020] px-6 py-3`}>
        <span className="text-[10px] tracking-[0.08em] text-white">SETOR</span>
        <span className="text-[10px] tracking-[0.08em] text-white">RAMAIS</span>
        <span className="text-right text-[10px] tracking-[0.08em] text-white">AÇÕES</span>
      </div>

      {setores.length === 0 && (
        <p className="m-0 py-10 text-center text-sm text-slate-500">Nenhum setor encontrado.</p>
      )}

      {setores.map((setor, indice) => (
        <div
          key={setor.id}
          className={`${COLUNAS} -mx-6 items-center border-b border-slate-100 px-6 py-[13px] ${
            indice % 2 ? 'bg-slate-50' : 'bg-white'
          }`}
        >
          <span className="text-[13.5px] font-medium text-slate-900">{setor.nome}</span>
          <div className="flex flex-wrap gap-1.5">
            {setor.ramais.length === 0 && <span className="text-[12.5px] text-slate-400">—</span>}
            {setor.ramais.map((ramal) => (
              <span
                key={ramal.id}
                className="rounded-md bg-[#fff5f5] px-[9px] py-[3px] font-mono text-[12.5px] font-medium text-[#800020]"
              >
                {ramal.numero}
              </span>
            ))}
          </div>
          <div className="flex justify-end gap-0.5">
            {podeEditarSetor(setor) && (
              <button
                type="button"
                onClick={() => aoEditar(setor)}
                title="Editar"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <IconeLapis tamanho={15} />
              </button>
            )}
            {podeExcluir && (
              <button
                type="button"
                onClick={() => aoExcluir(setor)}
                title="Excluir"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <IconeLixeira tamanho={15} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TabelaSetores
