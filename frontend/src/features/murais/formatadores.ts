const MESES_ABREV = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
]

export const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

/** "2026-08-28T08:40:00" -> "28 AGO" */
export function formatarDiaMes(iso: string): string {
  const data = new Date(iso)
  return `${String(data.getDate()).padStart(2, '0')} ${MESES_ABREV[data.getMonth()]}`
}

/** "2026-08-28T08:40:00" -> "08:40" */
export function formatarHora(iso: string): string {
  const data = new Date(iso)
  return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`
}

export function formatarTamanhoArquivo(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1).replace('.', ',')} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
