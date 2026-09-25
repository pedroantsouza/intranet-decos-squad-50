import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { criarAviso, editarAviso } from '../api'
import type { EdicaoAviso, ErroCampo, NovoAviso } from '../types'

interface VariaveisSalvarAviso {
  id?: string
  dados: NovoAviso | EdicaoAviso
}

export function useSalvarAviso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dados }: VariaveisSalvarAviso) => {
      if (id) return editarAviso(id, dados)
      return criarAviso(dados as NovoAviso)
    },
    onSuccess: (_aviso, variaveis) => {
      queryClient.invalidateQueries({ queryKey: ['avisos'] })
      toast.success(variaveis.id ? 'Aviso atualizado com sucesso.' : 'Aviso publicado com sucesso.')
    },
    onError: (erro) => {
      // O backend sempre devolve `mensagem`; `campo` só vem em erro de validação.
      if (isAxiosError<Partial<ErroCampo>>(erro) && erro.response?.data?.mensagem) {
        toast.error(erro.response.data.mensagem)
      } else {
        toast.error('Erro ao salvar o aviso. Tente novamente.')
      }
    },
  })
}
