import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.modules.setores.models import Setor
from app.modules.usuarios.models import Usuario


class Evento(Base):
    __tablename__ = "eventos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    titulo: Mapped[str] = mapped_column(String(200))
    descricao: Mapped[str | None] = mapped_column(Text)
    data_inicio: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    data_fim: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    autor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id"), index=True)
    setor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("setores.id"), index=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    autor: Mapped[Usuario] = relationship()
    setor: Mapped[Setor] = relationship()

    @property
    def autor_nome(self) -> str:
        return self.autor.nome

    @property
    def setor_nome(self) -> str:
        return self.setor.nome
