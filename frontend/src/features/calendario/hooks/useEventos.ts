import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listarEventos } from '../api'
import type { FiltroEventos } from '../types'

export function useEventos(filtro: FiltroEventos = {}) {
  return useQuery({
    queryKey: ['calendario', 'eventos', filtro],
    queryFn: () => listarEventos(filtro),
    placeholderData: keepPreviousData,
  })
}
