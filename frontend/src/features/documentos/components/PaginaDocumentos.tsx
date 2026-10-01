import { useMemo, useState } from 'react'
import { useAuth } from '../../../lib/auth/useAuth'
import { podeEditar, podeGerenciarConteudo } from '../../../lib/permissions'
import Botao from '../../../shared/components/Botao'
import Dropdown from '../../../shared/components/Dropdown'
import { IconeEnviar, IconeFunil, IconeLupa } from '../../../shared/components/icones'
import { useBaixarDocumento } from '../hooks/useBaixarDocumento'
import { useDocumentos } from '../hooks/useDocumentos'
import { useSetoresDocumentos } from '../hooks/useSetoresDocumentos'
import { ROTULOS_CATEGORIA, type CategoriaDocumento, type Documento } from '../types'
import LinhaDocumento, { COLUNAS_TABELA } from './LinhaDocumento'
import ModalDocumento from './ModalDocumento'
import ModalExcluirDocumento from './ModalExcluirDocumento'
import ModalPreviaDocumento from './ModalPreviaDocumento'

// Busca sem diferenciar maiúsculas nem acentos ("higienizacao" acha "Higienização").
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function PaginaDocumentos() {
  const { usuario } = useAuth()
  const [busca, setBusca] = useState('')
  const [setorId, setSetorId] = useState('')
  const [categoria, setCategoria] = useState<CategoriaDocumento | ''>('')

  // Setor e categoria filtram no backend; a busca por texto fica local pra
  // ignorar acentos e não disparar requisição a cada tecla.
  const { data: documentos = [], isLoading, isError } = useDocumentos({ setorId, categoria })
  const { data: setores = [] } = useSetoresDocumentos()
  const baixarDocumento = useBaixarDocumento()

  const [modalAberto, setModalAberto] = useState(false)
  const [documentoEditando, setDocumentoEditando] = useState<Documento | null>(null)
  const [documentoExcluindo, setDocumentoExcluindo] = useState<Documento | null>(null)
  const [documentoPrevia, setDocumentoPrevia] = useState<Documento | null>(null)

  const podeCriar = podeGerenciarConteudo(usuario)
  // admin_setor só publica no próprio setor; superadmin em qualquer um.
  const setoresPermitidos =
    usuario?.role === 'admin_setor' ? setores.filter((s) => s.id === usuario.setorId) : setores

  const opcoesCategoria = [
    { valor: '', rotulo: 'Todas as categorias' },
    ...Object.entries(ROTULOS_CATEGORIA).map(([valor, rotulo]) => ({ valor, rotulo })),
  ]
  const opcoesSetor = [{ valor: '', rotulo: 'Todos os setores' }, ...setores.map((s) => ({ valor: s.id, rotulo: s.nome }))]

  // Título ou palavra-chave: cada palavra digitada precisa aparecer no
  // título, na descrição, no nome do arquivo ou na categoria.
  const documentosFiltrados = useMemo(() => {
    const palavras = normalizar(busca).split(/\s+/).filter(Boolean)
    if (palavras.length === 0) return documentos
    return documentos.filter((documento) => {
      const texto = normalizar(
        `${documento.titulo} ${documento.descricao ?? ''} ${documento.nomeArquivo} ${documento.setorNome} ${ROTULOS_CATEGORIA[documento.categoria]}`,
      )
      return palavras.every((palavra) => texto.includes(palavra))
    })
  }, [documentos, busca])

  function podeGerenciarEste(documento: Documento) {
    return usuario ? podeEditar(usuario, { setorId: documento.setorId }) : false
  }

  function abrirNovo() {
    setDocumentoEditando(null)
    setModalAberto(true)
  }

  function abrirEdicao(documento: Documento) {
    setDocumentoEditando(documento)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setDocumentoEditando(null)
  }

  return (
    <div>
      <h1 className="m-0 mb-[22px] text-[24px] sm:text-[31px] font-bold tracking-tight text-slate-900">POPs &amp; documentos</h1>

      <div className="mb-5 flex flex-wrap items-stretch gap-3.5">
        <label className="relative block w-full sm:w-auto sm:flex-[0_1_320px]">
          <IconeLupa
            tamanho={16}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título ou palavra-chave"
            className="h-full w-full rounded-[10px] border border-slate-200 bg-white py-2.5 pr-3.5 pl-[38px] text-[13px] text-slate-800 shadow-[0_1px_2px_rgba(30,42,50,0.04),0_10px_22px_-16px_rgba(30,42,50,0.18)] outline-none focus:border-[#800020]"
          />
        </label>

        <Dropdown
          rotuloPadrao="Categoria"
          icone={<IconeFunil tamanho={15} />}
          opcoes={opcoesCategoria}
          valor={categoria}
          aoMudar={(valor) => setCategoria(valor as CategoriaDocumento | '')}
        />

        <Dropdown
          rotuloPadrao="Setor"
          icone={<IconeFunil tamanho={15} />}
          opcoes={opcoesSetor}
          valor={setorId}
          aoMudar={setSetorId}
        />

        {podeCriar && (
          <Botao variante="primario" onClick={abrirNovo} className="flex w-full flex-none items-center justify-center gap-2 whitespace-nowrap sm:ml-auto sm:w-auto">
            <IconeEnviar tamanho={15} />
            Enviar documento
          </Botao>
        )}
      </div>

      <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_1px_2px_rgba(30,42,50,0.04),0_10px_22px_-16px_rgba(30,42,50,0.18)]">
        <div
          className={`hidden ${COLUNAS_TABELA} bg-[#800020] px-[18px] py-3 text-[10.5px] font-semibold tracking-wide text-white`}
        >
          <span>DOCUMENTO</span>
          <span>CATEGORIA</span>
          <span>ATUALIZADO</span>
          <span>AÇÕES</span>
        </div>

        {isLoading ? (
          <p className="m-0 px-[18px] py-4 text-sm text-slate-500">Carregando documentos…</p>
        ) : isError ? (
          <p className="m-0 px-[18px] py-4 text-sm text-red-600">
            Não foi possível carregar os documentos. Tente novamente.
          </p>
        ) : documentosFiltrados.length === 0 ? (
          <p className="m-0 px-[18px] py-4 text-sm text-slate-500">
            {busca.trim() || setorId || categoria
              ? 'Nenhum documento encontrado com esses filtros.'
              : 'Nenhum documento publicado ainda.'}
          </p>
        ) : (
          <ul className="m-0 list-none p-0">
            {documentosFiltrados.map((documento) => (
              <LinhaDocumento
                key={documento.id}
                documento={documento}
                podeGerenciar={podeGerenciarEste(documento)}
                aoVisualizar={() => setDocumentoPrevia(documento)}
                aoBaixar={() => baixarDocumento.mutate({ documento })}
                aoEditar={() => abrirEdicao(documento)}
                aoExcluir={() => setDocumentoExcluindo(documento)}
              />
            ))}
          </ul>
        )}
      </div>

      {modalAberto && (
        <ModalDocumento
          key={documentoEditando?.id ?? 'novo'}
          aoFechar={fecharModal}
          documentoEditando={documentoEditando}
          setores={setoresPermitidos}
          escolheSetor={usuario?.role === 'superadmin'}
        />
      )}

      {documentoPrevia && (
        <ModalPreviaDocumento
          key={documentoPrevia.id}
          documento={documentoPrevia}
          aoFechar={() => setDocumentoPrevia(null)}
        />
      )}

      {documentoExcluindo && (
        <ModalExcluirDocumento
          key={documentoExcluindo.id}
          documento={documentoExcluindo}
          aoFechar={() => setDocumentoExcluindo(null)}
        />
      )}
    </div>
  )
}

export default PaginaDocumentos
