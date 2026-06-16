from datetime import date
from decimal import Decimal

from ..db import dictfetchall, dictfetchone


SQL_DETALHE_EMPRESTIMO = '''
SELECT e.id_emprestimo,
       e.data_emprestimo,
       e.data_devolucao,
       e.data_devolucao_real,
       e.status,
       e.multa,
       e.observacao,
       (e.status = 'ATIVO' AND e.data_devolucao < CURRENT_DATE) AS vencido,
       CASE
           WHEN e.status = 'ATIVO' AND e.data_devolucao < CURRENT_DATE THEN 'VENCIDO'
           ELSE e.status
       END AS situacao,
       ua.id_usuario AS aluno_id_usuario,
       ua.nome AS aluno_nome,
       ua.email AS aluno_email,
       a.matricula AS aluno_matricula,
       a.curso AS aluno_curso,
       uf.id_usuario AS funcionario_id_usuario,
       uf.nome AS funcionario_nome,
       uf.email AS funcionario_email
FROM emprestimo e
JOIN realiza_emprestimo re ON re.id_emprestimo = e.id_emprestimo
JOIN aluno a ON a.id_usuario = re.id_aluno
JOIN usuario ua ON ua.id_usuario = a.id_usuario
LEFT JOIN (
    SELECT DISTINCT ON (id_emprestimo)
           id_emprestimo,
           id_funcionario
    FROM registra_item
    ORDER BY id_emprestimo, id_funcionario
) ri_func ON ri_func.id_emprestimo = e.id_emprestimo
LEFT JOIN funcionario f ON f.id_usuario = ri_func.id_funcionario
LEFT JOIN usuario uf ON uf.id_usuario = f.id_usuario
WHERE e.id_emprestimo = %s;
'''


SQL_LIVROS_EMPRESTIMO = '''
SELECT DISTINCT l.id_livro,
       l.titulo,
       l.autor,
       l.ano_publicacao,
       c.nome AS categoria
FROM registra_item ri
JOIN livro l ON l.id_livro = ri.id_livro
JOIN categoria c ON c.id_categoria = l.id_categoria
WHERE ri.id_emprestimo = %s
ORDER BY l.titulo, l.id_livro;
'''


SQL_ALUNO = '''
SELECT u.id_usuario,
       u.nome,
       u.email,
       a.matricula,
       a.curso
FROM aluno a
JOIN usuario u ON u.id_usuario = a.id_usuario
WHERE a.id_usuario = %s;
'''


SQL_HISTORICO_EMPRESTIMOS_ALUNO = '''
SELECT e.id_emprestimo,
       e.data_emprestimo,
       e.data_devolucao,
       e.data_devolucao_real,
       e.status,
       e.multa,
       e.observacao,
       (e.status = 'ATIVO' AND e.data_devolucao < CURRENT_DATE) AS vencido,
       CASE
           WHEN e.status = 'ATIVO' AND e.data_devolucao < CURRENT_DATE THEN 'VENCIDO'
           ELSE e.status
       END AS situacao,
       uf.id_usuario AS funcionario_id_usuario,
       uf.nome AS funcionario_nome,
       uf.email AS funcionario_email
FROM realiza_emprestimo re
JOIN emprestimo e ON e.id_emprestimo = re.id_emprestimo
LEFT JOIN (
    SELECT DISTINCT ON (id_emprestimo)
           id_emprestimo,
           id_funcionario
    FROM registra_item
    ORDER BY id_emprestimo, id_funcionario
) ri_func ON ri_func.id_emprestimo = e.id_emprestimo
LEFT JOIN funcionario f ON f.id_usuario = ri_func.id_funcionario
LEFT JOIN usuario uf ON uf.id_usuario = f.id_usuario
WHERE re.id_aluno = %s
ORDER BY e.data_emprestimo DESC, e.id_emprestimo DESC;
'''


SQL_LIVROS_HISTORICO = '''
SELECT DISTINCT ri.id_emprestimo,
       l.id_livro,
       l.titulo,
       l.autor,
       c.nome AS categoria
FROM registra_item ri
JOIN livro l ON l.id_livro = ri.id_livro
JOIN categoria c ON c.id_categoria = l.id_categoria
WHERE ri.id_emprestimo = ANY(%s)
ORDER BY ri.id_emprestimo, l.titulo, l.id_livro;
'''


def buscar_detalhe_emprestimo(cursor, id_emprestimo):
    cursor.execute(SQL_DETALHE_EMPRESTIMO, [id_emprestimo])
    emprestimo = dictfetchone(cursor)

    if not emprestimo:
        return None

    livros = listar_livros_emprestimo(cursor, id_emprestimo)
    return montar_emprestimo_detalhe(emprestimo, livros)


def buscar_historico_por_aluno(cursor, id_aluno):
    aluno = buscar_aluno(cursor, id_aluno)

    if not aluno:
        return None

    cursor.execute(SQL_HISTORICO_EMPRESTIMOS_ALUNO, [id_aluno])
    emprestimos = dictfetchall(cursor)

    livros_por_emprestimo = listar_livros_por_emprestimos(
        cursor,
        [item['id_emprestimo'] for item in emprestimos],
    )

    return {
        'aluno': aluno,
        'historico': [
            montar_emprestimo_historico(
                emprestimo,
                livros_por_emprestimo.get(emprestimo['id_emprestimo'], []),
            )
            for emprestimo in emprestimos
        ],
    }


def buscar_aluno(cursor, id_aluno):
    cursor.execute(SQL_ALUNO, [id_aluno])
    return dictfetchone(cursor)


def listar_livros_emprestimo(cursor, id_emprestimo):
    cursor.execute(SQL_LIVROS_EMPRESTIMO, [id_emprestimo])
    return dictfetchall(cursor)


def listar_livros_por_emprestimos(cursor, ids_emprestimos):
    if not ids_emprestimos:
        return {}

    cursor.execute(SQL_LIVROS_HISTORICO, [ids_emprestimos])

    livros_por_emprestimo = {}
    for livro in dictfetchall(cursor):
        id_emprestimo = livro.pop('id_emprestimo')
        livros_por_emprestimo.setdefault(id_emprestimo, []).append(livro)

    return livros_por_emprestimo


def montar_emprestimo_detalhe(emprestimo, livros):
    return {
        'id_emprestimo': emprestimo['id_emprestimo'],
        'data_emprestimo': serializar_data(emprestimo['data_emprestimo']),
        'data_devolucao': serializar_data(emprestimo['data_devolucao']),
        'data_devolucao_real': serializar_data(
            emprestimo['data_devolucao_real']
        ),
        'status': emprestimo['status'],
        'multa': serializar_multa(emprestimo['multa']),
        'observacao': emprestimo['observacao'],
        'vencido': emprestimo['vencido'],
        'situacao': emprestimo['situacao'],
        'aluno': montar_aluno_de_emprestimo(emprestimo),
        'funcionario': montar_funcionario_de_emprestimo(emprestimo),
        'livros': [serializar_livro(livro) for livro in livros],
    }


def montar_emprestimo_historico(emprestimo, livros):
    return {
        'id_emprestimo': emprestimo['id_emprestimo'],
        'data_emprestimo': serializar_data(emprestimo['data_emprestimo']),
        'data_devolucao': serializar_data(emprestimo['data_devolucao']),
        'data_devolucao_real': serializar_data(
            emprestimo['data_devolucao_real']
        ),
        'status': emprestimo['status'],
        'multa': serializar_multa(emprestimo['multa']),
        'observacao': emprestimo['observacao'],
        'vencido': emprestimo['vencido'],
        'situacao': emprestimo['situacao'],
        'livros': [serializar_livro(livro, incluir_ano=False) for livro in livros],
        'funcionario': montar_funcionario_de_emprestimo(emprestimo),
    }


def montar_aluno_de_emprestimo(emprestimo):
    return {
        'id_usuario': emprestimo['aluno_id_usuario'],
        'nome': emprestimo['aluno_nome'],
        'email': emprestimo['aluno_email'],
        'matricula': emprestimo['aluno_matricula'],
        'curso': emprestimo['aluno_curso'],
    }


def montar_funcionario_de_emprestimo(emprestimo):
    if not emprestimo['funcionario_id_usuario']:
        return None

    return {
        'id_usuario': emprestimo['funcionario_id_usuario'],
        'nome': emprestimo['funcionario_nome'],
        'email': emprestimo['funcionario_email'],
    }


def serializar_livro(livro, incluir_ano=True):
    dados = {
        'id_livro': livro['id_livro'],
        'titulo': livro['titulo'],
        'autor': livro['autor'],
        'categoria': livro['categoria'],
    }

    if incluir_ano:
        dados['ano_publicacao'] = livro['ano_publicacao']

    return dados


def serializar_data(valor):
    if isinstance(valor, date):
        return valor.isoformat()

    return valor


def serializar_multa(valor):
    if isinstance(valor, Decimal):
        if valor == valor.to_integral_value():
            return int(valor)

        return float(valor)

    return valor
