import type { Atividade } from './types'

// TODO integração: dados mockados localmente. backend/app/modules/logs ainda
// não expõe endpoint — quando existir, trocar o corpo de `listarAtividades`
// por uma chamada a `api` (lib/api.ts).

const ATRASO_MS = 350

function atraso<T>(valor: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ATRASO_MS))
}

const atividadesMock: Atividade[] = [
  {
    id: '1',
    criadoEm: '2026-09-03T08:12:00-03:00',
    usuarioNome: 'Marina Alencar',
    acao: 'Publicou aviso',
    detalhe: 'Nova escala de plantão administrativo',
    area: 'mural',
  },
  {
    id: '2',
    criadoEm: '2026-09-03T07:48:00-03:00',
    usuarioNome: 'Diego Matos',
    acao: 'Criou usuário',
    detalhe: 'helena.prado@decos.com.br',
    area: 'usuarios',
  },
  {
    id: '3',
    criadoEm: '2026-09-02T17:05:00-03:00',
    usuarioNome: 'Camila Nunes',
    acao: 'Enviou documento',
    detalhe: 'Punção venosa periférica',
    area: 'documentos',
  },
  {
    id: '4',
    criadoEm: '2026-09-02T15:31:00-03:00',
    usuarioNome: 'Marina Alencar',
    acao: 'Editou setor',
    detalhe: 'Centro cirúrgico · ramal 2450',
    area: 'setores',
  },
  {
    id: '5',
    criadoEm: '2026-09-02T11:20:00-03:00',
    usuarioNome: 'Rafael Lima',
    acao: 'Respondeu dúvida',
    detalhe: 'Como solicitar medicação de urgência?',
    area: 'duvidas',
  },
  {
    id: '6',
    criadoEm: '2026-09-01T19:44:00-03:00',
    usuarioNome: 'Diego Matos',
    acao: 'Removeu documento',
    detalhe: 'Acesso remoto (versão 2024)',
    area: 'documentos',
  },
  {
    id: '7',
    criadoEm: '2026-09-01T09:02:00-03:00',
    usuarioNome: 'Marina Alencar',
    acao: 'Fixou aviso',
    detalhe: 'Novo Código de Conduta',
    area: 'mural',
  },
]

export async function listarAtividades(): Promise<Atividade[]> {
  const ordenadas = [...atividadesMock].sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
  )
  return atraso(ordenadas)
}
