from django.db import models
from django.contrib.auth.models import User


# =========================
# TASK
# =========================
class Task(models.Model):

    title = models.CharField(max_length=200)
    description = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=[
            ('pendiente', 'Pendiente'),
            ('en_progreso', 'En progreso'),
            ('completada', 'Completada'),
        ],
        default='pendiente'
    )

    priority = models.CharField(
        max_length=10,
        choices=[
            ('baja', 'Baja'),
            ('media', 'Media'),
            ('alta', 'Alta'),
        ],
        default='media'
    )

    start_date = models.DateField()
    due_date = models.DateField()

    created_by = models.ForeignKey(
        User,
        related_name='tasks_created',
        on_delete=models.CASCADE
    )

    # 🔹 Admin responsable
    assigned_to = models.ForeignKey(
        User,
        related_name='tasks_assigned',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # 🔹 Empleado ejecutor (SOLO cuando se delega)
    delegated_to = models.ForeignKey(
        User,
        related_name='tasks_delegated',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    # Campos para controlar notificaciones automáticas
    reminder_due_soon_sent = models.BooleanField(default=False)
    reminder_expired_sent = models.BooleanField(default=False)

    
    #reminder_sent = models.BooleanField(default=False)  # ← nuevo campo



# =========================
# DELEGACIONES (HISTORIAL)
# =========================
class TaskDelegation(models.Model):
    task = models.ForeignKey(
        Task,
        related_name='delegations',
        on_delete=models.CASCADE
    )

    from_user = models.ForeignKey(
        User,
        related_name='delegated_tasks_from',
        on_delete=models.SET_NULL,
        null=True
    )

    to_user = models.ForeignKey(
        User,
        related_name='delegated_tasks_to',
        on_delete=models.SET_NULL,
        null=True
    )

    delegated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.task.title} → {self.to_user}"


# =========================
# COMENTARIOS
# =========================
class Comment(models.Model):
    task = models.ForeignKey(
        Task,
        related_name='comments',
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


# =========================
# ARCHIVOS ADJUNTOS
# =========================

from .validators import validate_file_size, validate_file_extension

import os
from django.db import models
from django.contrib.auth.models import User


class TaskAttachment(models.Model):
    task = models.ForeignKey(
        'Task',
        on_delete=models.CASCADE,
        related_name='attachments'
    )

    file = models.FileField(
        upload_to='task_files/',
        validators=[
            validate_file_size,
            validate_file_extension
        ]
    )

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def delete(self, *args, **kwargs):
        if self.file and os.path.isfile(self.file.path):
            os.remove(self.file.path)
        super().delete(*args, **kwargs)


# =========================
# NOTIFICACIONES
# =========================
class Notification(models.Model):

    NOTIF_TYPE_CHOICES = [
        ('nueva', 'Nueva tarea'),
        ('delegacion', 'Tarea delegada'),
        ('estado', 'Estado actualizado'),
        ('comentario', 'Nuevo comentario'),
        ('vencimiento', 'Próxima a vencer'),
    ]

    user = models.ForeignKey(
        User,
        related_name='notifications',
        on_delete=models.CASCADE
    )

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE
    )

    type = models.CharField(
        max_length=20,
        choices=NOTIF_TYPE_CHOICES
    )

    message = models.CharField(max_length=255)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message


#dddddddd