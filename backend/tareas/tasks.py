

"""from celery import shared_task
from datetime import date
from .models import Task, Notification
from .emails import send_task_email

@shared_task
def check_task_due_dates():
    today = date.today()
    total_checked = 0

    # ------------------------
    # Tareas vencidas
    # ------------------------
    overdue_tasks = Task.objects.filter(
        status='pendiente',
        due_date__lt=today,
        reminder_expired_sent=False
    )

    for task in overdue_tasks:
        involved_users = {u for u in [task.assigned_to, task.created_by, task.delegated_to] if u}

        for user in involved_users:
            Notification.objects.create(
                user=user,
                task=task,
                type="vencimiento",
                message=f"La tarea '{task.title}' ha vencido."
            )

            if user.email:
                try:
                    send_task_email(
                        subject=f"Tarea vencida: {task.title}",
                        message=f"Hola {user.username},\n\nLa tarea '{task.title}' ha vencido.\nIngresá al sistema para más detalles.",
                        recipient_email=user.email
                    )
                except Exception as e:
                    print(f"No se pudo enviar email a {user.email}: {e}")
                    Notification.objects.create(
                        user=user,
                        task=task,
                        type="error",
                        message=f"No se pudo enviar email a {user.username}"
                    )

        task.reminder_expired_sent = True
        task.save()
        total_checked += 1

    # ------------------------
    # Tareas por vencer hoy
    # ------------------------
    due_today_tasks = Task.objects.filter(
        status='pendiente',
        due_date=today,
        reminder_due_soon_sent=False
    )

    for task in due_today_tasks:
        involved_users = {u for u in [task.assigned_to, task.created_by, task.delegated_to] if u}

        for user in involved_users:
            Notification.objects.create(
                user=user,
                task=task,
                type="vencimiento",
                message=f"La tarea '{task.title}' vence hoy."
            )

            if user.email:
                try:
                    send_task_email(
                        subject=f"Tarea por vencer hoy: {task.title}",
                        message=f"Hola {user.username},\n\nLa tarea '{task.title}' vence hoy.\nIngresá al sistema para más detalles.",
                        recipient_email=user.email
                    )
                except Exception as e:
                    print(f"No se pudo enviar email a {user.email}: {e}")
                    Notification.objects.create(
                        user=user,
                        task=task,
                        type="error",
                        message=f"No se pudo enviar email a {user.username}"
                    )

        task.reminder_due_soon_sent = True
        task.save()
        total_checked += 1

    return f"Se revisaron {total_checked} tareas pendientes vencidas o por vencer hoy"
"""
"""
from celery import shared_task
from datetime import date
from .models import Task, Notification
from .emails import send_task_email

@shared_task
def check_task_due_dates():
    today = date.today()
    total_checked = 0

    # ------------------------
    # Tareas vencidas
    # ------------------------
    overdue_tasks = Task.objects.filter(
        status__in=['pendiente', 'en_progreso'],  # incluir en progreso
        due_date__lt=today,
        reminder_expired_sent=False
    )

    for task in overdue_tasks:
        involved_users = {u for u in [task.assigned_to, task.created_by, task.delegated_to] if u}

        for user in involved_users:
            Notification.objects.create(
                user=user,
                task=task,
                type="vencimiento",
                message=f"La tarea '{task.title}' ha vencido."
            )

            if user.email:
                try:
                    send_task_email(
                        subject=f"Tarea vencida: {task.title}",
                        message=f"Hola {user.username},\n\nLa tarea '{task.title}' ha vencido.\nIngresá al sistema para más detalles.",
                        recipient_email=user.email
                    )
                except Exception as e:
                    print(f"No se pudo enviar email a {user.email}: {e}")
                    Notification.objects.create(
                        user=user,
                        task=task,
                        type="error",
                        message=f"No se pudo enviar email a {user.username}"
                    )

        task.reminder_expired_sent = True
        task.save()
        total_checked += 1

    # ------------------------
    # Tareas por vencer hoy
    # ------------------------
    due_today_tasks = Task.objects.filter(
        status__in=['pendiente', 'en_progreso'],  # incluir en progreso
        due_date=today,
        reminder_due_soon_sent=False
    )

    for task in due_today_tasks:
        involved_users = {u for u in [task.assigned_to, task.created_by, task.delegated_to] if u}

        for user in involved_users:
            Notification.objects.create(
                user=user,
                task=task,
                type="vencimiento",
                message=f"La tarea '{task.title}' vence hoy."
            )

            if user.email:
                try:
                    send_task_email(
                        subject=f"Tarea por vencer hoy: {task.title}",
                        message=f"Hola {user.username},\n\nLa tarea '{task.title}' vence hoy.\nIngresá al sistema para más detalles.",
                        recipient_email=user.email
                    )
                except Exception as e:
                    print(f"No se pudo enviar email a {user.email}: {e}")
                    Notification.objects.create(
                        user=user,
                        task=task,
                        type="error",
                        message=f"No se pudo enviar email a {user.username}"
                    )

        task.reminder_due_soon_sent = True
        task.save()
        total_checked += 1

    return f"Se revisaron {total_checked} tareas pendientes o en progreso vencidas o por vencer hoy"
"""

"""from celery import shared_task
from django.utils import timezone  #  usar timezone para fecha local
from .models import Task, Notification
from .emails import send_task_email

@shared_task
def check_task_due_dates():
    today = timezone.localdate()  # usa la fecha local según TIME_ZONE
    total_checked = 0

    # ------------------------
    # Tareas vencidas
    # ------------------------
    overdue_tasks = Task.objects.filter(
        status__in=['pendiente', 'en_progreso'],  # incluir en progreso
        due_date__lt=today,
        reminder_expired_sent=False
    )

    for task in overdue_tasks:
        involved_users = {u for u in [task.assigned_to, task.created_by, task.delegated_to] if u}

        for user in involved_users:
            Notification.objects.create(
                user=user,
                task=task,
                type="vencimiento",
                message=f"La tarea '{task.title}' ha vencido."
            )

            if user.email:
                try:
                    send_task_email(
                        subject=f"Tarea vencida: {task.title}",
                        message=f"Hola {user.username},\n\nLa tarea '{task.title}' ha vencido.\nIngresá al sistema para más detalles.",
                        recipient_email=user.email
                    )
                except Exception as e:
                    print(f"No se pudo enviar email a {user.email}: {e}")
                    Notification.objects.create(
                        user=user,
                        task=task,
                        type="error",
                        message=f"No se pudo enviar email a {user.username}"
                    )

        task.reminder_expired_sent = True
        task.save()
        total_checked += 1

    # ------------------------
    # Tareas por vencer hoy
    # ------------------------
    due_today_tasks = Task.objects.filter(
        status__in=['pendiente', 'en_progreso'],
        due_date=today,
        reminder_due_soon_sent=False
    )

    for task in due_today_tasks:
        involved_users = {u for u in [task.assigned_to, task.created_by, task.delegated_to] if u}

        for user in involved_users:
            Notification.objects.create(
                user=user,
                task=task,
                type="vencimiento",
                message=f"La tarea '{task.title}' vence hoy."
            )

            if user.email:
                try:
                    send_task_email(
                        subject=f"Tarea por vencer hoy: {task.title}",
                        message=f"Hola {user.username},\n\nLa tarea '{task.title}' vence hoy.\nIngresá al sistema para más detalles.",
                        recipient_email=user.email
                    )
                except Exception as e:
                    print(f"No se pudo enviar email a {user.email}: {e}")
                    Notification.objects.create(
                        user=user,
                        task=task,
                        type="error",
                        message=f"No se pudo enviar email a {user.username}"
                    )

        task.reminder_due_soon_sent = True
        task.save()
        total_checked += 1

    return f"Se revisaron {total_checked} tareas pendientes o en progreso vencidas o por vencer hoy"
"""

from celery import shared_task
from django.utils import timezone
from .models import Task, Notification
from .emails import send_task_email

@shared_task
def check_task_due_dates():
    today = timezone.localdate()  # fecha local según TIME_ZONE
    total_checked = 0

    # ------------------------
    # 1️⃣ Tareas vencidas
    # ------------------------
    overdue_tasks = Task.objects.filter(
        status__in=['pendiente', 'en_progreso'],
        due_date__lt=today,
        reminder_expired_sent=False
    )

    for task in overdue_tasks:
        involved_users = {u for u in [task.assigned_to, task.created_by, task.delegated_to] if u}

        for user in involved_users:
            # Mensaje según rol
            if user == task.created_by:
                message_text = f"La tarea '{task.title}' que creaste para {task.assigned_to.username if task.assigned_to else 'N/A'} ha vencido."
            elif user == task.assigned_to:
                message_text = f"Tienes la tarea '{task.title}' que ha vencido."
            elif user == task.delegated_to:
                message_text = f"La tarea '{task.title}' delegada a ti ha vencido."
            else:
                message_text = f"La tarea '{task.title}' ha vencido."

            # Notificación interna
            Notification.objects.create(
                user=user,
                task=task,
                type="vencimiento",
                message=message_text
            )

            # Email
            if user.email:
                try:
                    send_task_email(
                        subject=f"Tarea vencida: {task.title}",
                        message=f"Hola {user.username},\n\n{message_text}\nIngresá al sistema para más detalles.",
                        recipient_email=user.email
                    )
                except Exception as e:
                    print(f"No se pudo enviar email a {user.email}: {e}")
                    Notification.objects.create(
                        user=user,
                        task=task,
                        type="error",
                        message=f"No se pudo enviar email a {user.username}"
                    )

        task.reminder_expired_sent = True
        task.save()
        total_checked += 1

    # ------------------------
    # 2️⃣ Tareas por vencer hoy
    # ------------------------
    due_today_tasks = Task.objects.filter(
        status__in=['pendiente', 'en_progreso'],
        due_date=today,
        reminder_due_soon_sent=False
    )

    for task in due_today_tasks:
        involved_users = {u for u in [task.assigned_to, task.created_by, task.delegated_to] if u}

        for user in involved_users:
            # Mensaje según rol
            if user == task.created_by:
                message_text = f"La tarea '{task.title}' que creaste para {task.assigned_to.username if task.assigned_to else 'N/A'} vence hoy."
            elif user == task.assigned_to:
                message_text = f"Tienes la tarea '{task.title}' que vence hoy."
            elif user == task.delegated_to:
                message_text = f"La tarea '{task.title}' delegada a ti vence hoy."
            else:
                message_text = f"La tarea '{task.title}' vence hoy."

            # Notificación interna
            Notification.objects.create(
                user=user,
                task=task,
                type="vencimiento",
                message=message_text
            )

            # Email
            if user.email:
                try:
                    send_task_email(
                        subject=f"Tarea por vencer hoy: {task.title}",
                        message=f"Hola {user.username},\n\n{message_text}\nIngresá al sistema para más detalles.",
                        recipient_email=user.email
                    )
                except Exception as e:
                    print(f"No se pudo enviar email a {user.email}: {e}")
                    Notification.objects.create(
                        user=user,
                        task=task,
                        type="error",
                        message=f"No se pudo enviar email a {user.username}"
                    )

        task.reminder_due_soon_sent = True
        task.save()
        total_checked += 1

    return f"Se revisaron {total_checked} tareas pendientes o en progreso vencidas o por vencer hoy"
#gggggggg