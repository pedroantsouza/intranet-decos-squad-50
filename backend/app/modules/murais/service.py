import os
import uuid
from collections.abc import Iterator
from datetime import UTC, datetime

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core import armazenamento
from app.core.arquivos import TIPOS_DOCUMENTO, TIPOS_IMAGEM, erro_arquivo, validar_arquivo
from app.core.config import configuracoes
from app.core.permissions import UsuarioAutenticado, garantir_escopo, resolver_setor
from app.modules.murais import repository
from app.modules.murais.models import AnexoAviso, Aviso
from app.modules.murais.schemas import AvisoAtualizar, AvisoCriar
from app.modules.murais.storage import montar_chave_anexo, montar_chave_capa
from app.modules.setores.service import buscar_setor

# A capa é exibida no card e no carrossel; não precisa do limite dos anexos.
LIMITE_IMAGEM_MB = 5
MAXIMO_ANEXOS = 10

ArquivoValidado = tuple[UploadFile, str, str, int]


def _validar_imagem(arquivo: UploadFile, campo: str) -> ArquivoValidado:
  return (arquivo, *validar_arquivo(arquivo, TIPOS_IMAGEM, LIMITE_IMAGEM_MB, campo))


def _validar_anexos(
  arquivos: list[UploadFile], ja_existentes: int, campo: str
) -> list[ArquivoValidado]:
  if ja_existentes + len(arquivos) > MAXIMO_ANEXOS:
    raise erro_arquivo(
      status.HTTP_422_UNPROCESSABLE_CONTENT,
      f"O aviso pode ter no máximo {MAXIMO_ANEXOS} anexos",
      campo,
    )
  limite_mb = configuracoes.tamanho_maximo_upload_mb
  return [
    (arquivo, *validar_arquivo(arquivo, TIPOS_DOCUMENTO, limite_mb, campo))
    for arquivo in arquivos
  ]


def _remover_objetos(chaves: list[str]) -> None:
  for chave in chaves:
    armazenamento.remover_arquivo(chave)


def _enviar_capa(aviso_id: uuid.UUID, imagem: ArquivoValidado, enviados: list[str]) -> str:
  arquivo, nome_arquivo, tipo_conteudo, tamanho = imagem
  chave = montar_chave_capa(aviso_id, nome_arquivo)
  armazenamento.enviar_arquivo(chave, arquivo.file, tamanho, tipo_conteudo)
  enviados.append(chave)
  return chave


def _enviar_anexos(
  aviso_id: uuid.UUID, anexos: list[ArquivoValidado], enviados: list[str]
) -> list[AnexoAviso]:
  # Os ids nascem aqui para compor a chave antes do insert.
  novos = []
  for arquivo, nome_arquivo, tipo_conteudo, tamanho in anexos:
    anexo_id = uuid.uuid4()
    chave = montar_chave_anexo(aviso_id, anexo_id, nome_arquivo)
    armazenamento.enviar_arquivo(chave, arquivo.file, tamanho, tipo_conteudo)
    enviados.append(chave)
    novos.append(
      AnexoAviso(
        id=anexo_id,
        nome_arquivo=nome_arquivo,
        tipo_conteudo=tipo_conteudo,
        tamanho_bytes=tamanho,
        chave_armazenamento=chave,
      )
    )
  return novos


def _salvar_ou_desfazer(sessao: Session, enviados: list[str]) -> None:
  """Commit; se o banco falhar, remove o que acabou de subir — nunca fica linha sem arquivo."""
  try:
    repository.salvar(sessao)
  except SQLAlchemyError:
    sessao.rollback()
    _remover_objetos(enviados)
    raise


def listar_avisos(sessao: Session) -> list[Aviso]:
  return repository.listar(sessao)


def buscar_aviso(sessao: Session, aviso_id: uuid.UUID) -> Aviso:
  aviso = repository.buscar_por_id(sessao, aviso_id)
  if aviso is None:
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Aviso não encontrado")
  return aviso


def _buscar_anexo(sessao: Session, aviso_id: uuid.UUID, anexo_id: uuid.UUID) -> AnexoAviso:
  anexo = repository.buscar_anexo(sessao, aviso_id, anexo_id)
  if anexo is None:
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Anexo não encontrado")
  return anexo


def criar_aviso(sessao: Session, dados: AvisoCriar, usuario: UsuarioAutenticado) -> Aviso:
  setor_id = resolver_setor(dados.setor_id, usuario, entidade="aviso")
  buscar_setor(sessao, setor_id)
  imagem = _validar_imagem(dados.imagem, "imagem") if dados.imagem is not None else None
  anexos = _validar_anexos(dados.anexos, 0, "anexos")

  # Os objetos sobem antes do insert; se algo falhar no caminho, os já enviados são removidos.
  aviso_id = uuid.uuid4()
  enviados: list[str] = []
  try:
    chave_imagem = _enviar_capa(aviso_id, imagem, enviados) if imagem is not None else None
    novos_anexos = _enviar_anexos(aviso_id, anexos, enviados)
  except armazenamento.ErroArmazenamento:
    _remover_objetos(enviados)
    raise

  aviso = Aviso(
    id=aviso_id,
    titulo=dados.titulo,
    conteudo=dados.conteudo,
    categoria=dados.categoria,
    fixado=dados.fixado,
    chave_imagem=chave_imagem,
    autor_id=usuario.id,
    setor_id=setor_id,
    anexos=novos_anexos,
  )
  try:
    repository.adicionar(sessao, aviso)
  except SQLAlchemyError as erro:
    sessao.rollback()
    _remover_objetos(enviados)
    if isinstance(erro, IntegrityError):
      raise HTTPException(status.HTTP_409_CONFLICT, "Autor do aviso não encontrado")
    raise
  return buscar_aviso(sessao, aviso_id)


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


def substituir_imagem(
  sessao: Session, aviso_id: uuid.UUID, arquivo: UploadFile, usuario: UsuarioAutenticado
) -> Aviso:
  aviso = buscar_aviso(sessao, aviso_id)
  garantir_escopo(usuario, aviso.setor_id)
  imagem = _validar_imagem(arquivo, "arquivo")

  enviados: list[str] = []
  chave_antiga = aviso.chave_imagem
  aviso.chave_imagem = _enviar_capa(aviso.id, imagem, enviados)
  aviso.atualizado_em = datetime.now(UTC)
  _salvar_ou_desfazer(sessao, enviados)
  if chave_antiga is not None:
    armazenamento.remover_arquivo(chave_antiga)
  return buscar_aviso(sessao, aviso_id)


def remover_imagem(sessao: Session, aviso_id: uuid.UUID, usuario: UsuarioAutenticado) -> None:
  aviso = buscar_aviso(sessao, aviso_id)
  garantir_escopo(usuario, aviso.setor_id)
  chave = aviso.chave_imagem
  if chave is None:
    return
  aviso.chave_imagem = None
  aviso.atualizado_em = datetime.now(UTC)
  repository.salvar(sessao)
  armazenamento.remover_arquivo(chave)


def adicionar_anexos(
  sessao: Session, aviso_id: uuid.UUID, arquivos: list[UploadFile], usuario: UsuarioAutenticado
) -> Aviso:
  aviso = buscar_aviso(sessao, aviso_id)
  garantir_escopo(usuario, aviso.setor_id)
  anexos = _validar_anexos(arquivos, len(aviso.anexos), "arquivos")

  enviados: list[str] = []
  try:
    aviso.anexos.extend(_enviar_anexos(aviso.id, anexos, enviados))
  except armazenamento.ErroArmazenamento:
    sessao.rollback()
    _remover_objetos(enviados)
    raise
  aviso.atualizado_em = datetime.now(UTC)
  _salvar_ou_desfazer(sessao, enviados)
  return buscar_aviso(sessao, aviso_id)


def remover_anexo(
  sessao: Session, aviso_id: uuid.UUID, anexo_id: uuid.UUID, usuario: UsuarioAutenticado
) -> None:
  aviso = buscar_aviso(sessao, aviso_id)
  garantir_escopo(usuario, aviso.setor_id)
  anexo = _buscar_anexo(sessao, aviso_id, anexo_id)
  chave = anexo.chave_armazenamento
  # delete-orphan: tirar da lista apaga a linha.
  aviso.anexos.remove(anexo)
  aviso.atualizado_em = datetime.now(UTC)
  repository.salvar(sessao)
  armazenamento.remover_arquivo(chave)


def deletar_aviso(sessao: Session, aviso_id: uuid.UUID, usuario: UsuarioAutenticado) -> None:
  aviso = buscar_aviso(sessao, aviso_id)
  garantir_escopo(usuario, aviso.setor_id)
  chaves = [anexo.chave_armazenamento for anexo in aviso.anexos]
  if aviso.chave_imagem is not None:
    chaves.append(aviso.chave_imagem)
  repository.remover(sessao, aviso)
  _remover_objetos(chaves)


def abrir_imagem(sessao: Session, aviso_id: uuid.UUID) -> tuple[str, Iterator[bytes]]:
  """Devolve (tipo_conteudo, blocos). O tipo sai da extensão da chave, que nós geramos."""
  aviso = buscar_aviso(sessao, aviso_id)
  if aviso.chave_imagem is None:
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Aviso sem imagem")
  extensao = os.path.splitext(aviso.chave_imagem)[1].lower()
  tipo_conteudo = TIPOS_IMAGEM.get(extensao, "application/octet-stream")
  return tipo_conteudo, armazenamento.ler_arquivo(aviso.chave_imagem)


def abrir_anexo(
  sessao: Session, aviso_id: uuid.UUID, anexo_id: uuid.UUID
) -> tuple[AnexoAviso, Iterator[bytes]]:
  anexo = _buscar_anexo(sessao, aviso_id, anexo_id)
  return anexo, armazenamento.ler_arquivo(anexo.chave_armazenamento)
