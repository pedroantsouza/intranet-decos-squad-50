import type { ErroCampo, Setor } from '../../shared/types'

export type { ErroCampo, Setor }

/**
 * Modelo alinhado a `AvisoResposta` de backend/app/modules/murais/schemas.py,
 * já em camelCase (a conversão fica em ./api.ts).
 */
export type CategoriaAviso = 'comunicado' | 'promocao' | 'evento'

export const ROTULO_CATEGORIA: Record<CategoriaAviso, string> = {
  comunicado: 'Comunicado',
  promocao: 'Promoção',
  evento: 'Evento',
}

/** Limites de backend/app/modules/murais/service.py e core/arquivos.py. */
export const TIPOS_IMAGEM = ['image/png', 'image/jpeg', 'image/webp']
export const LIMITE_IMAGEM_MB = 5
export const EXTENSOES_ANEXO = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.odt', '.ods', '.odp', '.txt', '.png', '.jpg', '.jpeg',
]
export const MAXIMO_ANEXOS = 10
// TAMANHO_MAXIMO_UPLOAD_MB do backend e client_max_body_size do nginx: vale por arquivo e
// também para a requisição inteira, que na criação leva capa e anexos juntos.
export const LIMITE_UPLOAD_MB = 50

export interface Anexo {
  id: string
  nome: string
  tamanho: string
  tipoConteudo: string
}

export interface Aviso {
  id: string
  titulo: string
  conteudo: string
  /** URL pública da capa, já com `?v=` para furar o cache quando a capa muda. */
  urlImagem: string | null
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
  imagem?: File | null
  anexos?: File[]
}

/** Só o texto; capa e anexos mudam por rotas próprias (ver hooks/useSalvarAviso.ts). */
export type EdicaoAviso = Partial<Omit<NovoAviso, 'imagem' | 'anexos'>>
