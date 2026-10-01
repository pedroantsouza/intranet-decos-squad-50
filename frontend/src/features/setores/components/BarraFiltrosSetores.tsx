import Dropdown from '../../../shared/components/Dropdown'
import { IconeFunil, IconeLupa, IconeMais } from '../../../shared/components/icones'
import type { OrdemSetores } from '../types'

interface PropriedadesBarraFiltrosSetores {
  busca: string
  aoMudarBusca: (valor: string) => void
  ordem: OrdemSetores
  aoMudarOrdem: (valor: OrdemSetores) => void
  podeCriar: boolean
  aoNovoSetor: () => void
}

const OPCOES_ORDEM = [
  { valor: 'nome', rotulo: 'Nome (A–Z)' },
  { valor: 'ramal', rotulo: 'Ramal crescente' },
]

function BarraFiltrosSetores({
  busca,
  aoMudarBusca,
  ordem,
  aoMudarOrdem,
  podeCriar,
  aoNovoSetor,
}: PropriedadesBarraFiltrosSetores) {
  return (
    <div className="mb-5 flex items-stretch gap-3.5">
      <label className="relative block flex-[0_1_430px]">
        <IconeLupa
          tamanho={16}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
        />
        <input
          value={busca}
          onChange={(e) => aoMudarBusca(e.target.value)}
          placeholder="Buscar setor ou ramal"
          className="h-full w-full rounded-[10px] border border-slate-200 bg-white py-2.5 pr-3.5 pl-[38px] text-[13px] text-slate-800 shadow-[0_1px_2px_rgba(30,42,50,0.04),0_10px_22px_-16px_rgba(30,42,50,0.18)] outline-none focus:border-[#800020]"
        />
      </label>

      <Dropdown
        rotuloPadrao="Ordenar"
        icone={<IconeFunil tamanho={15} />}
        opcoes={OPCOES_ORDEM}
        valor={ordem}
        valorPadrao="nome"
        aoMudar={(valor) => aoMudarOrdem(valor as OrdemSetores)}
      />

      {podeCriar && (
        <button
          type="button"
          onClick={aoNovoSetor}
          className="ml-auto flex flex-none items-center gap-2 whitespace-nowrap rounded-[10px] bg-[#800020] px-[18px] text-[13px] font-medium text-white hover:bg-[#3b000e]"
        >
          <IconeMais tamanho={15} />
          Novo setor
        </button>
      )}
    </div>
  )
}

export default BarraFiltrosSetores
