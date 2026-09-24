import uuid

from sqlalchemy import Select, select
from sqlalchemy.orm import Session, selectinload

from app.modules.murais.models import Aviso


def _consulta_base() -> Select[tuple[Aviso]]:
  return select(Aviso).options(selectinload(Aviso.autor), selectinload(Aviso.setor))


def listar(sessao: Session) -> list[Aviso]:
  consulta = _consulta_base().order_by(Aviso.criado_em.desc())
  return list(sessao.scalars(consulta))


def buscar_por_id(sessao: Session, aviso_id: uuid.UUID) -> Aviso | None:
  return sessao.scalars(_consulta_base().where(Aviso.id == aviso_id)).first()


def adicionar(sessao: Session, aviso: Aviso) -> None:
  sessao.add(aviso)
  sessao.commit()


def salvar(sessao: Session) -> None:
  sessao.commit()


def remover(sessao: Session, aviso: Aviso) -> None:
  sessao.delete(aviso)
  sessao.commit()
