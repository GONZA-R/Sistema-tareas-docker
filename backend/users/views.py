from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user.userprofile, "role", "empleado")

        # ADMIN GENERAL → ve TODOS los usuarios
        if role == "admin_general":
            return User.objects.all()

        # ADMIN → ve todos los admin y sus empleados asignados
        if role == "admin":
            # Trae a todos los admin + empleados asignados a este admin
            admin_users = User.objects.filter(userprofile__role='admin')
            assigned_employees = User.objects.filter(userprofile__assigned_to=user)
            return admin_users | assigned_employees

        # EMPLEADO → solo se ve a sí mismo
        return User.objects.filter(id=user.id)
