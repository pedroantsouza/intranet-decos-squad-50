import { api } from '../../lib/api'
import type { Aviso, CategoriaAviso, EdicaoAviso, NovoAviso, Setor } from './types'

interface AvisoApi {
  id: string
  titulo: string
  conteudo: string
  categoria: CategoriaAviso
  fixado: boolean
  chave_imagem: string | null
  setor_id: string
  setor_nome: string
  autor_id: string
  autor_nome: string
  criado_em: string
  atualizado_em: string | null
}

interface SetorApi {
  id: string
  nome: string
}

function paraAviso(bruto: AvisoApi): Aviso {
  return {
    id: bruto.id,
    titulo: bruto.titulo,
    conteudo: bruto.conteudo,
    chaveImagem: bruto.chave_imagem,
    categoria: bruto.categoria,
    fixado: bruto.fixado,
    autorId: bruto.autor_id,
    autorNome: bruto.autor_nome,
    setorId: bruto.setor_id,
    setorNome: bruto.setor_nome,
    // Anexos ainda não têm rota no backend (upload depende do MinIO).
    anexos: [],
    criadoEm: bruto.criado_em,
    atualizadoEm: bruto.atualizado_em,
  }
}

// Só manda o que foi informado: no PUT o backend aplica apenas os campos
// presentes. O setor não é editável depois de criado (AvisoAtualizar não
// aceita setor_id), então só vai no POST.
function paraCorpoAviso(dados: NovoAviso | EdicaoAviso, incluirSetor: boolean) {
  return {
    ...(dados.titulo !== undefined ? { titulo: dados.titulo } : {}),
    ...(dados.conteudo !== undefined ? { conteudo: dados.conteudo } : {}),
    ...(dados.categoria !== undefined ? { categoria: dados.categoria } : {}),
    ...(dados.fixado !== undefined ? { fixado: dados.fixado } : {}),
    ...(dados.chaveImagem !== undefined ? { chave_imagem: dados.chaveImagem } : {}),
    ...(incluirSetor && dados.setorId ? { setor_id: dados.setorId } : {}),
  }
}

export async function listarAvisos(): Promise<Aviso[]> {
  const { data } = await api.get<AvisoApi[]>('/murais/avisos')
  return data.map(paraAviso)
}

export async function buscarAviso(id: string): Promise<Aviso> {
  const { data } = await api.get<AvisoApi>(`/murais/avisos/${id}`)
  return paraAviso(data)
}

export async function criarAviso(dados: NovoAviso): Promise<Aviso> {
  const { data } = await api.post<AvisoApi>('/murais/avisos', paraCorpoAviso(dados, true))
  return paraAviso(data)
}

export async function editarAviso(id: string, edicao: EdicaoAviso): Promise<Aviso> {
  const { data } = await api.put<AvisoApi>(`/murais/avisos/${id}`, paraCorpoAviso(edicao, false))
  return paraAviso(data)
}

export async function excluirAviso(id: string): Promise<void> {
  await api.delete(`/murais/avisos/${id}`)
}

export async function listarSetores(): Promise<Setor[]> {
  const { data } = await api.get<SetorApi[]>('/setores')
  return data.map((setor) => ({ id: setor.id, nome: setor.nome }))
}
