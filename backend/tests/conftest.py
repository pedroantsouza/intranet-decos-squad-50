"""Infra de teste do backend. Convenções em docs/specs/README.md ("Testes: onde e como").

Banco: Postgres de verdade, num banco separado (`<banco do DATABASE_URL>_teste`, ou o que vier em
`DATABASE_URL_TESTE`), recriado e migrado com o Alembic uma vez por execução. Cada teste roda numa
transação desfeita no final: os `commit()` dos services viram savepoints e nada vaza entre testes.
Por isso `now()` devolve o mesmo instante para tudo que um teste insere.

Armazenamento: o MinIO é trocado por um dicionário em memória (`ArmazenamentoFalso`) em todos os
testes; nenhum teste fala com o MinIO real.
"""

import os
from pathlib import Path

from dotenv import dotenv_values
from sqlalchemy.engine import make_url

RAIZ_BACKEND = Path(__file__).resolve().parents[1]


def _url_banco_teste() -> str:
    explicita = os.environ.get("DATABASE_URL_TESTE")
    if explicita:
        return explicita
    base = os.environ.get("DATABASE_URL") or dotenv_values(RAIZ_BACKEND / ".env").get("DATABASE_URL")
    if not base:
        raise RuntimeError("Defina DATABASE_URL_TESTE, ou DATABASE_URL no backend/.env")
    url = make_url(base)
    return url.set(database=f"{url.database}_teste").render_as_string(hide_password=False)


URL_BANCO_TESTE = _url_banco_teste()
if not (make_url(URL_BANCO_TESTE).database or "").endswith("_teste"):
    raise RuntimeError("O nome do banco de teste precisa terminar em _teste: ele é apagado a cada execução")

# Tem que vir antes de importar `app`: core/config.py lê o ambiente na importação.
os.environ["DATABASE_URL"] = URL_BANCO_TESTE
# 32+ bytes: o PyJWT avisa quando a chave HMAC é curta.
os.environ.setdefault("JWT_SECRET", "segredo-so-para-teste-com-32-bytes-ou-mais")
os.environ.setdefault("MINIO_USUARIO", "teste")
os.environ.setdefault("MINIO_SENHA", "teste")

from collections.abc import Iterator  # noqa: E402

import pytest  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine, text  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

import app.main  # noqa: E402
from app.core import armazenamento  # noqa: E402
from app.core.database import engine, obter_sessao  # noqa: E402
from app.modules.setores.models import Setor  # noqa: E402
from app.modules.usuarios.models import Papel, Usuario  # noqa: E402
from tests.apoio import ArmazenamentoFalso, Fabrica  # noqa: E402


# Banco


def _recriar_banco() -> None:
    url = make_url(URL_BANCO_TESTE)
    nome = '"' + (url.database or "").replace('"', '""') + '"'
    manutencao = create_engine(url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    with manutencao.connect() as conexao:
        conexao.execute(text(f"DROP DATABASE IF EXISTS {nome} WITH (FORCE)"))
        conexao.execute(text(f"CREATE DATABASE {nome}"))
    manutencao.dispose()


@pytest.fixture(scope="session")
def banco_migrado() -> None:
    _recriar_banco()
    # Config sem arquivo: o env.py pula o fileConfig e não mexe no logging do pytest.
    config = Config()
    config.set_main_option("script_location", str(RAIZ_BACKEND / "alembic"))
    command.upgrade(config, "head")


@pytest.fixture
def sessao(banco_migrado: None) -> Iterator[Session]:
    conexao = engine.connect()
    transacao = conexao.begin()
    sessao = Session(bind=conexao, join_transaction_mode="create_savepoint")
    try:
        yield sessao
    finally:
        sessao.close()
        transacao.rollback()
        conexao.close()


@pytest.fixture
def cliente(sessao: Session) -> Iterator[TestClient]:
    # Sem `with`: não roda o lifespan, que tentaria criar o bucket no MinIO real.
    app.main.app.dependency_overrides[obter_sessao] = lambda: sessao
    try:
        yield TestClient(app.main.app)
    finally:
        app.main.app.dependency_overrides.clear()


# Armazenamento


@pytest.fixture(autouse=True)
def armazenamento_falso(monkeypatch: pytest.MonkeyPatch) -> ArmazenamentoFalso:
    falso = ArmazenamentoFalso()
    for nome in ("enviar_arquivo", "ler_arquivo", "mover_arquivo", "remover_arquivo"):
        monkeypatch.setattr(armazenamento, nome, getattr(falso, nome))
    # main.py importa a função pelo nome, então precisa ser trocada lá também.
    monkeypatch.setattr(app.main, "armazenamento_disponivel", falso.armazenamento_disponivel)
    return falso


# Cenário: um setor e um usuário de cada papel nele. Outros setores/usuários via `fabrica`.


@pytest.fixture
def fabrica(sessao: Session) -> Fabrica:
    return Fabrica(sessao)


@pytest.fixture
def setor(fabrica: Fabrica) -> Setor:
    return fabrica.setor("Enfermagem")


@pytest.fixture
def comum(fabrica: Fabrica, setor: Setor) -> Usuario:
    return fabrica.usuario(Papel.comum, setor)


@pytest.fixture
def admin_setor(fabrica: Fabrica, setor: Setor) -> Usuario:
    return fabrica.usuario(Papel.admin_setor, setor)


@pytest.fixture
def superadmin(fabrica: Fabrica, setor: Setor) -> Usuario:
    return fabrica.usuario(Papel.superadmin, setor)
