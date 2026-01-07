import os
from django.core.exceptions import ValidationError

# Tamaño máximo: 15 MB
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB


# Extensiones permitidas
ALLOWED_EXTENSIONS = [
    # Documentos
    '.pdf', '.txt',
    '.doc', '.docx',
    '.xls', '.xlsx',
    '.ppt', '.pptx',

    # Imágenes
    '.jpg', '.jpeg', '.png', '.webp',

    # Comprimidos
    '.zip', '.rar',

    # Técnicos / datos
    '.csv', '.json', '.xml', '.log',
]


def validate_file_size(file):
    if file.size > MAX_FILE_SIZE:
        raise ValidationError(
            "El archivo no puede superar los 10 MB"
        )


def validate_file_extension(file):
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            "Tipo de archivo no permitido"
        )
