from rest_framework import serializers
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .emails import send_task_email

from .models import (
    Task,
    TaskDelegation,
    Comment,
    TaskAttachment,
    Notification
)

# =========================
# USER SERIALIZER
# =========================
class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]

    def get_role(self, obj):
        try:
            return obj.userprofile.role
        except:
            return None


# =========================
# TASK SERIALIZER
# =========================
class TaskSerializer(serializers.ModelSerializer):

    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    delegated_to = UserSerializer(read_only=True)

    # INPUT
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    delegated_to_id = serializers.IntegerField(write_only=True, required=False)

    delegated_by = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "start_date",
            "due_date",
            "created_by",
            "assigned_to",
            "delegated_to",
            "assigned_to_id",
            "delegated_to_id",
            "delegated_by",
            "created_at",
            "updated_at",
        ]

    # =========================
    # CREATE
    # =========================
    def create(self, validated_data):
        request = self.context["request"]

        assigned_to_id = validated_data.pop("assigned_to_id", None)
        validated_data.pop("delegated_to_id", None)  # no se delega en create

        validated_data["created_by"] = request.user

        if assigned_to_id:
            validated_data["assigned_to"] = get_object_or_404(User, id=assigned_to_id)
        else:
            validated_data["assigned_to"] = request.user

        task = Task.objects.create(**validated_data)

        #  Notificación
        if task.assigned_to:
            Notification.objects.create(
                user=task.assigned_to,
                task=task,
                type="nueva",
                message=f"Nueva tarea asignada: {task.title}"
            )
            # **Enviar correo**
            if task.assigned_to.email:
                try:
                    send_task_email(
                        subject="Nueva tarea asignada",
                        message=(
                            f"Hola {task.assigned_to.username},\n\n"
                            f"Se te asignó una nueva tarea: {task.title}\n\n"
                            f"Creada por: {request.user.username}\n"
                            f"Ingresá al sistema para más detalles."
                        ),
                        recipient_email=task.assigned_to.email
                    )
                except Exception as e:
                    print(f"No se pudo enviar email: {e}")
                    Notification.objects.create(
                        user=request.user,
                        task=task,
                        type="error",
                        message=f"No se pudo enviar email a {task.assigned_to.username}"
                    )
        

        return task

    # =========================
    # UPDATE (DELEGAR / EDITAR)
    # =========================
    

    def update(self, instance, validated_data):
        request = self.context["request"]

        delegated_to_id = validated_data.pop("delegated_to_id", None)
        validated_data.pop("assigned_to_id", None)  # protegido

        # --- Guardar valores antiguos para detectar cambios ---
        old_data = {
            "title": instance.title,
            "description": instance.description,
            "status": instance.status,
            "priority": instance.priority,
            "assigned_to": instance.assigned_to,
            "due_date": instance.due_date,
        }

        # Actualizar campos normales
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # --- Delegación existente ---
        if delegated_to_id:
            new_user = get_object_or_404(User, id=delegated_to_id)

            if instance.delegated_to != new_user:
                TaskDelegation.objects.create(
                    task=instance,
                    from_user=request.user,
                    to_user=new_user
                )

                instance.delegated_to = new_user

                Notification.objects.create(
                    user=new_user,
                    task=instance,
                    type="delegacion",
                    message=f"La tarea '{instance.title}' fue delegada por {request.user.username}"
                )

                Notification.objects.create(
                    user=request.user,
                    task=instance,
                    type="delegacion",
                    message=f"Delegaste la tarea '{instance.title}' a {new_user.username}"
                )

                # Enviar email al usuario delegado
                if new_user.email:
                    try:
                        send_task_email(
                            subject="Tarea delegada",
                            message=(
                                f"Hola {new_user.username},\n\n"
                                f"La tarea '{instance.title}' fue delegada a vos.\n\n"
                                f"Delegada por: {request.user.username}\n\n"
                                f"Ingresá al sistema para verla."
                            ),
                            recipient_email=new_user.email
                        )
                    except Exception as e:
                        print(f"No se pudo enviar email a {new_user.email}: {e}")
                        Notification.objects.create(
                            user=request.user,
                            task=instance,
                            type="error",
                            message=f"No se pudo enviar email a {new_user.username}"
                        )

        instance.save()

        # =========================
        # NOTIFICACIÓN POR CAMBIO DE ESTADO (AL CREADOR)
        # =========================
        if old_data["status"] != instance.status:
            notified_users = set()

            # creador
            if instance.created_by:
                notified_users.add(instance.created_by)

            # asignado
            if instance.assigned_to:
                notified_users.add(instance.assigned_to)

            # delegado
            if instance.delegated_to:
                notified_users.add(instance.delegated_to)

            for user in notified_users:
                Notification.objects.create(
                    user=user,
                    task=instance,
                    type="estado",
                    message=(
                        f"La tarea '{instance.title}' cambió de estado: "
                        f"{old_data['status']} → {instance.status}"
                    )
                )




        # --- Enviar correo si cambió algún campo importante ---
        changes = []
        for field in ["title", "description", "status", "priority", "due_date"]:
            old = old_data[field]
            new = getattr(instance, field)
            if old != new:
                changes.append(f"{field.capitalize()}: {old} → {new}")

        if changes:
            emailed_users = set()

            if instance.created_by and instance.created_by.email:
                emailed_users.add(instance.created_by)

            if instance.assigned_to and instance.assigned_to.email:
                emailed_users.add(instance.assigned_to)

            if instance.delegated_to and instance.delegated_to.email:
                emailed_users.add(instance.delegated_to)

            for user in emailed_users:
                try:
                    send_task_email(
                        subject=f"Tarea actualizada: {instance.title}",
                        message=(
                            f"Hola {user.username},\n\n"
                            f"La tarea '{instance.title}' ha sido actualizada:\n\n"
                            + "\n".join(changes) +
                            "\n\nIngresá al sistema para ver los detalles."
                        ),
                        recipient_email=user.email
                    )
                except Exception as e:
                    print(f"No se pudo enviar email a {user.email}: {e}")
                    Notification.objects.create(
                        user=request.user,
                        task=instance,
                        type="error",
                        message=f"No se pudo enviar email a {user.username}"
                    )

        return instance


    # =========================
    # QUIÉN DELEGÓ (solo ejecutor)
    # =========================
    def get_delegated_by(self, obj):
        request = self.context.get("request")

        if not request or obj.delegated_to != request.user:
            return None

        delegation = obj.delegations.order_by("-delegated_at").first()
        if delegation and delegation.from_user:
            return UserSerializer(delegation.from_user).data

        return None


# =========================
# COMMENT SERIALIZER
# =========================
class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "task", "message", "user", "created_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        comment = super().create(validated_data)

        if comment.task.assigned_to:
            Notification.objects.create(
                user=comment.task.assigned_to,
                task=comment.task,
                type="comentario",
                message=f"Nuevo comentario en: {comment.task.title}"
            )

        return comment


# =========================
# ATTACHMENT SERIALIZER
# =========================
"""class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model = TaskAttachment
        fields = ["id", "task", "file", "uploaded_by", "uploaded_at"]

    def create(self, validated_data):
        validated_data["uploaded_by"] = self.context["request"].user
        attachment = super().create(validated_data)

        if attachment.task.assigned_to:
            Notification.objects.create(
                user=attachment.task.assigned_to,
                task=attachment.task,
                type="archivo",
                message=f"Nuevo archivo adjunto en: {attachment.task.title}"
            )

        return attachment
"""



"""class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model = TaskAttachment
        fields = ["id", "task", "file", "uploaded_by", "uploaded_at"]

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["uploaded_by"] = request.user

        attachment = super().create(validated_data)

        task = attachment.task
        uploader = request.user

        
        # =========================
        # NOTIFICACIÓN INTERNA
        # =========================
        notified_users = set()

        if task.assigned_to:
            notified_users.add(task.assigned_to)

        if task.created_by:
            notified_users.add(task.created_by)

        for user in notified_users:
            Notification.objects.create(
                user=user,
                task=task,
                type="archivo",
                message=f"{uploader.username} agregó un archivo a la tarea: {task.title}"

            )


        # =========================
        # EMAIL
        # =========================
        recipients = set()

        if task.assigned_to and task.assigned_to.email:
            recipients.add(task.assigned_to)

        if task.created_by and task.created_by.email:
            recipients.add(task.created_by)

        if task.delegated_to and task.delegated_to.email:
            recipients.add(task.delegated_to)

        for user in recipients:
            try:
                send_task_email(
                    subject=f"Nuevo archivo adjunto: {task.title}",
                    message=(
                        f"Hola {user.username},\n\n"
                        f"Se agregó un nuevo archivo a la tarea:\n\n"
                        f"Título: {task.title}\n"
                        f"Subido por: {uploader.username}\n\n"
                        f"Ingresá al sistema para verlo."
                    ),
                    recipient_email=user.email
                )
            except Exception as e:
                print(f"No se pudo enviar email a {user.email}: {e}")
                Notification.objects.create(
                    user=uploader,
                    task=task,
                    type="error",
                    message=f"No se pudo enviar email a {user.username}"
                )

        return attachment"""

class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model = TaskAttachment
        fields = ["id", "task", "file", "uploaded_by", "uploaded_at"]

    def create(self, validated_data):
        request = self.context["request"]
        uploader = request.user
        validated_data["uploaded_by"] = uploader

        attachment = super().create(validated_data)
        task = attachment.task

        # ----------------------------
        # Notificación interna
        # ----------------------------
        involved_users = {u for u in [task.assigned_to, task.created_by, task.delegated_to] if u}

        for user in involved_users:
            Notification.objects.create(
                user=user,
                task=task,
                type="archivo",
                message=f"{uploader.username} agregó un archivo '{attachment.file.name.split('/')[-1]}' a la tarea: {task.title}"
            )

        # ----------------------------
        # Enviar email a todos los involucrados
        # ----------------------------
        for user in involved_users:
            if user.email:
                try:
                    send_task_email(
                        subject=f"Nuevo archivo adjunto: {task.title}",
                        message=(
                            f"Hola {user.username},\n\n"
                            f"{uploader.username} agregó un nuevo archivo a la tarea:\n"
                            f"Título: {task.title}\n"
                            f"Archivo: {attachment.file.name.split('/')[-1]}\n\n"
                            "Ingresá al sistema para verlo."
                        ),
                        recipient_email=user.email
                    )
                except Exception as e:
                    print(f"No se pudo enviar email a {user.email}: {e}")
                    Notification.objects.create(
                        user=uploader,
                        task=task,
                        type="error",
                        message=f"No se pudo enviar email a {user.username}"
                    )

        return attachment


# =========================
# TASK DETAIL SERIALIZER
# =========================
class TaskDetailSerializer(TaskSerializer):
    attachments = TaskAttachmentSerializer(many=True, read_only=True)

    class Meta(TaskSerializer.Meta):
        fields = TaskSerializer.Meta.fields + ["attachments"]


# =========================
# NOTIFICATION SERIALIZER
# =========================
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "task",
            "type",
            "message",
            "is_read",
            "created_at"
        ]
