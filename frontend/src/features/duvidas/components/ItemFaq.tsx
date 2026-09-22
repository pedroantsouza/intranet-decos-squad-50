import { IconeLapis, IconeLixeira } from '../../../shared/components/icones'
import type { Faq } from '../types'

interface PropriedadesItemFaq {
  faq: Faq
  expandido: boolean
  aoAlternar: () => void
  podeGerenciar: boolean
  aoEditar: (faq: Faq) => void
  aoExcluir: (faq: Faq) => void
}

function ItemFaq({ faq, expandido, aoAlternar, podeGerenciar, aoEditar, aoExcluir }: PropriedadesItemFaq) {
  return (
    <div className="border-t border-slate-100 py-4 first:border-t-0">
      <button
        type="button"
        onClick={aoAlternar}
        className="flex w-full items-center gap-4 text-left"
      >
        <span className="w-16 flex-none text-[10.5px] font-semibold tracking-wide text-slate-500 uppercase">
          {faq.setorNome}
        </span>
        <span className="flex-1 text-[14.5px] font-semibold text-slate-900">{faq.pergunta}</span>
        <span className="flex-none text-lg leading-none text-slate-400">{expandido ? '−' : '+'}</span>
      </button>

      {expandido && (
        <div className="mt-3 pl-20">
          {podeGerenciar && (
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => aoEditar(faq)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                <IconeLapis tamanho={13} />
                Editar
              </button>
              <button
                type="button"
                onClick={() => aoExcluir(faq)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <IconeLixeira tamanho={13} />
                Excluir
              </button>
            </div>
          )}
          <p className="m-0 text-[13.5px] leading-relaxed text-slate-700">{faq.resposta}</p>
        </div>
      )}
    </div>
  )
}

export default ItemFaq
