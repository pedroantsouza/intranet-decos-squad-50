import Botao from '../../../shared/components/Botao'
import Modal from '../../../shared/components/Modal'
import { IconeAlerta } from '../../../shared/components/icones'
import { useExcluirDocumento } from '../hooks/useExcluirDocumento'
import type { Documento } from '../types'

interface PropriedadesModalExcluirDocumento {
  documento: Documento
  aoFechar: () => void
}

function ModalExcluirDocumento({ documento, aoFechar }: PropriedadesModalExcluirDocumento) {
  const excluirDocumento = useExcluirDocumento()
  const excluindo = excluirDocumento.isPending

  return (
    // Fechar no meio do DELETE não cancela a requisição; trava pra não sumir o feedback.
    <Modal aberto titulo="Excluir documento" aoFechar={() => !excluindo && aoFechar()} largura="460px">
      <div className="flex gap-3.5">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-red-50 text-red-600">
          <IconeAlerta tamanho={20} />
        </span>
        <div className="min-w-0 text-[13.5px] text-slate-600">
          <p className="m-0">Tem certeza que deseja excluir este documento?</p>
          <p className="m-0 mt-2 truncate font-semibold text-slate-900" title={documento.nomeArquivo}>
            {documento.titulo}
          </p>
          <p className="m-0 truncate text-[12.5px] text-slate-500">{documento.nomeArquivo}</p>
          <p className="m-0 mt-3 text-[12.5px] text-red-600">Essa ação não pode ser desfeita.</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-[18px]">
        <Botao variante="secundario" onClick={aoFechar} disabled={excluindo}>
          Cancelar
        </Botao>
        <Botao
          variante="primario"
          onClick={() => excluirDocumento.mutate(documento.id, { onSuccess: aoFechar })}
          disabled={excluindo}
          className="!bg-red-600 hover:!bg-red-700 disabled:!bg-red-300 disabled:!text-white"
        >
          {excluindo ? 'Excluindo…' : 'Excluir documento'}
        </Botao>
      </div>
    </Modal>
  )
}

export default ModalExcluirDocumento
