import uuid
from datetime import datetime
from enum import StrEnum

from sqlalchemy import (
  BigInteger,
  Boolean,
  CheckConstraint,
  DateTime,
  ForeignKey,
  String,
  Text,
  func,
  text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.modules.setores.models import Setor
from app.modules.usuarios.models import Usuario


class CategoriaAviso(StrEnum):
  COMUNICADO = "comunicado"
  PROMOCAO = "promocao"
  CONVITE = "convite"


class Aviso(Base):
  __tablename__ = "avisos"
  __table_args__ = (
    CheckConstraint("categoria IN ('comunicado', 'promocao', 'convite')", name="categoria"),
  )

  id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
  titulo: Mapped[str] = mapped_column(String(200))
  conteudo: Mapped[str] = mapped_column(Text)
  categoria: Mapped[CategoriaAviso] = mapped_column(
    String(20), default=CategoriaAviso.COMUNICADO, server_default=CategoriaAviso.COMUNICADO.value
  )
  fixado: Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("false"))
  # Chave da capa no MinIO (ver murais/storage.py). Nunca vem do cliente.
  chave_imagem: Mapped[str | None] = mapped_column(String(500))
  autor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id"), index=True)
  setor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("setores.id"), index=True)
  criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
  atualizado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

  autor: Mapped[Usuario] = relationship()
  setor: Mapped[Setor] = relationship()
  anexos: Mapped[list["AnexoAviso"]] = relationship(
    back_populates="aviso",
    order_by="AnexoAviso.criado_em",
    cascade="all, delete-orphan",
    # A FK tem ON DELETE CASCADE: o banco apaga as linhas ao remover o aviso.
    passive_deletes=True,
  )

  @property
  def possui_imagem(self) -> bool:
    return self.chave_imagem is not None

  @property
  def versao_imagem(self) -> str | None:
    """O uuid do nome da capa muda a cada troca; vira o `?v=` que fura o cache."""
    if self.chave_imagem is None:
      return None
    return self.chave_imagem.rsplit("/", 1)[-1].split(".", 1)[0]

  @property
  def autor_nome(self) -> str:
    return self.autor.nome

  @property
  def setor_nome(self) -> str:
    return self.setor.nome


class AnexoAviso(Base):
  """Metadado do anexo. O binário mora no MinIO, na chave `chave_armazenamento`."""

  __tablename__ = "anexos_aviso"

  id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
  aviso_id: Mapped[uuid.UUID] = mapped_column(
    ForeignKey("avisos.id", ondelete="CASCADE"), index=True
  )
  # Nome original do arquivo, devolvido no download.
  nome_arquivo: Mapped[str] = mapped_column(String(255))
  # Derivado da extensão, nunca do content-type enviado pelo cliente.
  tipo_conteudo: Mapped[str] = mapped_column(String(150))
  tamanho_bytes: Mapped[int] = mapped_column(BigInteger)
  chave_armazenamento: Mapped[str] = mapped_column(String(500), unique=True)
  criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

  aviso: Mapped[Aviso] = relationship(back_populates="anexos")
