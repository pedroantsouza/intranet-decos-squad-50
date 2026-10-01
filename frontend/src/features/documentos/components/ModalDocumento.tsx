import { useRef, useState, type DragEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Botao from '../../../shared/components/Botao'
import Campo from '../../../shared/components/Campo'
import Input from '../../../shared/components/Input'
import Modal from '../../../shared/components/Modal'
import Select from '../../../shared/components/Select'
import { IconeNuvemEnviar } from '../../../shared/components/icones'
import { formatarTamanho } from '../formatadores'
import { useSalvarDocumento } from '../hooks/useSalvarDocumento'
import type { Documento, Setor } from '../types'

const TAMANHO_MAXIMO_BYTES = 20 * 1024 * 1024
const EXTENSOES_ACEITAS = ['pdf', 'doc', 'docx', 'xls', 'xlsx']

interface ValoresFormularioDocumento {
  titulo: string
  setorId: string
}

interface PropriedadesModalDocumento {
  aoFechar: () => void
  documentoEditando: Documento | null
  setores: Setor[]
}

function validarArquivo(arquivo: File): string | null {
  const extensao = arquivo.name.split('.').pop()?.toLowerCase() ?? ''
  if (!EXTENSOES_ACEITAS.includes(extensao)) return 'Formato não aceito. Envie PDF, DOC ou XLS.'
  if (arquivo.size > TAMANHO_MAXIMO_BYTES) return 'Arquivo maior que 20 MB.'
  return null
}

// Remontado do zero a cada abertura (key trocada pelo pai), como em
// features/murais/components/ModalAviso.tsx.
function ModalDocumento({ aoFechar, documentoEditando, setores }: PropriedadesModalDocumento) {
  const editando = !!documentoEditando
  const salvarDocumento = useSalvarDocumento()
  const entradaArquivo = useRef<HTMLInputElement>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [erroArquivo, setErroArquivo] = useState<string | null>(null)
  const [arrastando, setArrastando] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ValoresFormularioDocumento>({
    defaultValues: {
      titulo: documentoEditando?.titulo ?? '',
      setorId: documentoEditando?.setorId ?? setores[0]?.id ?? '',
    },
  })

  const titulo = useWatch({ control, name: 'titulo' })
  const valido = !!titulo?.trim() && (editando || !!arquivo)

  function selecionarArquivo(novo: File | undefined) {
    if (!novo) return
    const erro = validarArquivo(novo)
    setErroArquivo(erro)
    setArquivo(erro ? null : novo)
  }

  function aoSoltar(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault()
    setArrastando(false)
    selecionarArquivo(evento.dataTransfer.files[0])
  }

  function aoSubmeter(valores: ValoresFormularioDocumento) {
    const titulo = valores.titulo.trim()
    if (documentoEditando) {
      salvarDocumento.mutate({ id: documentoEditando.id, dados: { titulo }, arquivo }, { onSuccess: aoFechar })
    } else if (arquivo) {
      salvarDocumento.mutate(
        { dados: { titulo, descricao: '', setorId: valores.setorId, arquivo } },
        { onSuccess: aoFechar },
      )
    }
  }

  const textoArquivo = arquivo
    ? `${arquivo.name} · ${formatarTamanho(arquivo.size)}`
    : editando
      ? `Arquivo atual: ${documentoEditando.nomeArquivo}`
      : null

  return (
    <Modal aberto titulo={editando ? 'Editar documento' : 'Enviar documento'} aoFechar={aoFechar}>
      <form onSubmit={handleSubmit(aoSubmeter)} className="flex flex-col gap-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => entradaArquivo.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && entradaArquivo.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setArrastando(true)
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={aoSoltar}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-6 py-10 text-center transition-colors ${
            arrastando ? 'border-[#800020] bg-[#800020]/5' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
          }`}
        >
          <IconeNuvemEnviar tamanho={32} className="mb-1 text-[#800020]" />
          <span className="text-[15px] font-bold text-slate-900">
            {textoArquivo ?? 'Arraste arquivos para enviar'}
          </span>
          <span className="text-[13px] text-slate-500">
            {textoArquivo
              ? 'Clique ou arraste outro arquivo para substituir'
              : 'PDF, DOC ou XLS até 20 MB · ou clique para selecionar do computador'}
          </span>
          {erroArquivo && <span className="text-xs text-red-600">{erroArquivo}</span>}
          <input
            ref={entradaArquivo}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            className="hidden"
            onChange={(e) => selecionarArquivo(e.target.files?.[0])}
          />
        </div>

        <Campo rotulo="Título" erro={errors.titulo?.message}>
          <Input
            placeholder="Ex.: Higienização das mãos"
            {...register('titulo', { required: 'Informe o título.' })}
          />
        </Campo>

        {!editando && (
          <Campo rotulo="Categoria" className="w-1/2">
            <Select {...register('setorId')}>
              {setores.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.nome}
                </option>
              ))}
            </Select>
          </Campo>
        )}

        <div className="mt-2 flex justify-end gap-2.5 border-t border-slate-100 pt-[18px]">
          <Botao variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" variante="primario" disabled={!valido || salvarDocumento.isPending}>
            {salvarDocumento.isPending ? 'Enviando…' : editando ? 'Salvar alterações' : 'Publicar documento'}
          </Botao>
        </div>
      </form>
    </Modal>
  )
}

export default ModalDocumento
