# PF - Sistema de Biblioteca Full Stack

Projeto Full Stack desenvolvido a partir do TP1, TP2 e TP3.

Arquitetura:

```text
Angular Front-end -> Django REST API -> PostgreSQL remoto no Supabase
```

## Tecnologias

- Front-end: Angular
- Back-end/API: Django + Django REST Framework
- Banco de dados: PostgreSQL remoto no Supabase
- Conexão com PostgreSQL: Django DB connection + `psycopg2-binary` + `dj-database-url`

## Requisitos atendidos

- Inserção de registro: cadastro de livro, aluno, funcionário e empréstimo.
- Atualização de registro: edição de livro.
- Remoção de registro: remoção de livro.
- Listagem de registros: listagem de livros, alunos e funcionários.
- Consulta de registro específico: detalhe de livro por ID na API.
- Busca por substring textual: busca de livro por parte do título.
- Operação composta: criação de empréstimo, inserindo em `emprestimo`, `realiza_emprestimo` e `registra_item`.
- JOIN: histórico de empréstimos pela view `vw_historico_emprestimos`.
- GROUP BY e agregação: relatório de livros por categoria.
- HAVING: relatório de categorias com mais de um livro.
- Gatilho: tentativa de cadastrar empréstimo com data de devolução anterior à data de empréstimo.
- Erro de integridade: tentativa de inserir usuário com e-mail duplicado.

## Como executar o back-end

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edite o arquivo `.env` e coloque a `DATABASE_URL` do Supabase.

Depois execute:

```bash
python manage.py runserver
```

A API ficará disponível em:

```text
http://localhost:8000/api/
```

## Como executar o front-end

```bash
cd frontend
npm install
npm start
```

O Angular ficará disponível em:

```text
http://localhost:4200
```

## Observação importante

O banco PostgreSQL deve estar criado previamente com os scripts do TP3:

1. `01_create.sql`
2. `02_insert.sql`
3. `03_objects.sql`
4. `04_tests.sql`

O arquivo `.env` não deve ser enviado para o GitHub, pois contém senha do banco.
