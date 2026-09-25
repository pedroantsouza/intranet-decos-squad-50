import os
import uuid
from collections.abc import Iterator
from datetime import UTC, datetime

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core import armazenamento
from app.core.config import configuracoes
from app.core.permissions import UsuarioAutenticado, garantir_escopo, resolver_setor
from app.modules.documentos import repository
from app.modules.documentos.models import Documento
from app.modules.documentos.schemas import DocumentoAtualizar, DocumentoCriar, FiltroDocumentos
from app.modules.documentos.storage import montar_chave
from app.modules.setores.service import buscar_setor

# O tipo salvo e servido no download sai daqui, nunca do content-type do cliente: assim
# ninguém sobe um text/html que depois seria aberto inline no navegador.
TIPOS_PERMITIDOS: dict[str, str] = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".odt": "application/vnd.oasis.opendocument.text",
  ".ods": "application/vnd.oasis.opendocument.spreadsheet",
  ".odp": "application/vnd.oasis.opendocument.presentation",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
}


def _erro_arquivo(codigo: int, mensagem: str) -> HTTPException:
  return HTTPException(codigo, {"campo": "arquivo", "mensagem": mensagem})


def _validar_arquivo(arquivo: UploadFile) -> tuple[str, str, int]:
  """Devolve (nome_arquivo, tipo_conteudo, tamanho_bytes)."""
  nome = (arquivo.filename or "").strip()
  if not nome:
    raise _erro_arquivo(status.HTTP_422_UNPROCESSABLE_CONTENT, "Envie um arquivo")
  tipo_conteudo = TIPOS_PERMITIDOS.get(os.path.splitext(nome)[1].lower())
  if tipo_conteudo is None:
    raise _erro_arquivo(
      status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Tipo de arquivo não permitido"
    )
  tamanho = arquivo.size
  if tamanho is None:
    arquivo.file.seek(0, os.SEEK_END)
    tamanho = arquivo.file.tell()
  arquivo.file.seek(0)
  if tamanho == 0:
    raise _erro_arquivo(status.HTTP_422_UNPROCESSABLE_CONTENT, "Arquivo vazio")
  limite_mb = configuracoes.tamanho_maximo_upload_mb
  if tamanho > limite_mb * 1024 * 1024:
    raise _erro_arquivo(
      status.HTTP_413_CONTENT_TOO_LARGE, f"Arquivo maior que o limite de {limite_mb} MB"
    )
  return nome[:255], tipo_conteudo, tamanho


def listar_documentos(sessao: Session, filtro: FiltroDocumentos) -> list[Documento]:
  return repository.listar(sessao, filtro)


def buscar_documento(sessao: Session, documento_id: uuid.UUID) -> Documento:
  documento = repository.buscar_por_id(sessao, documento_id)
  if documento is None:
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Documento não encontrado")
  return documento


def criar_documento(
  sessao: Session, dados: DocumentoCriar, usuario: UsuarioAutenticado
) -> Documento:
  arquivo = dados.arquivo
  setor_id = resolver_setor(dados.setor_id, usuario, entidade="documento")
  buscar_setor(sessao, setor_id)
  nome_arquivo, tipo_conteudo, tamanho = _validar_arquivo(arquivo)

  # O id nasce aqui para compor a chave antes do insert: o objeto sobe primeiro e, se o
  # banco falhar, é removido — nunca fica linha sem arquivo.
  documento_id = uuid.uuid4()
  chave = montar_chave(setor_id, dados.categoria, documento_id, nome_arquivo)
  armazenamento.enviar_arquivo(chave, arquivo.file, tamanho, tipo_conteudo)

  documento = Documento(
    id=documento_id,
    titulo=dados.titulo,
    descricao=dados.descricao or None,
    categoria=dados.categoria,
    nome_arquivo=nome_arquivo,
    tipo_conteudo=tipo_conteudo,
    tamanho_bytes=tamanho,
    chave_armazenamento=chave,
    autor_id=usuario.id,
    setor_id=setor_id,
  )
  try:
    repository.adicionar(sessao, documento)
  except SQLAlchemyError as erro:
    sessao.rollback()
    armazenamento.remover_arquivo(chave)
    if isinstance(erro, IntegrityError):
      raise HTTPException(status.HTTP_409_CONFLICT, "Autor do documento não encontrado")
    raise
  return buscar_documento(sessao, documento_id)


def atualizar_documento(
  sessao: Session,
  documento_id: uuid.UUID,
  dados: DocumentoAtualizar,
  usuario: UsuarioAutenticado,
) -> Documento:
  documento = buscar_documento(sessao, documento_id)
  garantir_escopo(usuario, documento.setor_id)
  campos = dados.model_dump(exclude_unset=True)
  if not campos:
    return documento

  chave_antiga = documento.chave_armazenamento
  chave_nova = chave_antiga
  categoria = campos.get("categoria")
  if categoria is not None and categoria != documento.categoria:
    # Mantém o bucket organizado pela categoria atual do documento.
    chave_nova = montar_chave(documento.setor_id, categoria, documento.id, documento.nome_arquivo)
    armazenamento.mover_arquivo(chave_antiga, chave_nova)

  for campo, valor in campos.items():
    setattr(documento, campo, valor)
  if "descricao" in campos:
    documento.descricao = documento.descricao or None
  documento.chave_armazenamento = chave_nova
  documento.atualizado_em = datetime.now(UTC)
  try:
    repository.salvar(sessao)
  except SQLAlchemyError:
    sessao.rollback()
    if chave_nova != chave_antiga:
      armazenamento.mover_arquivo(chave_nova, chave_antiga)
    raise
  return buscar_documento(sessao, documento_id)


def substituir_arquivo(
  sessao: Session, documento_id: uuid.UUID, arquivo: UploadFile, usuario: UsuarioAutenticado
) -> Documento:
  documento = buscar_documento(sessao, documento_id)
  garantir_escopo(usuario, documento.setor_id)
  nome_arquivo, tipo_conteudo, tamanho = _validar_arquivo(arquivo)

  chave_antiga = documento.chave_armazenamento
  chave_nova = montar_chave(documento.setor_id, documento.categoria, documento.id, nome_arquivo)
  armazenamento.enviar_arquivo(chave_nova, arquivo.file, tamanho, tipo_conteudo)

  documento.nome_arquivo = nome_arquivo
  documento.tipo_conteudo = tipo_conteudo
  documento.tamanho_bytes = tamanho
  documento.chave_armazenamento = chave_nova
  documento.atualizado_em = datetime.now(UTC)
  try:
    repository.salvar(sessao)
  except SQLAlchemyError:
    sessao.rollback()
    if chave_nova != chave_antiga:
      armazenamento.remover_arquivo(chave_nova)
    raise
  # Mesmo nome sanitizado = mesma chave, o put já sobrescreveu o objeto.
  if chave_nova != chave_antiga:
    armazenamento.remover_arquivo(chave_antiga)
  return buscar_documento(sessao, documento_id)


def baixar_documento(
  sessao: Session, documento_id: uuid.UUID
) -> tuple[Documento, Iterator[bytes]]:
  documento = buscar_documento(sessao, documento_id)
  return documento, armazenamento.ler_arquivo(documento.chave_armazenamento)


def deletar_documento(
  sessao: Session, documento_id: uuid.UUID, usuario: UsuarioAutenticado
) -> None:
  documento = buscar_documento(sessao, documento_id)
  garantir_escopo(usuario, documento.setor_id)
  chave = documento.chave_armazenamento
  repository.remover(sessao, documento)
  armazenamento.remover_arquivo(chave)
