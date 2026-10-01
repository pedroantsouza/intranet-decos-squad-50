from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

CAMINHO_ENV = Path(__file__).resolve().parents[2] / ".env"


class Configuracoes(BaseSettings):
    model_config = SettingsConfigDict(env_file=CAMINHO_ENV, extra="ignore")

    database_url: str = "postgresql://postgres:postgres@localhost:5432/intranet"

    jwt_secret: str
    access_token_minutos: int = 30
    refresh_token_dias: int = 7

    # Só necessário em dev, quando frontend e backend rodam em portas diferentes.
    origens_cors: list[str] = []

    minio_endpoint: str = "localhost:9000"
    minio_usuario: str
    minio_senha: str
    minio_bucket: str = "intranet"
    minio_seguro: bool = False

    # Tem que bater com o client_max_body_size do frontend/nginx.conf.
    tamanho_maximo_upload_mb: int = 50


configuracoes = Configuracoes()
