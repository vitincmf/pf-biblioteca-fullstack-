from datetime import date
from decimal import Decimal, InvalidOperation


def normalizar_multa(valor):
    if valor in (None, ''):
        return None, None

    try:
        multa = Decimal(str(valor))
    except (InvalidOperation, TypeError, ValueError):
        return None, 'Multa deve ser numerica.'

    if multa < 0:
        return None, 'Multa nao pode ser negativa.'

    return multa, None


def normalizar_multa_criacao(valor):
    if valor in (None, ''):
        return Decimal('0'), None

    return normalizar_multa(valor)


def normalizar_data_iso(valor, nome_campo):
    if valor in (None, ''):
        return None, f'Informe {nome_campo}.'

    try:
        return date.fromisoformat(str(valor)), None
    except (TypeError, ValueError):
        return None, 'Datas devem estar no formato YYYY-MM-DD.'


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


def normalizar_semestre(valor):
    if valor in (None, ''):
        return None, None

    try:
        semestre = int(valor)
    except (TypeError, ValueError):
        return None, 'Semestre deve ser um numero inteiro.'

    if semestre < 1:
        return None, 'Semestre deve ser maior ou igual a 1.'

    return semestre, None
