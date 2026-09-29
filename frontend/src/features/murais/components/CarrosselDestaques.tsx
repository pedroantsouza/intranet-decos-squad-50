import { useState } from 'react'
import { IconeCaretLeft, IconeCaretRight } from '../../../shared/components/icones'
import { formatarDiaMes, formatarHora } from '../formatadores'
import BadgeCategoria from './BadgeCategoria'
import type { Aviso } from '../types'

interface PropriedadesCarrossel {
  destaques: Aviso[]
  aoAbrir: (aviso: Aviso) => void
}

function CarrosselDestaques({ destaques, aoAbrir }: PropriedadesCarrossel) {
  const [indice, setIndice] = useState(0)

  if (destaques.length === 0) return null

  const total = destaques.length
  const anterior = () => setIndice((i) => (i - 1 + total) % total)
  const proximo = () => setIndice((i) => (i + 1) % total)

  return (
    <div className="relative mb-6 h-[400px] overflow-hidden rounded-[10px] bg-slate-800">
      {destaques.map((aviso, i) => (
        <button
          key={aviso.id}
          type="button"
          onClick={() => aoAbrir(aviso)}
          className="absolute inset-0 text-left transition-opacity duration-500"
          style={{ opacity: i === indice ? 1 : 0, pointerEvents: i === indice ? 'auto' : 'none' }}
        >
          <div
            className="absolute inset-0 bg-slate-700 bg-cover bg-center"
            style={
              aviso.urlImagem
                ? { backgroundImage: `url(${aviso.urlImagem})` }
                : { background: 'linear-gradient(135deg,#1e293b,#3b000e)' }
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-slate-900/5" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 p-8">
            <div className="flex items-center gap-3 text-[10.5px] tracking-wide text-white/80">
              <BadgeCategoria
                categoria={aviso.categoria}
                comImagem={!!aviso.urlImagem}
                className="bg-white/15"
              />
              <span>
                {formatarDiaMes(aviso.criadoEm)} · {formatarHora(aviso.criadoEm)}
              </span>
            </div>
            <h2 className="m-0 max-w-xl text-[26px] font-bold leading-tight tracking-tight text-white text-balance">
              {aviso.titulo}
            </h2>
            <span className="text-[12.5px] text-white/75">{aviso.autorNome}</span>
          </div>
        </button>
      ))}

      <div className="absolute bottom-5 right-5 flex items-center gap-3.5">
        <div className="flex gap-1.5">
          {destaques.map((aviso, i) => (
            <button
              key={aviso.id}
              type="button"
              title={aviso.titulo}
              onClick={() => setIndice(i)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === indice ? '22px' : '6px',
                background: i === indice ? '#ffffff' : 'rgba(255,255,255,0.42)',
              }}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={anterior}
            title="Anterior"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <IconeCaretLeft tamanho={16} />
          </button>
          <button
            type="button"
            onClick={proximo}
            title="Próximo"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <IconeCaretRight tamanho={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CarrosselDestaques
