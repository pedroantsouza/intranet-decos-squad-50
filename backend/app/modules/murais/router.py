import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import obter_sessao
from app.core.permissions import UsuarioAutenticado, requer_admin, usuario_atual
from app.modules.murais import service
from app.modules.murais.schemas import AvisoAtualizar, AvisoCriar, AvisoResposta

router = APIRouter(prefix="/murais", tags=["murais"])


@router.get(
  "/avisos", response_model=list[AvisoResposta], dependencies=[Depends(usuario_atual)]
)
def listar_avisos(sessao: Session = Depends(obter_sessao)):
  return service.listar_avisos(sessao)


@router.get(
  "/avisos/{aviso_id}", response_model=AvisoResposta, dependencies=[Depends(usuario_atual)]
)
def buscar_aviso(aviso_id: uuid.UUID, sessao: Session = Depends(obter_sessao)):
  return service.buscar_aviso(sessao, aviso_id)


@router.post("/avisos", response_model=AvisoResposta, status_code=status.HTTP_201_CREATED)
def criar_aviso(
  dados: AvisoCriar,
  usuario: UsuarioAutenticado = Depends(requer_admin),
  sessao: Session = Depends(obter_sessao),
):
  return service.criar_aviso(sessao, dados, usuario)


@router.put("/avisos/{aviso_id}", response_model=AvisoResposta)
def atualizar_aviso(
  aviso_id: uuid.UUID,
  dados: AvisoAtualizar,
  usuario: UsuarioAutenticado = Depends(requer_admin),
  sessao: Session = Depends(obter_sessao),
):
  return service.atualizar_aviso(sessao, aviso_id, dados, usuario)


@router.delete("/avisos/{aviso_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_aviso(
  aviso_id: uuid.UUID,
  usuario: UsuarioAutenticado = Depends(requer_admin),
  sessao: Session = Depends(obter_sessao),
):
  service.deletar_aviso(sessao, aviso_id, usuario)
