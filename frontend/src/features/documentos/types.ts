/**
 * Contrato baseado no router de backend/app/modules/documentos. Os schemas
 * (DocumentoResposta, FiltroDocumentos, DocumentoCriar, DocumentoAtualizar)
 * ainda não estão no repositório — os nomes de campo em `api.ts` assumem o
 * mesmo padrão snake_case de murais e devem ser conferidos quando entrarem.
 */
export interface Setor {
  id: string
  nome: string
}

export interface Documento {
  id: string
  titulo: string
  descricao: string | null
  setorId: string
  setorNome: string
  nomeArquivo: string
  tipoConteudo: string
  tamanhoBytes: number
  autorNome: string | null
  criadoEm: string
  atualizadoEm: string | null
}

export interface FiltroDocumentos {
  busca?: string
  setorId?: string
}

export interface NovoDocumento {
  titulo: string
  descricao: string
  setorId: string
  arquivo: File
}

export interface EdicaoDocumento {
  titulo?: string
  descricao?: string
}

/** Contrato de erro de validação de campo vindo do backend, conforme
 * docs/arquitetura-frontend.md. */
export interface ErroCampo {
  campo: string
  mensagem: string
}
