import { useMemo, useState } from 'react'
import { useAuth } from '../../../lib/auth/useAuth'
import { podeEditar, podeGerenciarConteudo } from '../../../lib/permissions'
import Botao from '../../../shared/components/Botao'
import { IconeMais } from '../../../shared/components/icones'
import {
  agruparEventosPorDia,
  chaveDeData,
  deslocarPeriodo,
  intervaloDoPeriodo,
  mesesDoPeriodo,
  tituloDoPeriodo,
} from '../formatadores'
import { useAniversariantes } from '../hooks/useAniversariantes'
import { useEventos } from '../hooks/useEventos'
import { useExcluirEvento } from '../hooks/useExcluirEvento'
import { useSetoresCalendario } from '../hooks/useSetoresCalendario'
import type { Aniversariante, Evento, VisaoCalendario } from '../types'
import CabecalhoCalendario from './CabecalhoCalendario'
import ModalEvento from './ModalEvento'
import PainelAniversariantes from './PainelAniversariantes'
import PainelProximosEventos from './PainelProximosEventos'
import VisaoAno from './VisaoAno'
import VisaoDia from './VisaoDia'
import VisaoMes from './VisaoMes'
import VisaoSemana from './VisaoSemana'

const LIMITE_PROXIMOS_EVENTOS = 5

function PaginaCalendario() {
  const { usuario } = useAuth()
  const [visao, setVisao] = useState<VisaoCalendario>('mes')
  const [dataReferencia, setDataReferencia] = useState(() => new Date())
  const [modalAberto, setModalAberto] = useState(false)
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null)

  const meses = useMemo(() => mesesDoPeriodo(dataReferencia, visao), [dataReferencia, visao])

  const { data: eventos = [], isLoading, isError } = useEventos(intervaloDoPeriodo(dataReferencia, visao))
  const { data: eventosFuturos = [] } = useEventos({ de: chaveDeData(new Date()) })
  const aniversariantesPorMes = useAniversariantes(meses)
  const { data: setores = [] } = useSetoresCalendario()
  const excluirEvento = useExcluirEvento()

  const podeCriar = podeGerenciarConteudo(usuario)
  const eventosPorDia = useMemo(() => agruparEventosPorDia(eventos), [eventos])

  const proximosEventos = useMemo(() => {
    const inicioDeHoje = new Date()
    inicioDeHoje.setHours(0, 0, 0, 0)
    return eventosFuturos
      .filter((evento) => new Date(evento.dataInicio) >= inicioDeHoje)
      .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
      .slice(0, LIMITE_PROXIMOS_EVENTOS)
  }, [eventosFuturos])

  function aniversariantesDoDia(data: Date): Aniversariante[] {
    return (aniversariantesPorMes.get(data.getMonth() + 1) ?? []).filter((pessoa) => pessoa.dia === data.getDate())
  }

  function podeGerenciarEsteEvento(evento: Evento) {
    return usuario ? podeEditar(usuario, evento) : false
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
    setEventoEditando(null)
    setModalAberto(true)
  }

  function abrirEdicao(evento: Evento) {
    setEventoEditando(evento)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setEventoEditando(null)
  }

  function aoExcluir(evento: Evento) {
    if (window.confirm(`Excluir o evento "${evento.titulo}"? Essa ação não pode ser desfeita.`)) {
      excluirEvento.mutate(evento.id)
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
            <VisaoDia data={dataReferencia} eventosPorDia={eventosPorDia} aniversariantesDoDia={aniversariantesDoDia} />
          )}
          {visao === 'semana' && (
            <VisaoSemana data={dataReferencia} eventosPorDia={eventosPorDia} aniversariantesDoDia={aniversariantesDoDia} />
          )}
          {visao === 'mes' && (
            <VisaoMes
              ano={dataReferencia.getFullYear()}
              mes={dataReferencia.getMonth()}
              eventosPorDia={eventosPorDia}
              aniversariantesDoDia={aniversariantesDoDia}
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
            mes={dataReferencia.getMonth()}
            aniversariantes={aniversariantesPorMes.get(dataReferencia.getMonth() + 1) ?? []}
          />
          <PainelProximosEventos
            eventos={proximosEventos}
            podeGerenciarEvento={podeGerenciarEsteEvento}
            aoEditar={abrirEdicao}
            aoExcluir={aoExcluir}
          />
        </div>
      </div>

      {modalAberto && (
        <ModalEvento
          key={eventoEditando?.id ?? 'novo'}
          aoFechar={fecharModal}
          eventoEditando={eventoEditando}
          setores={setores}
          usuario={usuario}
        />
      )}
    </div>
  )
}

export default PaginaCalendario
