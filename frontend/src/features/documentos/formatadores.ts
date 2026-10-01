export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export function extensaoArquivo(nomeArquivo: string): string {
  const partes = nomeArquivo.split('.')
  const extensao = partes.length > 1 ? partes.pop()!.toUpperCase() : ''
  if (extensao === 'DOCX') return 'DOC'
  if (extensao === 'XLSX') return 'XLS'
  return extensao.slice(0, 4) || 'ARQ'
}

// Cor do selo por tipo: PDF em vermelho, Word em azul, planilha em verde.
export function coresExtensao(extensao: string): string {
  if (extensao === 'DOC') return 'bg-blue-50 text-blue-700'
  if (extensao === 'XLS' || extensao === 'CSV') return 'bg-emerald-50 text-emerald-700'
  if (extensao === 'PDF') return 'bg-red-50 text-red-700'
  return 'bg-slate-100 text-slate-600'
}
