# tareas/emails.py
from django.core.mail import send_mail
from django.conf import settings


def send_task_email(subject, message, recipient_email):
    """
    Envia un email simple (texto plano)
    """
    if not recipient_email:
        return

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient_email],
        fail_silently=False
    )
