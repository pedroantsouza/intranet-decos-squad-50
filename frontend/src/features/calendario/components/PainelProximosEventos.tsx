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
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_1px_2px_rgba(30,42,50,0.04),0_10px_22px_-16px_rgba(30,42,50,0.18)]">
      <div className="flex items-center bg-[#800020] px-[18px] py-3">
        <span className="flex items-center gap-1.5 text-[10.5px] font-medium tracking-wide text-white">
          <IconeCalendario tamanho={14} />
          PRÓXIMOS EVENTOS
        </span>
      </div>
      <div className="flex flex-col gap-3 px-[18px] pt-3.5 pb-[18px]">
        {eventos.length === 0 && (
          <p className="m-0 py-3 text-center text-[12.5px] text-slate-500">Nenhum evento programado.</p>
        )}
        {eventos.map((evento) => {
          const { dia, mes } = formatarDiaMes(evento.dataInicio)
          return (
            <div key={evento.id} className="flex gap-3">
              <div className="flex-none rounded-[10px] bg-slate-50 px-0 py-[7px] text-center" style={{ width: 46 }}>
                <div className="text-[15px] leading-none font-medium text-slate-900">{dia}</div>
                <div className="mt-0.5 text-[9.5px] tracking-wide text-slate-400">{mes}</div>
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-[13px] font-semibold text-slate-900">{evento.titulo}</span>
                <span className="truncate text-[11.5px] text-slate-500">{descreverEvento(evento)}</span>
              </div>
              {podeGerenciarEvento(evento) && (
                <div className="ml-auto flex gap-0.5 self-center">
                  <Botao variante="icone" onClick={() => aoEditar(evento)} title="Editar" className="h-[26px] w-[26px]">
                    <IconeLapis tamanho={15} />
                  </Botao>
                  <Botao
                    variante="icone"
                    onClick={() => aoExcluir(evento)}
                    title="Excluir"
                    className="h-[26px] w-[26px] hover:bg-red-50 hover:text-red-600"
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
