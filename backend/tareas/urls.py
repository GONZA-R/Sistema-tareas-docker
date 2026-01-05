from django.urls import path, include
from rest_framework.routers import DefaultRouter

from django.urls import path
from .views import update_task_status


from .views import (
    TaskViewSet, CommentViewSet,
    AttachmentViewSet, NotificationViewSet,
    NotificationActionsViewSet
)

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'attachments', AttachmentViewSet, basename='attachment')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),

    # Endpoint custom para marcar notificación como leída
    path(
        'notifications/<int:pk>/mark-read/',
        NotificationActionsViewSet.as_view({'post': 'mark_read'}),
        name='notification-mark-read'
    ),
    
    path("tasks/<int:task_id>/status/", update_task_status),

]
