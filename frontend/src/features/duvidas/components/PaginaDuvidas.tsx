import { useMemo, useState, type CSSProperties } from 'react'
import { useAuth } from '../../../lib/auth/useAuth'
import { podeEditar, podeGerenciarConteudo } from '../../../lib/permissions'
import Botao from '../../../shared/components/Botao'
import { IconeMais } from '../../../shared/components/icones'
import { useExcluirFaq } from '../hooks/useExcluirFaq'
import { useFaq } from '../hooks/useFaq'
import { useSetoresDuvidas } from '../hooks/useSetoresDuvidas'
import type { Faq } from '../types'
import ModalFaq from './ModalFaq'
import PainelEnviarDuvida from './PainelEnviarDuvida'
import PainelFaq from './PainelFaq'

// Tokens de marca (docs/.claude/rules/design-system.md) declarados aqui, e
// só aqui, porque ainda não estão em src/index.css (fora do escopo desta
// feature) — evita hex direto espalhado pelos componentes da página.
const TOKENS_MARCA = {
  '--bordeaux': '#800020',
  '--bordeaux-dark': '#3b000e',
  '--bordeaux-light': '#b33951',
} as CSSProperties

function PaginaDuvidas() {
  const { usuario } = useAuth()
  const { data: faq = [], isLoading, isError } = useFaq()
  const { data: setores = [] } = useSetoresDuvidas()
  const excluirFaq = useExcluirFaq()

  const [busca, setBusca] = useState('')
  const [expandidoId, setExpandidoId] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [faqEditando, setFaqEditando] = useState<Faq | null>(null)

  const podeCriar = podeGerenciarConteudo(usuario)

  const faqFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return faq
    return faq.filter((item) => `${item.pergunta} ${item.resposta}`.toLowerCase().includes(termo))
  }, [faq, busca])

  function podeGerenciarEstaFaq(item: Faq) {
    return usuario ? podeEditar(usuario, { setorId: item.setorId }) : false
  }

  function alternarExpandido(id: string) {
    setExpandidoId((atual) => (atual === id ? null : id))
  }

  function abrirNovaFaq() {
    setFaqEditando(null)
    setModalAberto(true)
  }

  function abrirEdicao(item: Faq) {
    setFaqEditando(item)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setFaqEditando(null)
  }

  function aoExcluir(item: Faq) {
    if (window.confirm(`Excluir a pergunta "${item.pergunta}"? Essa ação não pode ser desfeita.`)) {
      excluirFaq.mutate(item.id)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Carregando central de dúvidas…</p>
  }

  if (isError) {
    return <p className="text-sm text-red-600">Não foi possível carregar a FAQ. Tente novamente.</p>
  }

  return (
    <div style={TOKENS_MARCA}>
      <div className="mb-[22px] flex items-center justify-between">
        <h1 className="m-0 text-[31px] font-bold tracking-tight text-slate-900">Central de dúvidas</h1>
        {podeCriar && (
          <Botao variante="primario" onClick={abrirNovaFaq} className="flex items-center gap-2">
            <IconeMais tamanho={15} />
            Nova dúvida
          </Botao>
        )}
      </div>

      <div className="flex items-start gap-[22px]">
        <PainelFaq
          busca={busca}
          aoMudarBusca={setBusca}
          itens={faqFiltrada}
          expandidoId={expandidoId}
          aoAlternar={alternarExpandido}
          podeGerenciar={podeGerenciarEstaFaq}
          aoEditar={abrirEdicao}
          aoExcluir={aoExcluir}
        />
        <PainelEnviarDuvida />
      </div>

      {modalAberto && (
        <ModalFaq key={faqEditando?.id ?? 'novo'} aoFechar={fecharModal} faqEditando={faqEditando} setores={setores} />
      )}
    </div>
  )
}

export default PaginaDuvidas
