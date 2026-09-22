import { IconeDuvida, IconeLupa } from '../../../shared/components/icones'
import type { Faq } from '../types'
import ListaFaq from './ListaFaq'

interface PropriedadesPainelFaq {
  busca: string
  aoMudarBusca: (valor: string) => void
  itens: Faq[]
  expandidoId: string | null
  aoAlternar: (id: string) => void
  podeGerenciar: (faq: Faq) => boolean
  aoEditar: (faq: Faq) => void
  aoExcluir: (faq: Faq) => void
}

function PainelFaq({
  busca,
  aoMudarBusca,
  itens,
  expandidoId,
  aoAlternar,
  podeGerenciar,
  aoEditar,
  aoExcluir,
}: PropriedadesPainelFaq) {
  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_1px_2px_rgba(30,42,50,0.04),0_10px_22px_-16px_rgba(30,42,50,0.18)]">
      <div className="flex items-center gap-1.5 bg-[var(--bordeaux)] px-[18px] py-3">
        <IconeDuvida tamanho={14} className="text-white" />
        <span className="text-[10.5px] font-semibold tracking-wide text-white">PERGUNTAS FREQUENTES</span>
      </div>

      <div className="px-[18px] pt-[18px] pb-[18px]">
        <label className="relative mb-1 block">
          <IconeLupa
            tamanho={16}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
          />
          <input
            value={busca}
            onChange={(e) => aoMudarBusca(e.target.value)}
            placeholder="Qual é a sua dúvida?"
            className="w-full rounded-[10px] border border-slate-200 bg-white py-2.5 pr-3.5 pl-[38px] text-[13px] text-slate-800 outline-none focus:border-[var(--bordeaux)]"
          />
        </label>

        <ListaFaq
          itens={itens}
          expandidoId={expandidoId}
          aoAlternar={aoAlternar}
          podeGerenciar={podeGerenciar}
          aoEditar={aoEditar}
          aoExcluir={aoExcluir}
        />
      </div>
    </div>
  )
}

export default PainelFaq
