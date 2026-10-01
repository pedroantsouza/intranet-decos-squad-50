"""Layout dos documentos no bucket compartilhado (ver app/core/armazenamento.py).

documentos/setores/{setor_id}/{categoria}/{documento_id}/{nome-sanitizado}.{ext}

O setor entra pelo id, não pelo nome, porque setor pode ser renomeado.
"""

import re
import unicodedata
import uuid
from pathlib import PurePosixPath

PREFIXO = "documentos/setores"
TAMANHO_MAXIMO_NOME = 100


def sanitizar_nome(nome_arquivo: str) -> str:
  """'POP Higienização de Mãos.PDF' -> 'pop-higienizacao-de-maos.pdf'"""
  caminho = PurePosixPath(nome_arquivo.replace("\\", "/")).name
  base, ponto, extensao = caminho.rpartition(".")
  if not ponto:
    base, extensao = extensao, ""

  def limpar(texto: str) -> str:
    ascii_ = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_.lower()).strip("-")

  base = limpar(base)[:TAMANHO_MAXIMO_NOME].strip("-") or "arquivo"
  extensao = limpar(extensao)
  return f"{base}.{extensao}" if extensao else base


def montar_chave(
  setor_id: uuid.UUID, categoria: str, documento_id: uuid.UUID, nome_arquivo: str
) -> str:
  return f"{PREFIXO}/{setor_id}/{categoria}/{documento_id}/{sanitizar_nome(nome_arquivo)}"
