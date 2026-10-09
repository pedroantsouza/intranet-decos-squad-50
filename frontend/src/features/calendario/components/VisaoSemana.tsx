import { Fragment } from 'react'
import { DIAS_SEMANA, chaveDeData, diasDaSemana, faixaDeHoras, formatarHora, rotuloHora } from '../formatadores'
import type { Aniversariante, Evento } from '../types'

interface PropriedadesVisaoSemana {
  data: Date
  eventosPorDia: Map<string, Evento[]>
  aniversariantesDoDia: (data: Date) => Aniversariante[]
}

function VisaoSemana({ data, eventosPorDia, aniversariantesDoDia }: PropriedadesVisaoSemana) {
  const chaveHoje = chaveDeData(new Date())
  const colunas = diasDaSemana(data).map((dia) => {
    const chave = chaveDeData(dia)
    return {
      chave,
      dia,
      hoje: chave === chaveHoje,
      eventos: eventosPorDia.get(chave) ?? [],
      aniversariantes: aniversariantesDoDia(dia),
    }
  })
  const horas = faixaDeHoras(colunas.flatMap((coluna) => coluna.eventos))
  const temDiaTodo = colunas.some((coluna) => coluna.aniversariantes.length > 0)

  function classesCelula(indice: number, hoje: boolean) {
    return `flex min-w-0 flex-col gap-1 border-b border-slate-200/60 p-1 ${indice < 6 ? 'border-r' : ''} ${
      hoje ? 'bg-brand-50/60' : 'bg-white/50'
    }`
  }

  const classesRotulo =
    'border-r border-b border-slate-200/60 bg-white/40 px-2.5 py-2 text-right text-[11px] text-slate-500 tabular-nums'

  return (
    // Abaixo de lg a grade rola na horizontal dentro do card, sem esmagar os eventos.
    <div className="overflow-x-auto rounded-[10px] border border-slate-200/60">
      <div className="grid min-w-[640px] grid-cols-[64px_repeat(7,minmax(0,1fr))] lg:min-w-0">
        <span className="border-r border-b border-slate-200/60 bg-white/40" />
        {colunas.map((coluna, indice) => (
          <div
            key={coluna.chave}
            className={`border-b border-slate-200/60 py-[9px] text-center ${indice < 6 ? 'border-r' : ''} ${
              coluna.hoje ? 'bg-brand-50/80' : 'bg-white/40'
            }`}
          >
            <div className="text-[11px] tracking-wide text-slate-500">{DIAS_SEMANA[indice]}</div>
            <div className={`text-[17px] tabular-nums ${coluna.hoje ? 'font-bold text-brand-600' : 'font-medium text-slate-800'}`}>
              {String(coluna.dia.getDate()).padStart(2, '0')}
            </div>
          </div>
        ))}

        {temDiaTodo && (
          <>
            <span className={classesRotulo}>Dia todo</span>
            {colunas.map((coluna, indice) => (
              <div key={`dia-todo-${coluna.chave}`} className={classesCelula(indice, coluna.hoje)}>
                {coluna.aniversariantes.map((pessoa) => (
                  <div
                    key={pessoa.id}
                    title={`Aniversário · ${pessoa.nome}`}
                    className="min-w-0 truncate rounded-md bg-slate-900/5 px-1.5 py-[5px] text-[11px] leading-snug text-slate-700"
                  >
                    Aniversário · {pessoa.nome}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {horas.map((hora) => (
          <Fragment key={hora}>
            <span className={classesRotulo}>{rotuloHora(hora)}</span>
            {colunas.map((coluna, indice) => (
              <div key={`${hora}-${coluna.chave}`} className={`min-h-[52px] ${classesCelula(indice, coluna.hoje)}`}>
                {coluna.eventos
                  .filter((evento) => new Date(evento.dataInicio).getHours() === hora)
                  .map((evento) => (
                    <div
                      key={evento.id}
                      title={evento.titulo}
                      className="min-w-0 truncate rounded-md bg-brand-500 px-1.5 py-[5px] text-[11px] leading-snug text-white"
                    >
                      <div className="text-[10px] tabular-nums opacity-80">{formatarHora(evento.dataInicio)}</div>
                      {evento.titulo}
                    </div>
                  ))}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export default VisaoSemana
