import type { ErroCampo, Setor } from '../../shared/types'

export type { ErroCampo, Setor }

/**
 * Modelo alinhado a `AvisoResposta` de backend/app/modules/murais/schemas.py,
 * já em camelCase (a conversão fica em ./api.ts).
 *
 * `anexos` ainda não existe no backend — só vive no formulário até o upload
 * (MinIO) ganhar rota. Ver features/murais/api.ts.
 */
export type CategoriaAviso = 'comunicado' | 'promocao' | 'evento'

export const ROTULO_CATEGORIA: Record<CategoriaAviso, string> = {
  comunicado: 'Comunicado',
  promocao: 'Promoção',
  evento: 'Evento',
}

export interface Anexo {
  nome: string
  tamanho: string
}

export interface Aviso {
  id: string
  titulo: string
  conteudo: string
  chaveImagem: string | null
  categoria: CategoriaAviso
  fixado: boolean
  autorId: string
  autorNome: string
  setorId: string
  setorNome: string
  anexos: Anexo[]
  criadoEm: string
  atualizadoEm: string | null
}

export interface NovoAviso {
  titulo: string
  conteudo: string
  categoria: CategoriaAviso
  setorId: string
  fixado: boolean
  chaveImagem?: string | null
  anexos?: Anexo[]
}

export type EdicaoAviso = Partial<NovoAviso>
