from rest_framework import serializers
from django.contrib.auth.models import User
from users.models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True, required=False)
    role_display = serializers.SerializerMethodField(read_only=True)

    # Lectura
    assigned_to = serializers.SerializerMethodField(read_only=True)
    # Escritura
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='userprofile.assigned_to',
        required=False,
        allow_null=True
    )
    
    is_active = serializers.BooleanField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "role_display",
            "is_active",
            "password",
            "assigned_to",
            "assigned_to_id",
        ]
        extra_kwargs = {
            "password": {"write_only": True, "required": False}
        }

    def get_role_display(self, obj):
        profile = getattr(obj, "userprofile", None)
        return profile.role if profile else "empleado"

    def get_assigned_to(self, obj):
        profile = getattr(obj, "userprofile", None)
        return profile.assigned_to.id if profile and profile.assigned_to else None

    def create(self, validated_data):
        profile_data = validated_data.pop('userprofile', {})
        role = validated_data.pop("role", "empleado")
        assigned_to = profile_data.get('assigned_to', None)
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = role
        profile.assigned_to = assigned_to
        profile.created_by = self.context['request'].user
        profile.save()

        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('userprofile', {})
        role = validated_data.pop("role", None)
        assigned_to = profile_data.get('assigned_to', None)
        password = validated_data.pop("password", None)

        instance.username = validated_data.get("username", instance.username)
        instance.email = validated_data.get("email", instance.email)
        instance.is_active = validated_data.get("is_active", instance.is_active)

        if password:
            instance.set_password(password)
        instance.save()

        profile, _ = UserProfile.objects.get_or_create(user=instance)
        if role:
            profile.role = role
        profile.assigned_to = assigned_to
        profile.save()

        return instance
