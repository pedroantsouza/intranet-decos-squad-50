import { IconeCalendario, IconeLapis, IconeLixeira, IconeUsuario } from '../../../shared/components/icones'
import { formatarHora, formatarPeriodoEvento } from '../formatadores'
import BadgeCategoria from './BadgeCategoria'
import type { Aviso } from '../types'

interface PropriedadesCartaoAviso {
  aviso: Aviso
  diaTexto: string
  corPonto: string
  podeGerenciar: boolean
  aoAbrir: () => void
  aoEditar: (e: React.MouseEvent) => void
  aoExcluir: (e: React.MouseEvent) => void
}

function CartaoAviso({
  aviso,
  diaTexto,
  corPonto,
  podeGerenciar,
  aoAbrir,
  aoEditar,
  aoExcluir,
}: PropriedadesCartaoAviso) {
  return (
    <div className="grid grid-cols-[48px_20px_minmax(0,1fr)] items-start sm:grid-cols-[88px_26px_minmax(0,1fr)]">
      <div className="flex flex-col gap-0.5 pt-3.5 pr-0.5 text-right">
        {diaTexto && <span className="text-xs font-medium text-slate-800 tabular-nums">{diaTexto}</span>}
        <span className="text-[11px] tracking-wide text-slate-500 tabular-nums">{formatarHora(aviso.criadoEm)}</span>
      </div>
      <div className="relative flex justify-center self-stretch">
        <div className="absolute top-0 -bottom-[26px] w-px bg-slate-300/70" />
        <div
          className="relative mt-[18px] h-2.5 w-2.5 rounded-full"
          style={{ background: corPonto, boxShadow: '0 0 0 4px var(--color-slate-50)' }}
        />
      </div>
      <article
        onClick={aoAbrir}
        className="cursor-pointer rounded-card border border-white/80 bg-gradient-to-br from-white/90 to-white/75 p-4 shadow-[inset_0_1px_0_white,0_1px_2px_rgb(15_23_42/0.04),0_6px_20px_rgb(15_23_42/0.05)] transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_white,0_1px_2px_rgb(15_23_42/0.06),0_14px_30px_rgb(15_23_42/0.09)] sm:p-5"
      >
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex size-[30px] flex-none items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <IconeUsuario tamanho={17} />
          </span>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[13px] font-semibold text-slate-900">{aviso.autorNome}</span>
            <span className="truncate text-xs text-slate-500">{aviso.setorNome}</span>
          </div>
          <BadgeCategoria
            categoria={aviso.categoria}
            comImagem={!!aviso.urlImagem}
            className="ml-auto flex-none"
          />
        </div>
        <div className="mb-3.5 h-0.5 rounded-full bg-brand-600" />
        {aviso.urlImagem && (
          <div className="mb-3.5 rounded-[10px] bg-white/55 p-1.5 ring-1 ring-slate-200/60">
            <div
              className="h-[160px] w-full rounded-md bg-cover bg-center sm:h-[190px]"
              style={{ backgroundImage: `url(${aviso.urlImagem})` }}
            />
          </div>
        )}
        <h3 className="m-0 mb-3 text-lg leading-snug font-semibold tracking-tight text-slate-900">
          {aviso.titulo}
        </h3>
        {aviso.dataInicio && (
          <p className="m-0 mb-3 flex items-center gap-1.5 text-[13px] font-medium text-brand-600 tabular-nums">
            <IconeCalendario tamanho={16} />
            {formatarPeriodoEvento(aviso.dataInicio, aviso.dataFim)}
          </p>
        )}
        {aviso.conteudo && (
          <>
            <div className="mb-3 h-px bg-slate-200/60" />
            <p className="m-0 line-clamp-3 text-sm leading-relaxed text-balance text-slate-700">
              {aviso.conteudo}
            </p>
          </>
        )}
        {podeGerenciar && (
          <div className="mt-4 flex items-center gap-1 border-t border-slate-200/60 pt-3.5">
            <div className="ml-auto flex gap-1">
              <button
                type="button"
                onClick={aoEditar}
                title="Editar"
                className="flex size-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-700 sm:size-[30px]"
              >
                <IconeLapis tamanho={15} />
              </button>
              <button
                type="button"
                onClick={aoExcluir}
                title="Excluir"
                className="flex size-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-danger-50 hover:text-danger-600 sm:size-[30px]"
              >
                <IconeLixeira tamanho={15} />
              </button>
            </div>
          </div>
        )}
      </article>
    </div>
  )
}

export default CartaoAviso
