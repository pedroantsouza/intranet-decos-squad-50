export interface Evento {
  id: string
  titulo: string
  descricao: string | null
  dataInicio: string
  dataFim: string | null
  setorId: string
  setorNome: string
  autorId: string
  autorNome: string
  criadoEm: string
}

export interface NovoEvento {
  titulo: string
  descricao?: string | null
  dataInicio: string
  dataFim?: string | null
  setorId?: string | null
}

export type EdicaoEvento = Omit<NovoEvento, 'setorId'>

export interface Aniversariante {
  id: string
  nome: string
  dia: number
  setorId: string | null
  setorNome: string | null
}

export interface FiltroEventos {
  de?: string
  ate?: string
  setorId?: string
}

export type VisaoCalendario = 'dia' | 'semana' | 'mes' | 'ano'
