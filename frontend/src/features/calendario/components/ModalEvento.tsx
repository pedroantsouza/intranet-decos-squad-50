import { useForm, useWatch } from 'react-hook-form'
import type { Usuario } from '../../../lib/auth/tipos'
import Botao from '../../../shared/components/Botao'
import Campo from '../../../shared/components/Campo'
import Input from '../../../shared/components/Input'
import Modal from '../../../shared/components/Modal'
import Select from '../../../shared/components/Select'
import Textarea from '../../../shared/components/Textarea'
import type { Setor } from '../../../shared/types'
import { combinarDataHora, separarDataHora } from '../formatadores'
import { useSalvarEvento } from '../hooks/useSalvarEvento'
import type { EdicaoEvento, Evento, NovoEvento } from '../types'

interface ValoresFormularioEvento {
  titulo: string
  data: string
  inicio: string
  fim: string
  descricao: string
  setorId: string
}

interface PropriedadesModalEvento {
  aoFechar: () => void
  eventoEditando: Evento | null
  setores: Setor[]
  usuario: Usuario | null
}

function valoresIniciais(evento: Evento | null, usuario: Usuario | null, setores: Setor[]): ValoresFormularioEvento {
  const inicio = evento ? separarDataHora(evento.dataInicio) : null
  const fim = evento?.dataFim ? separarDataHora(evento.dataFim) : null
  return {
    titulo: evento?.titulo ?? '',
    data: inicio?.data ?? '',
    inicio: inicio?.hora ?? '',
    fim: fim?.hora ?? '',
    descricao: evento?.descricao ?? '',
    setorId: evento?.setorId ?? usuario?.setorId ?? setores[0]?.id ?? '',
  }
}

function ModalEvento({ aoFechar, eventoEditando, setores, usuario }: PropriedadesModalEvento) {
  const editando = !!eventoEditando
  const setorTravado = usuario?.role === 'admin_setor' || editando
  const salvarEvento = useSalvarEvento()

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<ValoresFormularioEvento>({
    defaultValues: valoresIniciais(eventoEditando, usuario, setores),
  })

  const [titulo, data] = useWatch({ control, name: ['titulo', 'data'] })
  const valido = !!titulo?.trim() && !!data

  function aoSubmeter(valores: ValoresFormularioEvento) {
    const base = {
      titulo: valores.titulo.trim(),
      descricao: valores.descricao.trim() || null,
      dataInicio: combinarDataHora(valores.data, valores.inicio),
      dataFim: valores.fim ? combinarDataHora(valores.data, valores.fim) : null,
    }

    const dados: NovoEvento | EdicaoEvento = editando ? base : { ...base, setorId: valores.setorId || null }

    salvarEvento.mutate({ id: eventoEditando?.id, dados }, { onSuccess: aoFechar })
  }

  return (
    <Modal aberto titulo={editando ? 'Editar evento' : 'Novo evento'} aoFechar={aoFechar}>
      <form onSubmit={handleSubmit(aoSubmeter)} className="flex flex-col gap-4">
        <Campo rotulo="Título do evento" erro={errors.titulo?.message}>
          <Input
            placeholder="Ex.: Treinamento de higienização das mãos"
            {...register('titulo', { required: 'Informe um título.' })}
          />
        </Campo>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-[1.2fr_1fr_1fr]">
          <Campo rotulo="Data" erro={errors.data?.message} className="col-span-2 sm:col-span-1">
            <Input type="date" {...register('data', { required: 'Informe a data.' })} />
          </Campo>
          <Campo rotulo="Início">
            <Input type="time" {...register('inicio')} />
          </Campo>
          <Campo rotulo="Término" erro={errors.fim?.message}>
            <Input
              type="time"
              {...register('fim', {
                validate: (fim) =>
                  !fim || !getValues('inicio') || fim >= getValues('inicio') || 'Término antes do início.',
              })}
            />
          </Campo>
        </div>

        <Campo rotulo="Setor">
          <Select {...register('setorId')} disabled={setorTravado}>
            {setores.map((setor) => (
              <option key={setor.id} value={setor.id}>
                {setor.nome}
              </option>
            ))}
          </Select>
        </Campo>

        <Campo rotulo="Descrição">
          <Textarea
            className="h-[110px]"
            placeholder="Detalhes do evento, local, público-alvo…"
            {...register('descricao')}
          />
        </Campo>

        <div className="mt-2 grid gap-2.5 border-t border-slate-200/60 pt-[18px] sm:flex sm:justify-end">
          <Botao variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" variante="primario" disabled={!valido || salvarEvento.isPending}>
            {editando ? 'Salvar alterações' : 'Criar evento'}
          </Botao>
        </div>
      </form>
    </Modal>
  )
}

export default ModalEvento
