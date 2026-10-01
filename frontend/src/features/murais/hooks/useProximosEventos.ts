import { useQuery } from '@tanstack/react-query'
import { listarProximosEventos } from '../api'

export function useProximosEventos(de: string) {
  return useQuery({
    queryKey: ['murais', 'eventos', de],
    queryFn: () => listarProximosEventos(de),
  })
}
