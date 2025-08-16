from django.db import models
from accounts.models import User
from django.utils import timezone

class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='categories')
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('user', 'name')
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} - {self.amount} on {self.category.name}"


class RecurringExpense(models.Model):
    class Frequency(models.TextChoices):
        DAILY = 'DAILY', 'Daily'
        WEEKLY = 'WEEKLY', 'Weekly'
        MONTHLY = 'MONTHLY', 'Monthly'
        YEARLY = 'YEARLY', 'Yearly'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recurring_expenses')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200)
    frequency = models.CharField(max_length=10, choices=Frequency.choices)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.get_frequency_display()} - {self.description} for {self.user.username}"

class AnalyticsCache(models.Model):
    class ReportType(models.TextChoices):
        WEEKLY = 'WEEKLY', 'Weekly'
        MONTHLY = 'MONTHLY', 'Monthly'
        YEARLY = 'YEARLY', 'Yearly'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics_cache')
    report_type = models.CharField(max_length=10, choices=ReportType.choices)
    data = models.JSONField() 
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'report_type')

    def __str__(self):
        return f"{self.user.username}'s {self.get_report_type_display()} Analytics"


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