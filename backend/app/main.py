from fastapi import Depends, FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import configuracoes
from app.core.database import obter_sessao
from app.core.erros import registrar_tratadores_de_erro
from app.modules.autenticacao.router import router as roteador_autenticacao
from app.modules.calendario.router import router as roteador_calendario
from app.modules.murais.router import router as roteador_murais
from app.modules.setores.router import router as roteador_setores
from app.modules.usuarios.router import router as roteador_usuarios

app = FastAPI(title="Intranet do Hospital")

if configuracoes.origens_cors:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=configuracoes.origens_cors,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

registrar_tratadores_de_erro(app)

app.include_router(roteador_autenticacao)
app.include_router(roteador_setores)
app.include_router(roteador_usuarios)
app.include_router(roteador_calendario)
app.include_router(roteador_murais)


@app.get("/saude", tags=["saude"])
def verificar_saude(sessao: Session = Depends(obter_sessao)) -> JSONResponse:
    try:
        sessao.execute(text("SELECT 1"))
    except SQLAlchemyError:
        return JSONResponse(
            {"status": "indisponivel", "banco": "indisponivel"},
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    return JSONResponse({"status": "ok", "banco": "ok"})
