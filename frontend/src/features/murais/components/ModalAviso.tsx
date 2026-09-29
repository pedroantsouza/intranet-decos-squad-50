import { useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Botao from '../../../shared/components/Botao'
import Campo from '../../../shared/components/Campo'
import Input from '../../../shared/components/Input'
import Modal from '../../../shared/components/Modal'
import Select from '../../../shared/components/Select'
import Textarea from '../../../shared/components/Textarea'
import { IconeArquivoTexto, IconeClipe, IconeX } from '../../../shared/components/icones'
import type { Usuario } from '../../../lib/auth/tipos'
import { useSalvarAviso } from '../hooks/useSalvarAviso'
import { formatarTamanhoArquivo } from '../formatadores'
import { ROTULO_CATEGORIA, type Aviso, type CategoriaAviso, type NovoAviso, type Setor } from '../types'

interface ValoresFormularioAviso {
  titulo: string
  conteudo: string
  categoria: CategoriaAviso
  setorId: string
  fixado: boolean
}

interface AnexoLocal {
  nome: string
  tamanho: string
  arquivo?: File
}

interface PropriedadesModalAviso {
  aoFechar: () => void
  avisoEditando: Aviso | null
  setores: Setor[]
  usuario: Usuario | null
}

// Este componente só é montado enquanto o modal está aberto — quem
// controla isso é o pai (PaginaMural), que também troca a `key` a cada
// abertura para remontar o formulário do zero (evita resetar estado local
// via setState dentro de efeito, que causa re-renders em cascata).
function ModalAviso({ aoFechar, avisoEditando, setores, usuario }: PropriedadesModalAviso) {
  const editando = !!avisoEditando
  // O backend não troca o setor de um aviso existente (AvisoAtualizar não tem setor_id).
  const setorTravado = usuario?.role === 'admin_setor' || editando
  const salvarAviso = useSalvarAviso()
  const inputArquivoRef = useRef<HTMLInputElement>(null)
  const [anexos, setAnexos] = useState<AnexoLocal[]>(
    () => avisoEditando?.anexos.map((a) => ({ nome: a.nome, tamanho: a.tamanho })) ?? [],
  )
  const [arrastando, setArrastando] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ValoresFormularioAviso>({
    defaultValues: {
      titulo: avisoEditando?.titulo ?? '',
      conteudo: avisoEditando?.conteudo ?? '',
      categoria: avisoEditando?.categoria ?? 'comunicado',
      setorId: avisoEditando?.setorId ?? usuario?.setorId ?? setores[0]?.id ?? '',
      fixado: avisoEditando?.fixado ?? false,
    },
  })

  const [titulo, conteudo] = useWatch({ control, name: ['titulo', 'conteudo'] })
  const valido = !!titulo?.trim() && !!conteudo?.trim()

  function adicionarAnexos(lista: FileList | null) {
    if (!lista || lista.length === 0) return
    const novos = Array.from(lista).map((arquivo) => ({
      nome: arquivo.name,
      tamanho: formatarTamanhoArquivo(arquivo.size),
      arquivo,
    }))
    setAnexos((atual) => [...atual, ...novos])
  }

  function removerAnexo(indice: number) {
    setAnexos((atual) => atual.filter((_, i) => i !== indice))
  }

  function aoSubmeter(valores: ValoresFormularioAviso) {
    // TODO integração: `chave_imagem` no backend é a chave do objeto no
    // MinIO (até 500 caracteres), não o arquivo em si. Enquanto não houver
    // rota de upload, os anexos ficam só no formulário e a capa atual do
    // aviso é mantida como está.
    const dados: NovoAviso = {
      titulo: valores.titulo.trim(),
      conteudo: valores.conteudo.trim(),
      categoria: valores.categoria,
      setorId: valores.setorId,
      fixado: valores.fixado,
      chaveImagem: avisoEditando?.chaveImagem ?? null,
    }

    salvarAviso.mutate(
      { id: avisoEditando?.id, dados },
      { onSuccess: aoFechar },
    )
  }

  return (
    <Modal aberto titulo={editando ? 'Editar aviso' : 'Novo aviso'} aoFechar={aoFechar}>
      <form onSubmit={handleSubmit(aoSubmeter)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] tracking-wide text-slate-500">ANEXOS</span>
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setArrastando(true)
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={(e) => {
              e.preventDefault()
              adicionarAnexos(e.dataTransfer.files)
              setArrastando(false)
            }}
            onClick={() => inputArquivoRef.current?.click()}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border border-dashed p-4 ${
              arrastando ? 'border-[#800020] bg-red-50/40' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <IconeClipe tamanho={20} className="text-[#800020]" />
            <div className="flex flex-col leading-snug">
              <span className="text-[13px] font-semibold text-slate-800">
                {arrastando ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
              </span>
              <span className="text-[11.5px] text-slate-500">PDF, imagem, DOC ou XLS até 20 MB</span>
            </div>
            <input
              ref={inputArquivoRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => adicionarAnexos(e.target.files)}
            />
          </div>
          {anexos.length > 0 && (
            <div className="flex flex-col gap-2">
              {anexos.map((anexo, i) => (
                <div key={`${anexo.nome}-${i}`} className="flex items-center gap-2.5 rounded-lg bg-slate-100 px-3 py-2.5">
                  <IconeArquivoTexto tamanho={16} className="text-[#800020]" />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-slate-800">
                    {anexo.nome}
                  </span>
                  <span className="text-[11px] text-slate-500">{anexo.tamanho}</span>
                  <button
                    type="button"
                    onClick={() => removerAnexo(i)}
                    title="Remover"
                    className="flex text-slate-400 hover:text-red-600"
                  >
                    <IconeX tamanho={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Campo rotulo="Título" erro={errors.titulo?.message}>
          <Input
            placeholder="Ex.: Nova escala de plantão administrativo"
            {...register('titulo', { required: 'Informe um título.' })}
          />
        </Campo>

        <div className="grid grid-cols-2 gap-4">
          <Campo rotulo="Categoria">
            <Select {...register('categoria')}>
              {Object.entries(ROTULO_CATEGORIA).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </Select>
          </Campo>
          <Campo rotulo="Setor">
            <Select {...register('setorId')} disabled={setorTravado}>
              {setores.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.nome}
                </option>
              ))}
            </Select>
          </Campo>
        </div>

        <Campo rotulo="Conteúdo" erro={errors.conteudo?.message}>
          <Textarea
            className="h-[132px]"
            placeholder="Escreva o comunicado…"
            {...register('conteudo', { required: 'Escreva o conteúdo do aviso.' })}
          />
        </Campo>

        <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-slate-700">
          <input type="checkbox" className="h-[15px] w-[15px] accent-[#800020]" {...register('fixado')} />
          Fixar no topo do mural
        </label>

        <div className="mt-2 flex justify-end gap-2.5 border-t border-slate-100 pt-[18px]">
          <Botao variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao
            type="submit"
            variante="primario"
            disabled={!valido || salvarAviso.isPending}
          >
            {editando ? 'Salvar alterações' : 'Publicar aviso'}
          </Botao>
        </div>
      </form>
    </Modal>
  )
}

export default ModalAviso
