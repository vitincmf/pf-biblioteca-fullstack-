# PF - Aplicação Full Stack conectando-se ao PostgreSQL

## Nome do sistema

Sistema de Biblioteca

## Integrantes da equipe

- Victor de Almeida Reinaldo
- Eduardo Inácio Silva
- Victor Farias Ferreira
- José Waldeney Bonfim Forte

## Tecnologias, frameworks, IDEs e plataformas utilizadas

- Front-end: Angular
- Back-end/API: Django + Django REST Framework
- SGBD: PostgreSQL
- Instância PostgreSQL: Supabase PostgreSQL remoto
- Ferramenta de execução/consulta SQL: Supabase SQL Editor e pgAdmin 4
- IDE/editor: Visual Studio Code
- Versionamento: GitHub

## Identificação do front-end

O front-end foi implementado em Angular. Ele é responsável pela interface da aplicação, permitindo ao usuário listar, buscar, cadastrar, atualizar e remover registros, além de acionar relatórios e testes de gatilho/restrição.

## Identificação do back-end/API

O back-end foi implementado em Django com Django REST Framework. Ele recebe as requisições do front-end, processa as operações da aplicação e executa comandos SQL sobre o banco PostgreSQL.

## Instância PostgreSQL utilizada

A aplicação utiliza uma instância PostgreSQL remota hospedada no Supabase, no schema `public`, contendo o modelo físico implementado no TP3.

## Biblioteca, driver, ORM ou recurso utilizado para conexão com PostgreSQL

A conexão do back-end/API com o PostgreSQL é realizada por meio do Django, utilizando `psycopg2-binary` como driver PostgreSQL e `dj-database-url` para leitura da variável de ambiente `DATABASE_URL`.

## Link do repositório do projeto

INSERIR_LINK_DO_REPOSITORIO_GITHUB

## Ajustes realizados após o TP3

Foram realizados apenas ajustes necessários à aplicação Full Stack, mantendo o modelo físico do TP3 como base. A API utiliza as tabelas, restrições, view, índice e gatilhos implementados no PostgreSQL. Foram criadas rotas no back-end para expor operações coerentes com o domínio da biblioteca e telas no front-end para demonstrar essas operações pela interface.

## Funcionalidades demonstradas pela interface

- Inserção de registro: cadastro de livro, aluno, funcionário e empréstimo.
- Atualização de registro: edição de livro.
- Remoção de registro: remoção de livro.
- Listagem de registros: listagem de livros, alunos e funcionários.
- Consulta de registro específico: detalhe de livro na API.
- Busca por substring: busca de livro por parte do título.
- Operação composta: criação de empréstimo envolvendo `emprestimo`, `realiza_emprestimo` e `registra_item`.
- JOIN/VIEW: relatório de histórico de empréstimos por meio da view `vw_historico_emprestimos`.
- GROUP BY e função de agregação: relatório de quantidade de livros por categoria.
- HAVING: relatório de categorias com mais de um livro.
- Gatilho: tentativa de cadastro de empréstimo com data de devolução anterior à data de empréstimo.
- Erro de integridade: tentativa de inserir usuário com e-mail duplicado.
