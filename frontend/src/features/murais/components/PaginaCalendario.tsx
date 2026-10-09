import { useMemo, useState } from 'react'
import { useAuth } from '../../../lib/auth/useAuth'
import { podeEditar, podeGerenciarConteudo } from '../../../lib/permissions'
import Botao from '../../../shared/components/Botao'
import { IconeMais } from '../../../shared/components/icones'
import {
  agruparEventosPorDia,
  deslocarPeriodo,
  intervaloDoPeriodo,
  mesesDoPeriodo,
  tituloDoPeriodo,
} from '../formatadoresCalendario'
import { useAniversariantes } from '../hooks/useAniversariantes'
import { useEventos } from '../hooks/useEventos'
import { useExcluirAviso } from '../hooks/useExcluirAviso'
import { useProximosEventos } from '../hooks/useProximosEventos'
import { useSetoresMural } from '../hooks/useSetoresMural'
import type { Aniversariante, Aviso, VisaoCalendario } from '../types'
import CabecalhoCalendario from './CabecalhoCalendario'
import ModalAviso from './ModalAviso'
import ModalDetalheAviso from './ModalDetalheAviso'
import PainelAniversariantes from './PainelAniversariantes'
import PainelProximosEventos from './PainelProximosEventos'
import VisaoAno from './VisaoAno'
import VisaoDia from './VisaoDia'
import VisaoMes from './VisaoMes'
import VisaoSemana from './VisaoSemana'

/**
 * Visão do mural que posiciona os eventos (avisos de categoria `evento`) nas suas datas
 * (MUR-15). Clicar num evento abre o mesmo detalhe de aviso do mural.
 */
function PaginaCalendario() {
  const { usuario } = useAuth()
  const [visao, setVisao] = useState<VisaoCalendario>('mes')
  const [dataReferencia, setDataReferencia] = useState(() => new Date())
  const [modalAberto, setModalAberto] = useState(false)
  const [avisoEditando, setAvisoEditando] = useState<Aviso | null>(null)
  const [detalhe, setDetalhe] = useState<Aviso | null>(null)

  const meses = useMemo(() => mesesDoPeriodo(dataReferencia, visao), [dataReferencia, visao])

  const { data: eventos = [], isLoading, isError } = useEventos(intervaloDoPeriodo(dataReferencia, visao))
  const proximosEventos = useProximosEventos()
  const aniversariantesPorMes = useAniversariantes(meses)
  const { data: setores = [] } = useSetoresMural()
  const excluirAviso = useExcluirAviso()

  const podeCriar = podeGerenciarConteudo(usuario)
  const eventosPorDia = useMemo(() => agruparEventosPorDia(eventos), [eventos])

  function aniversariantesDoDia(data: Date): Aniversariante[] {
    return (aniversariantesPorMes.get(data.getMonth() + 1) ?? []).filter((pessoa) => pessoa.dia === data.getDate())
  }

  function podeGerenciarEsteAviso(aviso: Aviso) {
    return usuario ? podeEditar(usuario, aviso) : false
  }

  function periodoAnterior() {
    setDataReferencia((atual) => deslocarPeriodo(atual, visao, -1))
  }

  function proximoPeriodo() {
    setDataReferencia((atual) => deslocarPeriodo(atual, visao, 1))
  }

  function abrirMes(mes: number) {
    setDataReferencia(new Date(dataReferencia.getFullYear(), mes, 1))
    setVisao('mes')
  }

  function abrirNovoEvento() {
    setAvisoEditando(null)
    setModalAberto(true)
  }

  function abrirEdicao(aviso: Aviso) {
    setDetalhe(null)
    setAvisoEditando(aviso)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setAvisoEditando(null)
  }

  function aoExcluir(aviso: Aviso) {
    if (window.confirm(`Excluir o evento "${aviso.titulo}"? Essa ação não pode ser desfeita.`)) {
      excluirAviso.mutate(aviso.id, { onSuccess: () => setDetalhe(null) })
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-5">
        <h1 className="m-0 text-[31px] font-bold tracking-tight text-slate-900">
          Calendário &amp; aniversariantes
        </h1>
        {podeCriar && (
          <Botao
            variante="primario"
            onClick={abrirNovoEvento}
            className="ml-auto flex items-center gap-2 whitespace-nowrap"
          >
            <IconeMais tamanho={15} />
            Novo evento
          </Botao>
        )}
      </div>

      {isLoading && <p className="mb-4 text-sm text-slate-500">Carregando eventos…</p>}

      {/* Sem o backend rodando, as chamadas à API falham e este aviso aparece;
          as visões continuam renderizando (vazias) para permitir ver o layout. */}
      {isError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Não foi possível carregar os eventos. Verifique se o backend está no ar e tente novamente.
        </p>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_316px] items-start gap-[22px]">
        <div className="rounded-[10px] bg-white p-5 shadow-[0_1px_2px_rgba(30,42,50,0.04),0_10px_22px_-16px_rgba(30,42,50,0.18)]">
          <CabecalhoCalendario
            titulo={tituloDoPeriodo(dataReferencia, visao)}
            visao={visao}
            aoMudarVisao={setVisao}
            aoAnterior={periodoAnterior}
            aoProximo={proximoPeriodo}
          />
          {visao === 'dia' && (
            <VisaoDia
              data={dataReferencia}
              eventosPorDia={eventosPorDia}
              aniversariantesDoDia={aniversariantesDoDia}
              aoAbrirEvento={setDetalhe}
            />
          )}
          {visao === 'semana' && (
            <VisaoSemana
              data={dataReferencia}
              eventosPorDia={eventosPorDia}
              aniversariantesDoDia={aniversariantesDoDia}
              aoAbrirEvento={setDetalhe}
            />
          )}
          {visao === 'mes' && (
            <VisaoMes
              ano={dataReferencia.getFullYear()}
              mes={dataReferencia.getMonth()}
              eventosPorDia={eventosPorDia}
              aniversariantesDoDia={aniversariantesDoDia}
              aoAbrirEvento={setDetalhe}
            />
          )}
          {visao === 'ano' && (
            <VisaoAno
              ano={dataReferencia.getFullYear()}
              eventosPorDia={eventosPorDia}
              aniversariantesDoDia={aniversariantesDoDia}
              aoAbrirMes={abrirMes}
            />
          )}
        </div>
        <div className="flex flex-col gap-[22px]">
          <PainelAniversariantes
            mes={dataReferencia.getMonth() + 1}
            aniversariantes={aniversariantesPorMes.get(dataReferencia.getMonth() + 1) ?? []}
          />
          <PainelProximosEventos eventos={proximosEventos} aoAbrir={setDetalhe} />
        </div>
      </div>

      {modalAberto && (
        <ModalAviso
          key={avisoEditando?.id ?? 'novo'}
          aoFechar={fecharModal}
          avisoEditando={avisoEditando}
          setores={setores}
          usuario={usuario}
          categoriaInicial="evento"
        />
      )}
      <ModalDetalheAviso
        aviso={detalhe}
        aoFechar={() => setDetalhe(null)}
        aoEditar={detalhe && podeGerenciarEsteAviso(detalhe) ? abrirEdicao : undefined}
        aoExcluir={detalhe && podeGerenciarEsteAviso(detalhe) ? aoExcluir : undefined}
      />
    </div>
  )
}

export default PaginaCalendario
