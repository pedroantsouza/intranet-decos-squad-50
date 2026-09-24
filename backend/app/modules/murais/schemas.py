import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.modules.murais.models import CategoriaAviso


class AvisoCriar(BaseModel):
  model_config = ConfigDict(str_strip_whitespace=True)

  titulo: str = Field(min_length=1, max_length=200)
  conteudo: str = Field(min_length=1)
  categoria: CategoriaAviso = CategoriaAviso.COMUNICADO
  fixado: bool = False
  chave_imagem: str | None = Field(default=None, max_length=500)
  setor_id: uuid.UUID | None = None


class AvisoAtualizar(BaseModel):
  model_config = ConfigDict(str_strip_whitespace=True)

  titulo: str | None = Field(default=None, min_length=1, max_length=200)
  conteudo: str | None = Field(default=None, min_length=1)
  categoria: CategoriaAviso | None = None
  fixado: bool | None = None
  chave_imagem: str | None = Field(default=None, max_length=500)

  @field_validator("titulo", "conteudo", "categoria", "fixado")
  @classmethod
  def rejeitar_nulo(cls, valor):
    if valor is None:
      raise ValueError("Não pode ser nulo")
    return valor


class AvisoResposta(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  id: uuid.UUID
  titulo: str
  conteudo: str
  categoria: CategoriaAviso
  fixado: bool
  chave_imagem: str | None
  setor_id: uuid.UUID
  setor_nome: str
  autor_id: uuid.UUID
  autor_nome: str
  criado_em: datetime
  atualizado_em: datetime | None
