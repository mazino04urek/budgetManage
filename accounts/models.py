from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.db import transaction

# Create your models here.
class User(AbstractUser):

    def __str__(self):
        return f"{self.username}"

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
        }
