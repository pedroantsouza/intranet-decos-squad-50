import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { excluirDocumento } from '../api'

export function useExcluirDocumento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => excluirDocumento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      toast.success('Documento excluído.')
    },
    onError: () => toast.error('Erro ao excluir o documento. Tente novamente.'),
  })
}
