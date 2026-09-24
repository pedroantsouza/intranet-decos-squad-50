import { useQueries } from '@tanstack/react-query'
import { listarAniversariantes } from '../api'
import type { Aniversariante } from '../types'

export function useAniversariantes(meses: number[]) {
  return useQueries({
    queries: meses.map((mes) => ({
      queryKey: ['calendario', 'aniversariantes', mes],
      queryFn: () => listarAniversariantes(mes),
    })),
    combine: (resultados) => {
      const porMes = new Map<number, Aniversariante[]>()
      resultados.forEach((resultado, indice) => porMes.set(meses[indice], resultado.data ?? []))
      return porMes
    },
  })
}
