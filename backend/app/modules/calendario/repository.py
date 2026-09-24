import uuid
from datetime import UTC, date, datetime, time

from sqlalchemy import extract, select
from sqlalchemy.orm import Session, selectinload

from app.modules.calendario.models import Evento
from app.modules.usuarios.models import Usuario


def listar(
    sessao: Session,
    de: date | None = None,
    ate: date | None = None,
    setor_id: uuid.UUID | None = None,
) -> list[Evento]:
    consulta = (
        select(Evento)
        .options(selectinload(Evento.autor), selectinload(Evento.setor))
        .order_by(Evento.data_inicio, Evento.titulo)
    )
    if de is not None:
        consulta = consulta.where(Evento.data_inicio >= datetime.combine(de, time.min, tzinfo=UTC))
    if ate is not None:
        consulta = consulta.where(Evento.data_inicio <= datetime.combine(ate, time.max, tzinfo=UTC))
    if setor_id is not None:
        consulta = consulta.where(Evento.setor_id == setor_id)
    return list(sessao.scalars(consulta))


def buscar_por_id(sessao: Session, evento_id: uuid.UUID) -> Evento | None:
    consulta = (
        select(Evento)
        .options(selectinload(Evento.autor), selectinload(Evento.setor))
        .where(Evento.id == evento_id)
    )
    return sessao.scalars(consulta).first()


def adicionar(sessao: Session, evento: Evento) -> None:
    sessao.add(evento)
    sessao.commit()


def salvar(sessao: Session) -> None:
    sessao.commit()


def remover(sessao: Session, evento: Evento) -> None:
    sessao.delete(evento)
    sessao.commit()


def listar_aniversariantes(sessao: Session, mes: int) -> list[Usuario]:
    consulta = (
        select(Usuario)
        .options(selectinload(Usuario.setor))
        .where(
            Usuario.ativo.is_(True),
            Usuario.data_nascimento.is_not(None),
            extract("month", Usuario.data_nascimento) == mes,
        )
        .order_by(extract("day", Usuario.data_nascimento), Usuario.nome)
    )
    return list(sessao.scalars(consulta))
