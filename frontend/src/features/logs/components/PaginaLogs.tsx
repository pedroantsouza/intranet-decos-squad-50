import { useMemo, useState } from 'react'
import Dropdown from '../../../shared/components/Dropdown'
import { IconeFunil, IconeLupa } from '../../../shared/components/icones'
import { useAtividades } from '../hooks/useAtividades'
import { ROTULO_AREA, type AreaAtividade } from '../types'
import TabelaAtividades from './TabelaAtividades'

const OPCOES_AREA = [
  { valor: '', rotulo: 'Todas as áreas' },
  ...(Object.entries(ROTULO_AREA) as [AreaAtividade, string][]).map(([valor, rotulo]) => ({ valor, rotulo })),
]

function PaginaLogs() {
  const { data: atividades = [], isLoading, isError } = useAtividades()

  const [busca, setBusca] = useState('')
  const [area, setArea] = useState<AreaAtividade | ''>('')

  const atividadesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return atividades.filter((atividade) => {
      if (area && atividade.area !== area) return false
      if (!termo) return true
      const texto = `${atividade.usuarioNome} ${atividade.acao} ${atividade.detalhe} ${ROTULO_AREA[atividade.area]}`
      return texto.toLowerCase().includes(termo)
    })
  }, [atividades, busca, area])

  return (
    <div>
      <h1 className="m-0 mb-[22px] text-[31px] font-bold tracking-tight text-slate-900">Registro de atividades</h1>

      <div className="mb-5 flex items-stretch gap-3.5">
        <label className="relative block flex-[0_1_480px]">
          <IconeLupa
            tamanho={16}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por usuário, ação ou área"
            aria-label="Buscar atividades"
            className="h-full w-full rounded-[10px] border border-slate-200 bg-white py-2.5 pr-3.5 pl-[38px] text-[13px] text-slate-800 shadow-[0_1px_2px_rgba(30,42,50,0.04),0_10px_22px_-16px_rgba(30,42,50,0.18)] outline-none focus:border-[#800020]"
          />
        </label>

        <Dropdown
          rotuloPadrao="Área"
          icone={<IconeFunil tamanho={15} />}
          opcoes={OPCOES_AREA}
          valor={area}
          aoMudar={(v) => setArea(v as AreaAtividade | '')}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando registro de atividades…</p>
      ) : isError ? (
        <p className="text-sm text-red-600">Não foi possível carregar o registro de atividades. Tente novamente.</p>
      ) : (
        <TabelaAtividades atividades={atividadesFiltradas} />
      )}
    </div>
  )
}

export default PaginaLogs
