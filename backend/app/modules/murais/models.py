import uuid
from datetime import datetime
from enum import StrEnum

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, String, Text, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.modules.setores.models import Setor
from app.modules.usuarios.models import Usuario


class CategoriaAviso(StrEnum):
  COMUNICADO = "comunicado"
  PROMOCAO = "promocao"
  EVENTO = "evento"


class Aviso(Base):
  __tablename__ = "avisos"
  __table_args__ = (
    CheckConstraint("categoria IN ('comunicado', 'promocao', 'evento')", name="categoria"),
  )

  id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
  titulo: Mapped[str] = mapped_column(String(200))
  conteudo: Mapped[str] = mapped_column(Text)
  categoria: Mapped[CategoriaAviso] = mapped_column(
    String(20), default=CategoriaAviso.COMUNICADO, server_default=CategoriaAviso.COMUNICADO.value
  )
  fixado: Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("false"))
  chave_imagem: Mapped[str | None] = mapped_column(String(500))
  autor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id"), index=True)
  setor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("setores.id"), index=True)
  criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
  atualizado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

  autor: Mapped[Usuario] = relationship()
  setor: Mapped[Setor] = relationship()

  @property
  def autor_nome(self) -> str:
    return self.autor.nome

  @property
  def setor_nome(self) -> str:
    return self.setor.nome
