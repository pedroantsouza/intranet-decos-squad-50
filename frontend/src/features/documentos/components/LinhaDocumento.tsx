import { IconeBaixar, IconeLapis, IconeLixeira } from '../../../shared/components/icones'
import { coresExtensao, extensaoArquivo, formatarData } from '../formatadores'
import type { Documento } from '../types'

interface PropriedadesLinhaDocumento {
  documento: Documento
  podeGerenciar: boolean
  aoVisualizar: () => void
  aoBaixar: () => void
  aoEditar: () => void
  aoExcluir: () => void
}

export const COLUNAS_TABELA = 'grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.7fr)_200px] items-center gap-4'

function LinhaDocumento({
  documento,
  podeGerenciar,
  aoVisualizar,
  aoBaixar,
  aoEditar,
  aoExcluir,
}: PropriedadesLinhaDocumento) {
  const extensao = extensaoArquivo(documento.nomeArquivo)

  return (
    <li className={`${COLUNAS_TABELA} border-b border-slate-100 px-[18px] py-3.5 last:border-b-0 even:bg-slate-50`}>
      <div className="flex min-w-0 items-center gap-3.5">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold ${coresExtensao(extensao)}`}
        >
          {extensao}
        </span>
        <button
          type="button"
          onClick={aoVisualizar}
          title={documento.descricao ?? documento.nomeArquivo}
          className="min-w-0 cursor-pointer truncate text-left text-[13.5px] font-semibold text-slate-900 hover:text-[#800020]"
        >
          {documento.titulo}
        </button>
      </div>

      <span className="truncate text-[13px] text-slate-600">{documento.setorNome}</span>

      <span className="text-[12px] text-slate-500">{formatarData(documento.atualizadoEm ?? documento.criadoEm)}</span>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {podeGerenciar && (
            <>
              <button
                type="button"
                onClick={aoEditar}
                title="Editar"
                aria-label="Editar"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <IconeLapis tamanho={15} />
              </button>
              <button
                type="button"
                onClick={aoExcluir}
                title="Excluir"
                aria-label="Excluir"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-600"
              >
                <IconeLixeira tamanho={15} />
              </button>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={aoBaixar}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#800020] transition-colors hover:border-[#800020] hover:bg-[#800020]/5"
        >
          <IconeBaixar tamanho={15} />
          Baixar
        </button>
      </div>
    </li>
  )
}

export default LinhaDocumento
