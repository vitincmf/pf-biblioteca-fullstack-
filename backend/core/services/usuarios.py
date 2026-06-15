from django.contrib.auth.hashers import make_password

from ..db import dictfetchone


def validar_senha(senha, mensagem_obrigatoria):
    if not senha:
        return mensagem_obrigatoria

    if len(senha) < 4:
        return 'A senha deve ter pelo menos 4 caracteres.'

    return None


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
