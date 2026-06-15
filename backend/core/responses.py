from rest_framework.response import Response


def erro_validacao(mensagem):
    return Response({'erro': mensagem}, status=400)


def erro_conflito(payload):
    return Response(payload, status=409)


def erro_banco(exc, status=400):
    return Response(
        {
            'erro': 'Operacao rejeitada pelo PostgreSQL.',
            'detalhes': str(exc),
        },
        status=status,
    )
