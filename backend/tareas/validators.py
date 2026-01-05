import os
from django.core.exceptions import ValidationError

# Tamaño máximo: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# Extensiones permitidas
ALLOWED_EXTENSIONS = [
    '.pdf', '.txt',
    '.doc', '.docx',
    '.xls', '.xlsx',
    '.ppt', '.pptx',
    '.jpg', '.jpeg', '.png'
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
