import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { baixarArquivo } from '../api'
import type { Documento } from '../types'

interface VariaveisBaixar {
  documento: Documento
  visualizar?: boolean
}

export function useBaixarDocumento() {
  return useMutation({
    mutationFn: async ({ documento, visualizar = false }: VariaveisBaixar) => {
      // Abre a aba antes do await: depois dele o navegador bloqueia como popup.
      const aba = visualizar ? window.open('', '_blank') : null
      try {
        const blob = await baixarArquivo(documento.id, visualizar)
        const url = URL.createObjectURL(blob)
        if (aba) {
          aba.location.href = url
        } else {
          const link = document.createElement('a')
          link.href = url
          link.download = documento.nomeArquivo
          link.click()
        }
        setTimeout(() => URL.revokeObjectURL(url), 60_000)
      } catch (erro) {
        aba?.close()
        throw erro
      }
    },
    onError: () => toast.error('Não foi possível obter o arquivo. Tente novamente.'),
  })
}
