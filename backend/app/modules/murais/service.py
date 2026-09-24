import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.permissions import Papel, UsuarioAutenticado, pode_gerenciar_setor
from app.modules.murais import repository
from app.modules.murais.models import Aviso
from app.modules.murais.schemas import AvisoAtualizar, AvisoCriar
from app.modules.setores.service import buscar_setor

SETOR_OBRIGATORIO = {"campo": "setor_id", "mensagem": "Informe o setor do aviso"}


def listar_avisos(sessao: Session) -> list[Aviso]:
  return repository.listar(sessao)


def buscar_aviso(sessao: Session, aviso_id: uuid.UUID) -> Aviso:
  aviso = repository.buscar_por_id(sessao, aviso_id)
  if aviso is None:
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Aviso não encontrado")
  return aviso


def criar_aviso(sessao: Session, dados: AvisoCriar, usuario: UsuarioAutenticado) -> Aviso:
  setor_id = _resolver_setor(dados.setor_id, usuario)
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
  _garantir_escopo(usuario, aviso.setor_id)
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
  _garantir_escopo(usuario, aviso.setor_id)
  repository.remover(sessao, aviso)


def _resolver_setor(setor_id: uuid.UUID | None, usuario: UsuarioAutenticado) -> uuid.UUID:
  if usuario.role == Papel.ADMIN_SETOR:
    if usuario.setor_id is None or (setor_id is not None and setor_id != usuario.setor_id):
      raise HTTPException(status.HTTP_403_FORBIDDEN, "Fora do seu setor")
    return usuario.setor_id
  escolhido = setor_id or usuario.setor_id
  if escolhido is None:
    raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, SETOR_OBRIGATORIO)
  return escolhido


def _garantir_escopo(usuario: UsuarioAutenticado, setor_id: uuid.UUID) -> None:
  if not pode_gerenciar_setor(usuario, setor_id):
    raise HTTPException(status.HTTP_403_FORBIDDEN, "Fora do seu setor")
