# Roteiro de demonstração - PF Sistema de Biblioteca

## 1. Arquitetura

Explicar:

```text
Front-end Angular -> Back-end/API Django -> PostgreSQL remoto no Supabase
```

Mostrar no navegador a interface Angular e no terminal o Django rodando.

## 2. Listagem de livros

Ação no front-end: clicar em Buscar/Listar.

Back-end/API: `GET /api/livros/`

PostgreSQL: consulta na tabela `livro` com JOIN em `categoria`.

Comprovação SQL:

```sql
SELECT l.*, c.nome AS categoria
FROM livro l
JOIN categoria c ON c.id_categoria = l.id_categoria
ORDER BY l.id_livro;
```

## 3. Busca por substring

Ação no front-end: pesquisar parte do título, por exemplo `code`.

Back-end/API: `GET /api/livros/?q=code`

PostgreSQL: `WHERE LOWER(l.titulo) LIKE LOWER('%code%')`.

## 4. Inserção de registro

Ação no front-end: cadastrar um livro novo.

Back-end/API: `POST /api/livros/`

PostgreSQL: `INSERT INTO livro (...)`.

Comprovação SQL:

```sql
SELECT * FROM livro ORDER BY id_livro DESC;
```

## 5. Atualização de registro

Ação no front-end: selecionar um livro e atualizar o título ou editora.

Back-end/API: `PATCH /api/livros/{id}/`

PostgreSQL: `UPDATE livro SET ... WHERE id_livro = ...`.

## 6. Remoção de registro

Ação no front-end: remover um livro que não esteja em empréstimo.

Back-end/API: `DELETE /api/livros/{id}/`

PostgreSQL: `DELETE FROM livro WHERE id_livro = ...`.

## 7. Operação composta

Ação no front-end: criar um empréstimo informando data, aluno(s), livro(s) e funcionário.

Back-end/API: `POST /api/emprestimos/`

PostgreSQL executa inserções em:

- `emprestimo`
- `realiza_emprestimo`
- `registra_item`

Comprovação SQL:

```sql
SELECT * FROM emprestimo ORDER BY id_emprestimo DESC;
SELECT * FROM realiza_emprestimo ORDER BY id_emprestimo DESC;
SELECT * FROM registra_item ORDER BY id_emprestimo DESC;
```

## 8. Relatório com JOIN/VIEW

Ação no front-end: clicar em Histórico de empréstimos.

Back-end/API: `GET /api/relatorios/historico/`

PostgreSQL: `SELECT * FROM vw_historico_emprestimos`.

## 9. Relatório com GROUP BY e função de agregação

Ação no front-end: clicar em Livros por categoria.

Back-end/API: `GET /api/relatorios/livros-por-categoria/`

PostgreSQL: consulta com `GROUP BY` e `COUNT`.

## 10. Relatório com HAVING

Ação no front-end: clicar em Categorias com mais de 1 livro.

Back-end/API: `GET /api/relatorios/categorias-com-mais-de-um-livro/`

PostgreSQL: consulta com `GROUP BY`, `COUNT` e `HAVING`.

## 11. Gatilho PostgreSQL

Ação no front-end: clicar em Acionar gatilho de data inválida.

Back-end/API: `POST /api/emprestimos/testar-gatilho/`

PostgreSQL: o trigger `trg_validar_datas_emprestimo` bloqueia a operação.

## 12. Erro de integridade

Ação no front-end: clicar em Gerar erro de integridade.

Back-end/API: `POST /api/testes/erro-integridade/`

PostgreSQL: bloqueia e-mail duplicado por restrição `UNIQUE`.
