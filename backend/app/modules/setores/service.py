import uuid
from collections.abc import Iterator
from contextlib import contextmanager

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.permissions import UsuarioAutenticado, garantir_escopo
from app.modules.setores import repository
from app.modules.setores.models import Ramal, Setor
from app.modules.setores.schemas import RamalAtualizar, RamalCriar, SetorAtualizar, SetorCriar

NOME_DUPLICADO = {"campo": "nome", "mensagem": "Já existe um setor com esse nome"}
SETOR_VINCULADO = "Setor possui registros vinculados e não pode ser removido"
RAMAL_DUPLICADO = {"campo": "numero", "mensagem": "Esse ramal já está cadastrado no setor"}


# Setores


def listar_setores(sessao: Session) -> list[Setor]:
    return repository.listar_setores(sessao)


def buscar_setor(sessao: Session, setor_id: uuid.UUID) -> Setor:
    setor = repository.buscar_setor_por_id(sessao, setor_id)
    if setor is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Setor não encontrado")
    return setor


def criar_setor(sessao: Session, dados: SetorCriar) -> Setor:
    setor = Setor(nome=dados.nome)
    with _conflito_vira_409(sessao, NOME_DUPLICADO):
        repository.adicionar(sessao, setor)
    return setor


def atualizar_setor(sessao: Session, setor_id: uuid.UUID, dados: SetorAtualizar) -> Setor:
    setor = buscar_setor(sessao, setor_id)
    setor.nome = dados.nome
    with _conflito_vira_409(sessao, NOME_DUPLICADO):
        repository.salvar(sessao)
    return setor


def deletar_setor(sessao: Session, setor_id: uuid.UUID) -> None:
    setor = buscar_setor(sessao, setor_id)
    # Ramais caem junto (ON DELETE CASCADE); outros vínculos (usuários, documentos...) bloqueiam.
    with _conflito_vira_409(sessao, SETOR_VINCULADO):
        repository.remover(sessao, setor)


# Ramais


def listar_ramais(sessao: Session, setor_id: uuid.UUID) -> list[Ramal]:
    return buscar_setor(sessao, setor_id).ramais


def criar_ramal(
    sessao: Session, setor_id: uuid.UUID, dados: RamalCriar, usuario: UsuarioAutenticado
) -> Ramal:
    setor = buscar_setor(sessao, setor_id)
    garantir_escopo(usuario, setor.id)
    ramal = Ramal(numero=dados.numero, setor_id=setor.id)
    with _conflito_vira_409(sessao, RAMAL_DUPLICADO):
        repository.adicionar(sessao, ramal)
    return ramal


def atualizar_ramal(
    sessao: Session, ramal_id: uuid.UUID, dados: RamalAtualizar, usuario: UsuarioAutenticado
) -> Ramal:
    ramal = _buscar_ramal(sessao, ramal_id)
    garantir_escopo(usuario, ramal.setor_id)
    ramal.numero = dados.numero
    with _conflito_vira_409(sessao, RAMAL_DUPLICADO):
        repository.salvar(sessao)
    return ramal


def deletar_ramal(sessao: Session, ramal_id: uuid.UUID, usuario: UsuarioAutenticado) -> None:
    ramal = _buscar_ramal(sessao, ramal_id)
    garantir_escopo(usuario, ramal.setor_id)
    repository.remover(sessao, ramal)


def _buscar_ramal(sessao: Session, ramal_id: uuid.UUID) -> Ramal:
    ramal = repository.buscar_ramal_por_id(sessao, ramal_id)
    if ramal is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ramal não encontrado")
    return ramal


@contextmanager
def _conflito_vira_409(sessao: Session, detalhe: str | dict[str, str]) -> Iterator[None]:
    try:
        yield
    except IntegrityError:
        sessao.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, detalhe)
