import uuid
from datetime import datetime

from fastapi import UploadFile
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.modules.murais.models import CategoriaAviso


class AvisoCriar(BaseModel):
  """Chega como multipart/form-data. Os arquivos ficam dentro do model porque o FastAPI não
  achata um model de Form quando há um UploadFile declarado ao lado dele."""

  model_config = ConfigDict(str_strip_whitespace=True)

  titulo: str = Field(min_length=1, max_length=200)
  conteudo: str = Field(min_length=1)
  categoria: CategoriaAviso = CategoriaAviso.COMUNICADO
  fixado: bool = False
  setor_id: uuid.UUID | None = None
  imagem: UploadFile | None = None
  anexos: list[UploadFile] = []


class AvisoAtualizar(BaseModel):
  """Só o texto. Capa e anexos têm endpoints próprios."""

  model_config = ConfigDict(str_strip_whitespace=True)

  titulo: str | None = Field(default=None, min_length=1, max_length=200)
  conteudo: str | None = Field(default=None, min_length=1)
  categoria: CategoriaAviso | None = None
  fixado: bool | None = None

  @field_validator("titulo", "conteudo", "categoria", "fixado")
  @classmethod
  def rejeitar_nulo(cls, valor):
    if valor is None:
      raise ValueError("Não pode ser nulo")
    return valor


class AnexoResposta(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  id: uuid.UUID
  nome_arquivo: str
  tipo_conteudo: str
  tamanho_bytes: int


class AvisoResposta(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  id: uuid.UUID
  titulo: str
  conteudo: str
  categoria: CategoriaAviso
  fixado: bool
  possui_imagem: bool
  versao_imagem: str | None
  anexos: list[AnexoResposta]
  setor_id: uuid.UUID
  setor_nome: str
  autor_id: uuid.UUID
  autor_nome: str
  criado_em: datetime
  atualizado_em: datetime | None
