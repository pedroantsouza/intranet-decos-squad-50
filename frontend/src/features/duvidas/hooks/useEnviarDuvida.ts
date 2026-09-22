import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { enviarDuvida } from '../api'

export function useEnviarDuvida() {
  return useMutation({
    mutationFn: (pergunta: string) => enviarDuvida(pergunta),
    onSuccess: () => toast.success('Dúvida enviada para a equipe responsável.'),
    onError: () => toast.error('Erro ao enviar a dúvida. Tente novamente.'),
  })
}
