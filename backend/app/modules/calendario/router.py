import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import obter_sessao
from app.core.permissions import UsuarioAutenticado, requer_admin, usuario_atual
from app.modules.calendario import service
from app.modules.calendario.schemas import (
    AniversarianteResposta,
    EventoAtualizar,
    EventoCriar,
    EventoResposta,
)

router = APIRouter(prefix="/calendario", tags=["calendario"])


@router.get(
    "/eventos", response_model=list[EventoResposta], dependencies=[Depends(usuario_atual)]
)
def listar_eventos(
    de: date | None = None,
    ate: date | None = None,
    setor_id: uuid.UUID | None = None,
    sessao: Session = Depends(obter_sessao),
):
    return service.listar_eventos(sessao, de, ate, setor_id)


@router.get(
    "/eventos/{evento_id}",
    response_model=EventoResposta,
    dependencies=[Depends(usuario_atual)],
)
def buscar_evento(evento_id: uuid.UUID, sessao: Session = Depends(obter_sessao)):
    return service.buscar_evento(sessao, evento_id)


@router.post(
    "/eventos",
    response_model=EventoResposta,
    status_code=status.HTTP_201_CREATED,
)
def criar_evento(
    dados: EventoCriar,
    usuario: UsuarioAutenticado = Depends(requer_admin),
    sessao: Session = Depends(obter_sessao),
):
    return service.criar_evento(sessao, dados, usuario)


@router.put("/eventos/{evento_id}", response_model=EventoResposta)
def atualizar_evento(
    evento_id: uuid.UUID,
    dados: EventoAtualizar,
    usuario: UsuarioAutenticado = Depends(requer_admin),
    sessao: Session = Depends(obter_sessao),
):
    return service.atualizar_evento(sessao, evento_id, dados, usuario)


@router.delete("/eventos/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_evento(
    evento_id: uuid.UUID,
    usuario: UsuarioAutenticado = Depends(requer_admin),
    sessao: Session = Depends(obter_sessao),
):
    service.deletar_evento(sessao, evento_id, usuario)


@router.get(
    "/aniversariantes",
    response_model=list[AniversarianteResposta],
    dependencies=[Depends(usuario_atual)],
)
def listar_aniversariantes(
    mes: int | None = Query(default=None, ge=1, le=12),
    sessao: Session = Depends(obter_sessao),
):
    return service.listar_aniversariantes(sessao, mes)
