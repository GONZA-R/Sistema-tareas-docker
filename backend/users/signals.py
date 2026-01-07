from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # Si el usuario es superusuario y no hay otros superusuarios, poner admin_general
        if instance.is_superuser and UserProfile.objects.count() == 0:
            role = 'admin_general'
        else:
            role = 'empleado'

        UserProfile.objects.create(user=instance, role=role)
