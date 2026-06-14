from django.contrib.auth.hashers import check_password, make_password
from django.db import DatabaseError, IntegrityError, connection, transaction

from rest_framework.response import Response
from rest_framework.views import APIView

from .db import dictfetchall, dictfetchone, run_select


def erro_validacao(mensagem):
    return Response({'erro': mensagem}, status=400)


def erro_conflito(payload):
    return Response(payload, status=409)


def normalizar_lista_ids(valor, nome_campo):
    if valor in (None, ''):
        return [], f'Informe {nome_campo}.'

    if not isinstance(valor, (list, tuple)):
        return [], f'{nome_campo} deve ser uma lista de IDs.'

    ids = []
    for item in valor:
        try:
            id_normalizado = int(item)
        except (TypeError, ValueError):
            return [], f'{nome_campo} deve conter apenas IDs numericos.'

        if id_normalizado <= 0:
            return [], f'{nome_campo} deve conter apenas IDs positivos.'

        ids.append(id_normalizado)

    if not ids:
        return [], f'Informe {nome_campo}.'

    return ids, None


def erro_banco(exc, status=400):
    return Response(
        {
            'erro': 'Operacao rejeitada pelo PostgreSQL.',
            'detalhes': str(exc),
        },
        status=status,
    )


class HealthView(APIView):
    def get(self, request):
        return Response({'status': 'ok', 'sistema': 'Sistema de Biblioteca'})


class CategoriaListCreateView(APIView):
    def get(self, request):
        dados = run_select('SELECT * FROM categoria ORDER BY nome;')
        return Response(dados)

    def post(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    '''
                    INSERT INTO categoria (nome, descricao, cor, observacao)
                    VALUES (%s, %s, %s, %s)
                    RETURNING *;
                    ''',
                    [
                        request.data.get('nome'),
                        request.data.get('descricao'),
                        request.data.get('cor'),
                        request.data.get('observacao'),
                    ],
                )
                return Response(dictfetchone(cursor), status=201)
        except (IntegrityError, DatabaseError) as exc:
            return erro_banco(exc)


class LivroListCreateView(APIView):
    def get(self, request):
        q = request.query_params.get('q', '').strip()

        if q:
            termo = f'%{q}%'
            dados = run_select(
                '''
                SELECT l.*, c.nome AS categoria
                FROM livro l
                JOIN categoria c ON c.id_categoria = l.id_categoria
                WHERE LOWER(l.titulo) LIKE LOWER(%s)
                ORDER BY l.titulo;
                ''',
                [termo],
            )
        else:
            dados = run_select(
                '''
                SELECT l.*, c.nome AS categoria
                FROM livro l
                JOIN categoria c ON c.id_categoria = l.id_categoria
                ORDER BY l.id_livro;
                '''
            )

        return Response(dados)

    def post(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    '''
                    INSERT INTO livro (titulo, autor, editora, ano_publicacao, id_categoria)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING *;
                    ''',
                    [
                        request.data.get('titulo'),
                        request.data.get('autor'),
                        request.data.get('editora'),
                        request.data.get('ano_publicacao'),
                        request.data.get('id_categoria'),
                    ],
                )
                return Response(dictfetchone(cursor), status=201)
        except (IntegrityError, DatabaseError) as exc:
            return erro_banco(exc)


class LivroBuscaView(APIView):
    def get(self, request):
        q = request.query_params.get('q', '').strip()
        termo = f'%{q}%'

        dados = run_select(
            '''
            SELECT l.*, c.nome AS categoria
            FROM livro l
            JOIN categoria c ON c.id_categoria = l.id_categoria
            WHERE LOWER(l.titulo) LIKE LOWER(%s)
            ORDER BY l.titulo;
            ''',
            [termo],
        )

        return Response(dados)


class LivroDetailView(APIView):
    def get(self, request, id_livro):
        with connection.cursor() as cursor:
            cursor.execute(
                '''
                SELECT l.*, c.nome AS categoria
                FROM livro l
                JOIN categoria c ON c.id_categoria = l.id_categoria
                WHERE l.id_livro = %s;
                ''',
                [id_livro],
            )
            livro = dictfetchone(cursor)

        if not livro:
            return Response({'erro': 'Livro nao encontrado.'}, status=404)

        return Response(livro)

    def patch(self, request, id_livro):
        campos = []
        valores = []
        permitidos = ['titulo', 'autor', 'editora', 'ano_publicacao', 'id_categoria']

        for campo in permitidos:
            if campo in request.data:
                campos.append(f'{campo} = %s')
                valores.append(request.data.get(campo))

        if not campos:
            return Response({'erro': 'Nenhum campo informado para atualizacao.'}, status=400)

        valores.append(id_livro)

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    f'''
                    UPDATE livro
                    SET {', '.join(campos)}
                    WHERE id_livro = %s
                    RETURNING *;
                    ''',
                    valores,
                )
                livro = dictfetchone(cursor)
        except (IntegrityError, DatabaseError) as exc:
            return erro_banco(exc)

        if not livro:
            return Response({'erro': 'Livro nao encontrado.'}, status=404)

        return Response(livro)

    def delete(self, request, id_livro):
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    'DELETE FROM livro WHERE id_livro = %s RETURNING id_livro;',
                    [id_livro],
                )
                apagado = cursor.fetchone()
        except (IntegrityError, DatabaseError) as exc:
            return erro_banco(exc)

        if not apagado:
            return Response({'erro': 'Livro nao encontrado.'}, status=404)

        return Response({'mensagem': 'Livro removido com sucesso.', 'id_livro': id_livro})


class AlunoListCreateView(APIView):
    def get(self, request):
        dados = run_select(
            '''
            SELECT u.id_usuario, u.nome, u.email, u.endereco, u.status,
                   a.matricula, a.curso, a.semestre, a.observacao
            FROM aluno a
            JOIN usuario u ON u.id_usuario = a.id_usuario
            ORDER BY u.nome;
            '''
        )

        return Response(dados)

    def post(self, request):
        semestre = request.data.get('semestre')

        if semestre in (None, ''):
            semestre = None
        else:
            try:
                semestre = int(semestre)
            except (TypeError, ValueError):
                return Response(
                    {'erro': 'Semestre deve ser um numero inteiro.'},
                    status=400,
                )

            if semestre < 1:
                return Response(
                    {'erro': 'Semestre deve ser maior ou igual a 1.'},
                    status=400,
                )

        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute(
                        '''
                        INSERT INTO usuario (nome, email, endereco, status)
                        VALUES (%s, %s, %s, COALESCE(%s, 'ATIVO'))
                        RETURNING id_usuario;
                        ''',
                        [
                            request.data.get('nome'),
                            request.data.get('email'),
                            request.data.get('endereco'),
                            request.data.get('status'),
                        ],
                    )

                    id_usuario = cursor.fetchone()[0]

                    cursor.execute(
                        '''
                        INSERT INTO aluno (id_usuario, matricula, curso, semestre, observacao)
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING *;
                        ''',
                        [
                            id_usuario,
                            request.data.get('matricula'),
                            request.data.get('curso'),
                            semestre,
                            request.data.get('observacao'),
                        ],
                    )

                    aluno = dictfetchone(cursor)

            return Response(
                {'mensagem': 'Aluno cadastrado com sucesso.', 'aluno': aluno},
                status=201,
            )

        except (IntegrityError, DatabaseError) as exc:
            return erro_banco(exc)


class FuncionarioListCreateView(APIView):
    def get(self, request):
        dados = run_select(
            '''
            SELECT u.id_usuario, u.nome, u.email, u.endereco, u.status,
                   f.cargo, f.setor, f.salario, f.observacao
            FROM funcionario f
            JOIN usuario u ON u.id_usuario = f.id_usuario
            ORDER BY u.nome;
            '''
        )

        return Response(dados)

    def post(self, request):
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute(
                        '''
                        INSERT INTO usuario (nome, email, endereco, status)
                        VALUES (%s, %s, %s, COALESCE(%s, 'ATIVO'))
                        RETURNING id_usuario;
                        ''',
                        [
                            request.data.get('nome'),
                            request.data.get('email'),
                            request.data.get('endereco'),
                            request.data.get('status'),
                        ],
                    )

                    id_usuario = cursor.fetchone()[0]

                    cursor.execute(
                        '''
                        INSERT INTO funcionario (id_usuario, cargo, setor, salario, observacao)
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING *;
                        ''',
                        [
                            id_usuario,
                            request.data.get('cargo'),
                            request.data.get('setor'),
                            request.data.get('salario'),
                            request.data.get('observacao'),
                        ],
                    )

                    funcionario = dictfetchone(cursor)

            return Response(
                {
                    'mensagem': 'Funcionario cadastrado com sucesso.',
                    'funcionario': funcionario,
                },
                status=201,
            )

        except (IntegrityError, DatabaseError) as exc:
            return erro_banco(exc)


class EmprestimoListCreateView(APIView):
    def get(self, request):
        dados = run_select('SELECT * FROM emprestimo ORDER BY id_emprestimo DESC;')
        return Response(dados)

    def post(self, request):
        alunos, erro_alunos = normalizar_lista_ids(
            request.data.get('alunos'),
            'alunos',
        )
        livros, erro_livros = normalizar_lista_ids(
            request.data.get('livros'),
            'livros',
        )
        id_funcionario = request.data.get('id_funcionario')

        if erro_alunos:
            return erro_validacao(erro_alunos)

        if len(alunos) > 1:
            return erro_validacao('Informe apenas um aluno por emprestimo.')

        if erro_livros:
            return erro_validacao(erro_livros)

        if len(livros) != len(set(livros)):
            return erro_validacao('Nao informe o mesmo livro mais de uma vez.')

        if not id_funcionario:
            return erro_validacao('Informe id_funcionario.')

        try:
            id_funcionario = int(id_funcionario)
        except (TypeError, ValueError):
            return erro_validacao('id_funcionario deve ser numerico.')

        if id_funcionario <= 0:
            return erro_validacao('id_funcionario deve ser positivo.')

        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute(
                        '''
                        SELECT 1
                        FROM realiza_emprestimo re
                        JOIN emprestimo e ON e.id_emprestimo = re.id_emprestimo
                        WHERE re.id_aluno = %s
                          AND e.data_devolucao < CURRENT_DATE
                        LIMIT 1;
                        ''',
                        [alunos[0]],
                    )

                    if cursor.fetchone():
                        return erro_conflito(
                            {
                                'erro': 'Aluno possui emprestimo vencido e nao pode realizar novo emprestimo.'
                            }
                        )

                    cursor.execute(
                        '''
                        SELECT DISTINCT ri.id_livro
                        FROM registra_item ri
                        JOIN emprestimo e ON e.id_emprestimo = ri.id_emprestimo
                        WHERE ri.id_livro = ANY(%s)
                          AND e.data_emprestimo <= %s
                          AND e.data_devolucao >= %s
                        ORDER BY ri.id_livro;
                        ''',
                        [
                            livros,
                            request.data.get('data_devolucao'),
                            request.data.get('data_emprestimo'),
                        ],
                    )
                    livros_indisponiveis = [row[0] for row in cursor.fetchall()]

                    if livros_indisponiveis:
                        return erro_conflito(
                            {
                                'erro': 'Livro indisponivel para emprestimo.',
                                'livros_indisponiveis': livros_indisponiveis,
                            }
                        )

                    cursor.execute(
                        '''
                        INSERT INTO emprestimo (data_emprestimo, data_devolucao, multa, observacao)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id_emprestimo, data_emprestimo, data_devolucao, multa, observacao;
                        ''',
                        [
                            request.data.get('data_emprestimo'),
                            request.data.get('data_devolucao'),
                            request.data.get('multa'),
                            request.data.get('observacao'),
                        ],
                    )

                    emprestimo = dictfetchone(cursor)
                    id_emprestimo = emprestimo['id_emprestimo']

                    for id_aluno in alunos:
                        cursor.execute(
                            '''
                            INSERT INTO realiza_emprestimo (id_aluno, id_emprestimo)
                            VALUES (%s, %s);
                            ''',
                            [id_aluno, id_emprestimo],
                        )

                    for id_livro in livros:
                        cursor.execute(
                            '''
                            INSERT INTO registra_item (id_emprestimo, id_livro, id_funcionario)
                            VALUES (%s, %s, %s);
                            ''',
                            [id_emprestimo, id_livro, id_funcionario],
                        )

            return Response(
                {
                    'mensagem': 'Emprestimo criado com sucesso.',
                    'emprestimo': emprestimo,
                    'alunos': alunos,
                    'livros': livros,
                    'id_funcionario': id_funcionario,
                },
                status=201,
            )

        except (IntegrityError, DatabaseError) as exc:
            return erro_banco(exc)


class HistoricoEmprestimosView(APIView):
    def get(self, request):
        dados = run_select(
            '''
            SELECT *
            FROM vw_historico_emprestimos
            ORDER BY id_emprestimo, nome_aluno, titulo_livro;
            '''
        )

        return Response(dados)


class LivrosPorCategoriaView(APIView):
    def get(self, request):
        dados = run_select(
            '''
            SELECT c.nome AS categoria,
                   COUNT(l.id_livro) AS quantidade_livros
            FROM categoria c
            LEFT JOIN livro l ON l.id_categoria = c.id_categoria
            GROUP BY c.nome
            ORDER BY c.nome;
            '''
        )

        return Response(dados)


class CategoriasComMaisDeUmLivroView(APIView):
    def get(self, request):
        dados = run_select(
            '''
            SELECT c.nome AS categoria,
                   COUNT(l.id_livro) AS quantidade_livros
            FROM categoria c
            JOIN livro l ON l.id_categoria = c.id_categoria
            GROUP BY c.nome
            HAVING COUNT(l.id_livro) > 1
            ORDER BY quantidade_livros DESC;
            '''
        )

        return Response(dados)


class TesteGatilhoEmprestimoView(APIView):
    def post(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    '''
                    INSERT INTO emprestimo (data_emprestimo, data_devolucao, multa, observacao)
                    VALUES (%s, %s, %s, %s)
                    RETURNING *;
                    ''',
                    [
                        request.data.get('data_emprestimo', '2026-06-20'),
                        request.data.get('data_devolucao', '2026-06-10'),
                        request.data.get('multa', 0),
                        request.data.get('observacao', 'Teste do gatilho'),
                    ],
                )

                return Response(dictfetchone(cursor), status=201)

        except (IntegrityError, DatabaseError) as exc:
            return Response(
                {
                    'mensagem': 'Gatilho acionado pelo PostgreSQL. A operacao foi bloqueada.',
                    'detalhes': str(exc),
                },
                status=400,
            )


class TesteErroIntegridadeView(APIView):
    def post(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    '''
                    INSERT INTO usuario (nome, email, endereco, status)
                    VALUES ('Teste Integridade', 'joao.pereira@uece.br', 'Rua Teste', 'ATIVO')
                    RETURNING *;
                    '''
                )

                return Response(dictfetchone(cursor), status=201)

        except (IntegrityError, DatabaseError) as exc:
            return Response(
                {
                    'mensagem': 'Erro de integridade gerado pelo banco e tratado pela API.',
                    'detalhes': str(exc),
                },
                status=400,
            )
        
class AuthRegisterView(APIView):
    def post(self, request):
        nome = request.data.get('nome')
        email = request.data.get('email')
        senha = request.data.get('senha')
        endereco = request.data.get('endereco')
        status_usuario = request.data.get('status', 'ATIVO')

        if not nome or not email or not senha:
            return Response(
                {'erro': 'Nome, email e senha sao obrigatorios.'},
                status=400
            )

        if len(senha) < 4:
            return Response(
                {'erro': 'A senha deve ter pelo menos 4 caracteres.'},
                status=400
            )

        senha_hash = make_password(senha)

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    '''
                    INSERT INTO usuario (nome, email, endereco, status, senha_hash)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id_usuario, nome, email, endereco, status;
                    ''',
                    [nome, email, endereco, status_usuario, senha_hash]
                )

                usuario = dictfetchone(cursor)

            return Response(
                {
                    'mensagem': 'Usuario cadastrado com sucesso.',
                    'usuario': usuario
                },
                status=201
            )

        except (IntegrityError, DatabaseError) as exc:
            return erro_banco(exc)
        
        
class AuthLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        senha = request.data.get('senha')

        if not email or not senha:
            return Response(
                {'erro': 'Email e senha sao obrigatorios.'},
                status=400
            )

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    '''
                    SELECT id_usuario, nome, email, endereco, status, senha_hash
                    FROM usuario
                    WHERE email = %s;
                    ''',
                    [email]
                )

                usuario = dictfetchone(cursor)

            if not usuario:
                return Response(
                    {'erro': 'Email ou senha invalidos.'},
                    status=401
                )

            if usuario['status'] != 'ATIVO':
                return Response(
                    {'erro': 'Usuario inativo. Login nao permitido.'},
                    status=403
                )

            if not usuario.get('senha_hash'):
                return Response(
                    {'erro': 'Usuario ainda nao possui senha cadastrada.'},
                    status=400
                )

            if not check_password(senha, usuario['senha_hash']):
                return Response(
                    {'erro': 'Email ou senha invalidos.'},
                    status=401
                )

            usuario.pop('senha_hash', None)

            return Response(
                {
                    'mensagem': 'Login realizado com sucesso.',
                    'usuario': usuario
                },
                status=200
            )

        except (IntegrityError, DatabaseError) as exc:
            return erro_banco(exc)
