from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.db import transaction
from budgetmanage.models import Achievement

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
            "profile": self.profile.to_dict(),
        }
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        with transaction.atomic():
            super().save(*args, **kwargs)
            if is_new:
                UserProfile.objects.create(user=self)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    preferred_currency = models.CharField(max_length=10, default='USD')
    monthly_savings_goal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    last_log_date = models.DateField(null=True, blank=True)
    streak_count = models.IntegerField(default=0)
    last_password_change = models.DateTimeField(null=True, blank=True)
    achievements = models.ManyToManyField(Achievement, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def update_streak(self):
        today = timezone.now().date()
        if self.last_log_date:
            if (today - self.last_log_date).days == 1:
                self.streak_count += 1
            elif (today - self.last_log_date).days > 1:
                self.streak_count = 1
        else:
            self.streak_count = 1

        self.last_log_date = today
        self.save()
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user.id,
            "preferred_currency": self.preferred_currency,
            "monthly_savings_goal": self.monthly_savings_goal,
            "last_log_date": self.last_log_date,
            "streak_count": self.streak_count,
        }

class UserActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_description = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp'] # Show newest activities first
        verbose_name_plural = "User Activities"

    def __str__(self):
        return f"{self.user.username}: {self.activity_description}"