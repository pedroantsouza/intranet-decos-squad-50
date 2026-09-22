import { useForm, useWatch } from 'react-hook-form'
import Botao from '../../../shared/components/Botao'
import Textarea from '../../../shared/components/Textarea'
import { useEnviarDuvida } from '../hooks/useEnviarDuvida'

interface ValoresEnvioDuvida {
  pergunta: string
}

// Ícone de balão de mensagem — só usado aqui, por isso não foi adicionado
// a shared/components/icones.tsx (fora do escopo desta feature).
function IconeMensagem() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-white"
    >
      <path d="M4 5h16v11H8l-4 4V5Z" />
    </svg>
  )
}

function PainelEnviarDuvida() {
  const enviarDuvida = useEnviarDuvida()
  const {
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<ValoresEnvioDuvida>({ defaultValues: { pergunta: '' } })

  const pergunta = useWatch({ control, name: 'pergunta' })
  const valido = !!pergunta?.trim()

  function aoSubmeter(valores: ValoresEnvioDuvida) {
    enviarDuvida.mutate(valores.pergunta.trim(), { onSuccess: () => reset() })
  }

  return (
    <div className="flex w-[300px] flex-none flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_1px_2px_rgba(30,42,50,0.04),0_10px_22px_-16px_rgba(30,42,50,0.18)]">
      <div className="flex items-center gap-1.5 bg-[var(--bordeaux)] px-[18px] py-3">
        <IconeMensagem />
        <span className="text-[10.5px] font-semibold tracking-wide text-white">NÃO ENCONTROU?</span>
      </div>

      <form onSubmit={handleSubmit(aoSubmeter)} className="flex flex-col gap-3.5 px-[18px] py-[18px]">
        <p className="m-0 text-[12.5px] leading-relaxed text-slate-600">
          Envie sua dúvida para a equipe responsável. O prazo médio de resposta é de 1 dia útil.
        </p>
        <Textarea
          className="h-[104px]"
          placeholder="Descreva sua dúvida…"
          {...register('pergunta', { required: true })}
        />
        <Botao
          type="submit"
          variante="primario"
          className="flex w-full items-center justify-center"
          disabled={!valido || enviarDuvida.isPending}
        >
          Enviar dúvida
        </Botao>
      </form>
    </div>
  )
}

export default PainelEnviarDuvida
