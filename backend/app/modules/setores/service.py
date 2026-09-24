import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.core.permissions import UsuarioAutenticado, garantir_escopo
from app.modules.setores.models import Ramal, Setor
from app.modules.setores.schemas import RamalAtualizar, RamalCriar, SetorAtualizar, SetorCriar

NOME_DUPLICADO = {"campo": "nome", "mensagem": "Já existe um setor com esse nome"}


# Setores


def listar_setores(sessao: Session) -> list[Setor]:
    consulta = select(Setor).options(selectinload(Setor.ramais)).order_by(Setor.nome)
    return list(sessao.scalars(consulta))


def buscar_setor(sessao: Session, setor_id: uuid.UUID) -> Setor:
    setor = sessao.get(Setor, setor_id)
    if setor is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Setor não encontrado")
    return setor


def criar_setor(sessao: Session, dados: SetorCriar) -> Setor:
    setor = Setor(nome=dados.nome)
    sessao.add(setor)
    _salvar(sessao, conflito=NOME_DUPLICADO)
    sessao.refresh(setor)
    return setor


def atualizar_setor(sessao: Session, setor_id: uuid.UUID, dados: SetorAtualizar) -> Setor:
    setor = buscar_setor(sessao, setor_id)
    setor.nome = dados.nome
    _salvar(sessao, conflito=NOME_DUPLICADO)
    return setor


def deletar_setor(sessao: Session, setor_id: uuid.UUID) -> None:
    setor = buscar_setor(sessao, setor_id)
    # Ramais caem junto (cascade); outros vínculos (usuários, documentos...) bloqueiam.
    sessao.delete(setor)
    _salvar(sessao, conflito="Setor possui registros vinculados e não pode ser removido")


# Ramais


def listar_ramais(sessao: Session, setor_id: uuid.UUID) -> list[Ramal]:
    return buscar_setor(sessao, setor_id).ramais


def criar_ramal(
    sessao: Session, setor_id: uuid.UUID, dados: RamalCriar, usuario: UsuarioAutenticado
) -> Ramal:
    setor = buscar_setor(sessao, setor_id)
    garantir_escopo(usuario, setor.id)
    ramal = Ramal(numero=dados.numero, setor_id=setor.id)
    sessao.add(ramal)
    sessao.commit()
    return ramal


def atualizar_ramal(
    sessao: Session, ramal_id: uuid.UUID, dados: RamalAtualizar, usuario: UsuarioAutenticado
) -> Ramal:
    ramal = _buscar_ramal(sessao, ramal_id)
    garantir_escopo(usuario, ramal.setor_id)
    ramal.numero = dados.numero
    sessao.commit()
    return ramal


def deletar_ramal(sessao: Session, ramal_id: uuid.UUID, usuario: UsuarioAutenticado) -> None:
    ramal = _buscar_ramal(sessao, ramal_id)
    garantir_escopo(usuario, ramal.setor_id)
    sessao.delete(ramal)
    sessao.commit()


def _buscar_ramal(sessao: Session, ramal_id: uuid.UUID) -> Ramal:
    ramal = sessao.get(Ramal, ramal_id)
    if ramal is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ramal não encontrado")
    return ramal


def _salvar(sessao: Session, conflito: str | dict[str, str]) -> None:
    try:
        sessao.commit()
    except IntegrityError:
        sessao.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, conflito)
