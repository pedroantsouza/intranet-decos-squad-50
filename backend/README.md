# Backend — Intranet do Hospital

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # ajuste DATABASE_URL e JWT_SECRET

alembic upgrade head
python -m scripts.criar_superadmin   # só na primeira vez, cria o acesso inicial
python -m scripts.popular_banco_local  # opcional, só em dev: dados de teste
uvicorn app.main:app --reload
```

- Healthcheck: `GET /saude` (503 se o banco estiver fora).
- Documentação interativa: `http://localhost:8000/docs`.
- Primeiro acesso: `POST /usuarios` exige um superadmin autenticado, então o banco recém-migrado
  não tem entrada pela API. `python -m scripts.criar_superadmin` cria esse primeiro usuário —
  lê `SUPERADMIN_NOME`, `SUPERADMIN_EMAIL` e `SUPERADMIN_SENHA` do ambiente ou do `.env`, pergunta
  no terminal o que faltar, e não faz nada se o e-mail já existir.
- Dados de teste locais: `python -m scripts.popular_banco_local` cria 2 setores, 1 usuário por papel
  (senha `senha123`), 1 aviso e 1 evento. É idempotente e recusa rodar se `DATABASE_URL` não for
  localhost (`--forcar` para ignorar). Não faz parte das migrations e nunca roda em deploy.
- Nova migration: `alembic revision --autogenerate -m "descricao"` — importe os models do módulo em `alembic/env.py` antes.
