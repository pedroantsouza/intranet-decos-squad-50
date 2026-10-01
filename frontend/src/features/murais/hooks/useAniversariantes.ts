import { useQuery } from '@tanstack/react-query'
import { listarAniversariantesDoMes } from '../api'

export function useAniversariantes(mes: number) {
  return useQuery({
    queryKey: ['murais', 'aniversariantes', mes],
    queryFn: () => listarAniversariantesDoMes(mes),
  })
}
