from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.db import transaction


class Achievement(models.Model):
    class AchievementKeys(models.TextChoices):
        FIRST_LOG = 'FIRST_LOG', 'First Drop in the Bucket'
        THREE_DAY_STREAK = 'THREE_DAY_STREAK', 'Getting Started'
        SEVEN_DAY_STREAK = 'SEVEN_DAY_STREAK', 'Weekly Warrior'
        THIRTY_DAY_STREAK = 'THIRTY_DAY_STREAK', 'Monthly Master'
        TENTH_LOG = 'TENTH_LOG', 'Diligent Logger'
        FIFTIETH_LOG = 'FIFTIETH_LOG', 'Super Scrivener'
        GOAL_SETTER = 'GOAL_SETTER', 'Dreamer'
        GOAL_ACHIEVER = 'GOAL_ACHIEVER', 'Goal Getter!'
        CATEGORY_EXPLORER = 'CATEGORY_EXPLORER', 'Organizer'

    key = models.CharField(
        max_length=50,
        choices=AchievementKeys.choices,
        unique=True,
        primary_key=True
    )
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    
    icon = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name

    @classmethod
    def populate_achievements(cls):
        achievements_data = {
            cls.AchievementKeys.FIRST_LOG: {
                "name": "First Drop in the Bucket",
                "description": "You've logged your very first expense!",
                "icon": "fa-solid fa-tint"
            },
            cls.AchievementKeys.THREE_DAY_STREAK: {
                "name": "Getting Started",
                "description": "Logged expenses for 3 days in a row. Consistency is key!",
                "icon": "fa-solid fa-seedling"
            },
            cls.AchievementKeys.SEVEN_DAY_STREAK: {
                "name": "Weekly Warrior",
                "description": "Maintained a 7-day logging streak. You're building a great habit!",
                "icon": "fa-solid fa-calendar-week"
            },
            cls.AchievementKeys.THIRTY_DAY_STREAK: {
                "name": "Monthly Master",
                "description": "Kept a logging streak for a full 30 days. Your finances are in great hands!",
                "icon": "fa-solid fa-crown"
            },
            cls.AchievementKeys.TENTH_LOG: {
                "name": "Diligent Logger",
                "description": "Logged a total of 10 expenses.",
                "icon": "fa-solid fa-list-ol"
            },
            cls.AchievementKeys.FIFTIETH_LOG: {
                "name": "Super Scrivener",
                "description": "Logged a total of 50 expenses. Look at all that data!",
                "icon": "fa-solid fa-file-invoice-dollar"
            },
            cls.AchievementKeys.GOAL_SETTER: {
                "name": "Dreamer",
                "description": "Set your first monthly savings goal. Aim high!",
                "icon": "fa-solid fa-bullseye"
            },
            cls.AchievementKeys.GOAL_ACHIEVER: {
                "name": "Goal Getter!",
                "description": "Successfully met a monthly savings goal. You did it!",
                "icon": "fa-solid fa-trophy"
            },
            cls.AchievementKeys.CATEGORY_EXPLORER: {
                "name": "Organizer",
                "description": "Used 5 different expense categories. Nicely sorted!",
                "icon": "fa-solid fa-tags"
            },
        }

        for key, data in achievements_data.items():
            cls.objects.update_or_create(
                key=key,
                defaults=data
            )

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
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    dob = models.DateField(null=True, blank=True)
    university = models.CharField(max_length=20, default="No university added")

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
    friends = models.ManyToManyField("self", blank=True, symmetrical=False)

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "User Activities"

    def __str__(self):
        return f"{self.user.username}: {self.activity_description}"
    
    def get_friend_list(self):
        friends_list = [
            {
                "username": friend.user.username,
                "id": friend.user.id,
            }
            for friend in self.friends.all()
        ]
        return friends_list