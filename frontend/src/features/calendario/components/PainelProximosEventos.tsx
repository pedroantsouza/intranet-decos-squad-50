import Botao from '../../../shared/components/Botao'
import { IconeCalendario, IconeLapis, IconeLixeira } from '../../../shared/components/icones'
import { formatarDiaMes, formatarHora } from '../formatadores'
import type { Evento } from '../types'

interface PropriedadesPainelProximosEventos {
  eventos: Evento[]
  podeGerenciarEvento: (evento: Evento) => boolean
  aoEditar: (evento: Evento) => void
  aoExcluir: (evento: Evento) => void
}

function descreverEvento(evento: Evento): string {
  const horario = [formatarHora(evento.dataInicio), evento.dataFim ? formatarHora(evento.dataFim) : null]
    .filter(Boolean)
    .join(' às ')
  const descricao = evento.descricao?.trim()
  return descricao ? `${horario} · ${descricao}` : horario
}

function PainelProximosEventos({
  eventos,
  podeGerenciarEvento,
  aoEditar,
  aoExcluir,
}: PropriedadesPainelProximosEventos) {
  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden surface">
      <div className="flex items-center border-b border-slate-200/60 bg-white/40 px-[18px] py-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-600">
          <IconeCalendario tamanho={16} className="text-brand-600" />
          PRÓXIMOS EVENTOS
        </span>
      </div>
      <div className="flex flex-col gap-3 px-[18px] pt-3.5 pb-[18px]">
        {eventos.length === 0 && (
          <p className="m-0 py-3 text-center text-[13px] text-slate-600">Nenhum evento programado.</p>
        )}
        {eventos.map((evento) => {
          const { dia, mes } = formatarDiaMes(evento.dataInicio)
          return (
            <div key={evento.id} className="flex gap-3">
              <div className="flex-none rounded-[10px] bg-white/55 px-0 py-[7px] text-center ring-1 ring-white/80" style={{ width: 46 }}>
                <div className="text-[15px] leading-none font-medium text-slate-900 tabular-nums">{dia}</div>
                <div className="mt-0.5 text-[10px] tracking-wide text-slate-500">{mes}</div>
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-[13px] font-semibold text-slate-900">{evento.titulo}</span>
                <span className="truncate text-xs text-slate-500">{descreverEvento(evento)}</span>
              </div>
              {podeGerenciarEvento(evento) && (
                <div className="ml-auto flex gap-0.5 self-center">
                  <Botao variante="icone" onClick={() => aoEditar(evento)} title="Editar" className="sm:size-[26px]">
                    <IconeLapis tamanho={15} />
                  </Botao>
                  <Botao
                    variante="icone"
                    onClick={() => aoExcluir(evento)}
                    title="Excluir"
                    className="hover:bg-danger-50 hover:text-danger-600 sm:size-[26px]"
                  >
                    <IconeLixeira tamanho={15} />
                  </Botao>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PainelProximosEventos
