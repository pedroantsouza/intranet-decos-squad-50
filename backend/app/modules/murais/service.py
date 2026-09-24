import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.permissions import UsuarioAutenticado, garantir_escopo, resolver_setor
from app.modules.murais import repository
from app.modules.murais.models import Aviso
from app.modules.murais.schemas import AvisoAtualizar, AvisoCriar
from app.modules.setores.service import buscar_setor


def listar_avisos(sessao: Session) -> list[Aviso]:
  return repository.listar(sessao)


def buscar_aviso(sessao: Session, aviso_id: uuid.UUID) -> Aviso:
  aviso = repository.buscar_por_id(sessao, aviso_id)
  if aviso is None:
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Aviso não encontrado")
  return aviso


def criar_aviso(sessao: Session, dados: AvisoCriar, usuario: UsuarioAutenticado) -> Aviso:
  setor_id = resolver_setor(dados.setor_id, usuario, entidade="aviso")
  buscar_setor(sessao, setor_id)
  aviso = Aviso(
    titulo=dados.titulo,
    conteudo=dados.conteudo,
    categoria=dados.categoria,
    fixado=dados.fixado,
    chave_imagem=dados.chave_imagem,
    autor_id=usuario.id,
    setor_id=setor_id,
  )
  try:
    repository.adicionar(sessao, aviso)
  except IntegrityError:
    sessao.rollback()
    raise HTTPException(status.HTTP_409_CONFLICT, "Autor do aviso não encontrado")
  return buscar_aviso(sessao, aviso.id)


def atualizar_aviso(
  sessao: Session, aviso_id: uuid.UUID, dados: AvisoAtualizar, usuario: UsuarioAutenticado
) -> Aviso:
  aviso = buscar_aviso(sessao, aviso_id)
  garantir_escopo(usuario, aviso.setor_id)
  campos = dados.model_dump(exclude_unset=True)
  if not campos:
    return aviso
  for campo, valor in campos.items():
    setattr(aviso, campo, valor)
  aviso.atualizado_em = datetime.now(UTC)
  repository.salvar(sessao)
  return buscar_aviso(sessao, aviso.id)


def deletar_aviso(sessao: Session, aviso_id: uuid.UUID, usuario: UsuarioAutenticado) -> None:
  aviso = buscar_aviso(sessao, aviso_id)
  garantir_escopo(usuario, aviso.setor_id)
  repository.remover(sessao, aviso)
