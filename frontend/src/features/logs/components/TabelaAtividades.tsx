import { formatarDataHora } from '../formatadores'
import { ROTULO_AREA, type Atividade } from '../types'

interface PropriedadesTabelaAtividades {
  atividades: Atividade[]
}

function TabelaAtividades({ atividades }: PropriedadesTabelaAtividades) {
  return (
    <div className="overflow-hidden rounded-[14px] bg-white shadow-[0_1px_2px_rgba(30,42,50,0.04),0_10px_22px_-16px_rgba(30,42,50,0.18)]">
      <table className="w-full border-collapse text-left">
        <thead className="bg-[#800020] text-white">
          <tr className="text-[11.5px] font-medium tracking-[0.06em] uppercase">
            <th className="w-[19%] px-6 py-3.5 font-medium">Data</th>
            <th className="w-[22%] px-6 py-3.5 font-medium">Usuário</th>
            <th className="px-6 py-3.5 font-medium">Ação</th>
            <th className="w-[16%] px-6 py-3.5 font-medium">Área</th>
          </tr>
        </thead>
        <tbody>
          {atividades.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-[13px] text-slate-400">
                Nenhuma atividade encontrada.
              </td>
            </tr>
          ) : (
            atividades.map((atividade) => (
              <tr key={atividade.id} className="border-b border-slate-100 last:border-b-0 even:bg-slate-50/60">
                <td className="px-6 py-4 font-mono text-[13px] whitespace-nowrap text-slate-500">
                  <time dateTime={atividade.criadoEm}>{formatarDataHora(atividade.criadoEm)}</time>
                </td>
                <td className="px-6 py-4 text-[13.5px] font-medium text-slate-900">{atividade.usuarioNome}</td>
                <td className="px-6 py-4">
                  <p className="m-0 text-[13.5px] text-slate-800">{atividade.acao}</p>
                  <p className="m-0 mt-0.5 text-[12.5px] text-slate-500">{atividade.detalhe}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[12px] text-slate-600">
                    {ROTULO_AREA[atividade.area]}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default TabelaAtividades
