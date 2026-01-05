# =========================
# IMPORTS DJANGO / DRF
# =========================
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from rest_framework import viewsets, status, permissions, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

# =========================
# MODELS
# =========================
from .models import (
    Task,
    TaskDelegation,
    Comment,
    TaskAttachment,
    Notification
)

from users.models import UserProfile

# =========================
# SERIALIZERS
# =========================
from .serializers import (
    TaskSerializer,
    TaskDetailSerializer,
    CommentSerializer,
    TaskAttachmentSerializer,
    NotificationSerializer
)

# ============================================================
# PERMISOS
# ============================================================
class IsHRorOwner(permissions.BasePermission):
    """
    Admin ve todo
    Empleado solo ve tareas donde es assigned_to
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        if request.method in permissions.SAFE_METHODS:
            return obj.assigned_to == request.user

        return False


# ============================================================
# TASK CRUD
# ============================================================


from .emails import send_task_email

class TaskViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return TaskDetailSerializer
        return TaskSerializer

    def get_queryset(self):
        user = self.request.user

        try:
            role = user.userprofile.role
        except UserProfile.DoesNotExist:
            role = None

        # =========================
        # ADMIN
        # =========================
        if role == "admin":
            return Task.objects.filter(
                Q(created_by=user) |
                Q(assigned_to=user) |
                Q(delegated_to=user) |
                Q(delegations__from_user=user) |
                Q(delegations__to_user=user)
            ).distinct().order_by("-created_at")

        # =========================
        # EMPLEADO
        # =========================
        return Task.objects.filter(
            Q(assigned_to=user) |
            Q(delegated_to=user)
        ).order_by("-created_at")

    # =========================
    # CREATE
    # =========================
    def perform_create(self, serializer):
        assigned_admin = serializer.validated_data.get("assigned_to")

        task = serializer.save(
            created_by=self.request.user
        )

        if assigned_admin:
            Notification.objects.create(
                user=assigned_admin,
                task=task,
                type="nueva",
                message=f"Nueva tarea asignada: {task.title}"
            )
        
        # Notificar al creador (solo si es otro usuario)
        if assigned_admin != self.request.user:
            Notification.objects.create(
                user=self.request.user,
                task=task,
                type="creada",
                message=f"Creaste la tarea: {task.title}"
            )

        

        """    # Email
        assigned_admin = task.assigned_to


        assigned_admin = task.assigned_to

        if assigned_admin and assigned_admin.email:
            send_task_email(
                subject="Nueva tarea asignada",
                message=(
                    f"Hola {assigned_admin.username},\n\n"
                    f"Se te asignó una nueva tarea.\n\n"
                    f"Título: {task.title}\n"
                    f"Descripción: {task.description}\n"
                    f"Creada por: {task.created_by.username}\n\n"
                    f"Ingresá al sistema para más detalles."
                ),
                recipient_email=assigned_admin.email
            )
"""
    # =========================
    # DELEGAR
    # =========================
    @action(detail=True, methods=["post"])
    def delegate(self, request, pk=None):
        task = self.get_object()
        assigned_to_id = request.data.get("assigned_to")

        if not assigned_to_id:
            return Response(
                {"detail": "Debe indicar el usuario"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not request.user.is_staff:
            return Response(
                {"detail": "No tiene permisos"},
                status=status.HTTP_403_FORBIDDEN
            )

        new_user = get_object_or_404(User, id=assigned_to_id)
        
        if task.assigned_to != new_user:
            TaskDelegation.objects.create(
                task=task,
                from_user=request.user,
                to_user=new_user
            )

            task.assigned_to = new_user
            task.save()


            Notification.objects.create(
                user=new_user,
                task=task,
                type="delegacion",
                message=f"La tarea '{task.title}' fue delegada por {request.user.username}"
            )

            

        return Response(
            {"message": "Tarea delegada correctamente"},
            status=status.HTTP_200_OK
        )


# ============================================================
# COMMENTS
# ============================================================
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by("-created_at")
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]  # desarrollo

    def perform_create(self, serializer):
        comment = serializer.save(user=self.request.user)

        if comment.task.assigned_to:
            Notification.objects.create(
                user=comment.task.assigned_to,
                task=comment.task,
                type="comentario",
                message=f"Nuevo comentario en: {comment.task.title}"
            )


# ============================================================
# ATTACHMENTS
# ============================================================
class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = TaskAttachment.objects.all().order_by("-uploaded_at")
    serializer_class = TaskAttachmentSerializer
    permission_classes = [AllowAny]  # desarrollo

    def perform_create(self, serializer):
        attachment = serializer.save()

        """if attachment.task.assigned_to:
            Notification.objects.create(
                user=attachment.task.assigned_to,
                task=attachment.task,
                type="archivo",
                message=f"Nuevo archivo adjunto en: {attachment.task.title}"
            )"""


# ============================================================
# NOTIFICATIONS
# ============================================================
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")


class NotificationActionsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = get_object_or_404(
            Notification,
            id=pk,
            user=request.user
        )
        notification.is_read = True
        notification.save()
        return Response({"message": "Notificación marcada como leída"})
    
    # 🔹 NUEVO: marcar todas
    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        # Marca todas las notificaciones no leídas del usuario como leídas
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "Todas las notificaciones marcadas como leídas"})


# ============================================================
# LOGIN CON EMAIL + JWT
# ============================================================
class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Email o contraseña incorrectos")

        user = authenticate(
            username=user_obj.username,
            password=password
        )

        if not user:
            raise serializers.ValidationError("Email o contraseña incorrectos")

        attrs["user"] = user
        return attrs


class EmailTokenObtainPairView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)

        try:
            role = user.userprofile.role
        except UserProfile.DoesNotExist:
            role = None

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": role,
            "username": user.username,
            "email": user.email
        })


# ============================================================
# ACTUALIZAR ESTADO
# ============================================================
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_task_status(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    new_status = request.data.get("status")

    if new_status not in ["pendiente", "en_progreso", "completada"]:
        return Response(
            {"error": "Estado inválido"},
            status=status.HTTP_400_BAD_REQUEST
        )

    task.status = new_status
    task.save()

    if task.created_by != request.user:
        Notification.objects.create(
            user=task.created_by,
            task=task,
            type="estado",
            message=f"La tarea '{task.title}' cambió de estado"
        )

    return Response(
        {"message": "Estado actualizado", "status": task.status},
        status=status.HTTP_200_OK
    )
