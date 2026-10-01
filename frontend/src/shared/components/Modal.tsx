import { useEffect, useId, useRef, type ReactNode } from 'react'
import { IconeX } from './icones'

interface PropriedadesModal {
  aberto: boolean
  titulo: string
  aoFechar: () => void
  largura?: string
  /** Substitui o título visível no topo. `titulo` continua sendo o nome
   * acessível do diálogo. */
  cabecalho?: ReactNode
  /** `amplo`: mais respiro e altura mínima, para leitura de conteúdo longo. */
  variante?: 'padrao' | 'amplo'
  children: ReactNode
}

const CLASSES_VARIANTE = {
  padrao: { fundo: 'p-10', painel: 'p-6 pb-5', cabecalho: 'mb-5' },
  amplo: { fundo: 'p-12', painel: 'min-h-[600px] p-10 pb-8', cabecalho: 'mb-[22px]' },
}

function Modal({
  aberto,
  titulo,
  aoFechar,
  largura = '560px',
  cabecalho,
  variante = 'padrao',
  children,
}: PropriedadesModal) {
  const idTitulo = useId()
  const painelRef = useRef<HTMLDivElement>(null)
  // Ref para o efeito não reinscrever o listener quando o pai recria `aoFechar`.
  const aoFecharRef = useRef(aoFechar)
  useEffect(() => {
    aoFecharRef.current = aoFechar
  })

  useEffect(() => {
    if (!aberto) return
    const focoAnterior = document.activeElement as HTMLElement | null
    painelRef.current?.focus()

    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') aoFecharRef.current()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      focoAnterior?.focus()
    }
  }, [aberto])

  if (!aberto) return null

  const classes = CLASSES_VARIANTE[variante]

  return (
    <div
      onClick={aoFechar}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-800/45 ${classes.fundo}`}
    >
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={cabecalho ? undefined : idTitulo}
        aria-label={cabecalho ? titulo : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{ width: largura }}
        className={`flex max-h-full w-full max-w-full flex-col overflow-auto rounded-[10px] bg-white shadow-[0_18px_44px_-20px_rgba(30,41,59,0.32)] outline-none ${classes.painel}`}
      >
        <div className={`flex items-center gap-4 ${classes.cabecalho}`}>
          {cabecalho ?? (
            <h2 id={idTitulo} className="m-0 text-[19px] font-bold tracking-tight text-slate-900">
              {titulo}
            </h2>
          )}
          <button
            type="button"
            onClick={aoFechar}
            className="ml-auto flex text-slate-400 hover:text-[#800020]"
            title="Fechar"
          >
            <IconeX tamanho={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
