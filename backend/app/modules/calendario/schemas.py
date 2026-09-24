import uuid
from datetime import UTC, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class EventoEntrada(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    titulo: str = Field(min_length=1, max_length=200)
    descricao: str | None = None
    data_inicio: datetime
    data_fim: datetime | None = None

    @field_validator("data_inicio", "data_fim")
    @classmethod
    def normalizar_fuso(cls, valor: datetime | None) -> datetime | None:
        if valor is not None and valor.tzinfo is None:
            return valor.replace(tzinfo=UTC)
        return valor


class EventoCriar(EventoEntrada):
    setor_id: uuid.UUID | None = None


class EventoAtualizar(EventoEntrada):
    pass


class EventoResposta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    titulo: str
    descricao: str | None
    data_inicio: datetime
    data_fim: datetime | None
    setor_id: uuid.UUID
    setor_nome: str
    autor_id: uuid.UUID
    autor_nome: str
    criado_em: datetime


class AniversarianteResposta(BaseModel):
    id: uuid.UUID
    nome: str
    dia: int
    setor_id: uuid.UUID | None
    setor_nome: str | None
