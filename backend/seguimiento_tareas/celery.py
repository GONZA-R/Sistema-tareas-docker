# seguimiento_tareas/celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'seguimiento_tareas.settings')

app = Celery('seguimiento_tareas')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

from celery.schedules import crontab

app.conf.beat_schedule = {
    'check-tasks-every-minute': {
        'task': 'tareas.tasks.check_task_due_dates',
        'schedule': 10
    },
}


#eeeeeeeS
