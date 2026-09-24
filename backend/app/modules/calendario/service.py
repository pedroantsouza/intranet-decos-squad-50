import uuid
from datetime import date, datetime

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.permissions import UsuarioAutenticado, garantir_escopo, resolver_setor
from app.modules.calendario import repository
from app.modules.calendario.models import Evento
from app.modules.calendario.schemas import AniversarianteResposta, EventoAtualizar, EventoCriar
from app.modules.setores.service import buscar_setor

PERIODO_INVALIDO = {
    "campo": "data_fim",
    "mensagem": "Data de fim deve ser posterior à data de início",
}


def listar_eventos(
    sessao: Session,
    de: date | None = None,
    ate: date | None = None,
    setor_id: uuid.UUID | None = None,
) -> list[Evento]:
    return repository.listar(sessao, de, ate, setor_id)


def buscar_evento(sessao: Session, evento_id: uuid.UUID) -> Evento:
    evento = repository.buscar_por_id(sessao, evento_id)
    if evento is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Evento não encontrado")
    return evento


def criar_evento(sessao: Session, dados: EventoCriar, usuario: UsuarioAutenticado) -> Evento:
    _validar_periodo(dados.data_inicio, dados.data_fim)
    setor_id = resolver_setor(dados.setor_id, usuario, entidade="evento")
    buscar_setor(sessao, setor_id)
    evento = Evento(
        titulo=dados.titulo,
        descricao=dados.descricao,
        data_inicio=dados.data_inicio,
        data_fim=dados.data_fim,
        autor_id=usuario.id,
        setor_id=setor_id,
    )
    try:
        repository.adicionar(sessao, evento)
    except IntegrityError:
        sessao.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Autor do evento não encontrado")
    return buscar_evento(sessao, evento.id)


def atualizar_evento(
    sessao: Session, evento_id: uuid.UUID, dados: EventoAtualizar, usuario: UsuarioAutenticado
) -> Evento:
    evento = buscar_evento(sessao, evento_id)
    garantir_escopo(usuario, evento.setor_id)
    _validar_periodo(dados.data_inicio, dados.data_fim)
    evento.titulo = dados.titulo
    evento.descricao = dados.descricao
    evento.data_inicio = dados.data_inicio
    evento.data_fim = dados.data_fim
    repository.salvar(sessao)
    return buscar_evento(sessao, evento.id)


def deletar_evento(sessao: Session, evento_id: uuid.UUID, usuario: UsuarioAutenticado) -> None:
    evento = buscar_evento(sessao, evento_id)
    garantir_escopo(usuario, evento.setor_id)
    repository.remover(sessao, evento)


def listar_aniversariantes(sessao: Session, mes: int | None = None) -> list[AniversarianteResposta]:
    mes_alvo = mes if mes is not None else date.today().month
    return [
        AniversarianteResposta(
            id=usuario.id,
            nome=usuario.nome,
            dia=usuario.data_nascimento.day,
            setor_id=usuario.setor_id,
            setor_nome=usuario.setor.nome if usuario.setor else None,
        )
        for usuario in repository.listar_aniversariantes(sessao, mes_alvo)
    ]


def _validar_periodo(data_inicio: datetime, data_fim: datetime | None) -> None:
    if data_fim is not None and data_fim < data_inicio:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, PERIODO_INVALIDO)
