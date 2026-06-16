from django.contrib.auth.hashers import make_password
from django.db import connection

from ..db import dictfetchone
from ..responses import erro_nao_autenticado, erro_nao_encontrado, erro_permissao


def validar_senha(senha, mensagem_obrigatoria):
    if not senha:
        return mensagem_obrigatoria

    if len(senha) < 4:
        return 'A senha deve ter pelo menos 4 caracteres.'

    return None


def obter_usuario_autenticado(request):
    id_usuario = request.headers.get('X-Usuario-Id')

    if id_usuario in (None, ''):
        return None, erro_nao_autenticado('Usuario autenticado nao informado.')

    try:
        id_usuario = int(id_usuario)
    except (TypeError, ValueError):
        return None, erro_nao_autenticado('X-Usuario-Id deve ser numerico.')

    if id_usuario <= 0:
        return None, erro_nao_autenticado('X-Usuario-Id deve ser positivo.')

    with connection.cursor() as cursor:
        cursor.execute(
            '''
            SELECT id_usuario, nome, email, status
            FROM usuario
            WHERE id_usuario = %s;
            ''',
            [id_usuario],
        )
        usuario = dictfetchone(cursor)

    if not usuario:
        return None, erro_nao_encontrado('Usuario autenticado nao encontrado.')

    return usuario, None


def obter_funcionario_ativo_da_requisicao(request):
    usuario, erro = obter_usuario_autenticado(request)

    if erro:
        return None, erro

    with connection.cursor() as cursor:
        cursor.execute(
            '''
            SELECT u.id_usuario, u.nome, u.email, u.status,
                   f.cargo, f.setor
            FROM funcionario f
            JOIN usuario u ON u.id_usuario = f.id_usuario
            WHERE f.id_usuario = %s;
            ''',
            [usuario['id_usuario']],
        )
        funcionario = dictfetchone(cursor)

    if not funcionario:
        return None, erro_permissao('Apenas funcionario pode executar esta operacao.')

    if funcionario['status'] != 'ATIVO':
        return None, erro_permissao(
            'Funcionario inativo nao pode executar esta operacao.'
        )

    return {
        'id_usuario': funcionario['id_usuario'],
        'nome': funcionario['nome'],
        'email': funcionario['email'],
        'cargo': funcionario['cargo'],
        'setor': funcionario['setor'],
    }, None


def criar_usuario_com_senha(
    cursor,
    nome,
    email,
    endereco,
    status_usuario,
    senha,
    retornar_dados=False,
):
    senha_hash = make_password(senha)

    if retornar_dados:
        cursor.execute(
            '''
            INSERT INTO usuario (nome, email, endereco, status, senha_hash)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id_usuario, nome, email, endereco, status;
            ''',
            [nome, email, endereco, status_usuario, senha_hash],
        )
        return dictfetchone(cursor)

    cursor.execute(
        '''
        INSERT INTO usuario (nome, email, endereco, status, senha_hash)
        VALUES (%s, %s, %s, COALESCE(%s, 'ATIVO'), %s)
        RETURNING id_usuario;
        ''',
        [nome, email, endereco, status_usuario, senha_hash],
    )
    return cursor.fetchone()[0]


def obter_perfil_usuario(cursor, id_usuario):
    cursor.execute(
        '''
        SELECT 1
        FROM aluno
        WHERE id_usuario = %s;
        ''',
        [id_usuario],
    )
    possui_perfil_aluno = cursor.fetchone() is not None

    cursor.execute(
        '''
        SELECT 1
        FROM funcionario
        WHERE id_usuario = %s;
        ''',
        [id_usuario],
    )
    possui_perfil_funcionario = cursor.fetchone() is not None

    if possui_perfil_aluno and possui_perfil_funcionario:
        return None, 'Usuario possui perfis conflitantes.'

    if possui_perfil_aluno:
        return 'aluno', None

    if possui_perfil_funcionario:
        return 'funcionario', None

    return 'nenhum', None
