from django.contrib import admin
from .models import Expense, RecurringExpense
@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'category', 'amount', 'description', 'date')
    list_filter = ('user', 'category', 'date')
    search_fields = ('user', 'date', 'category')
    ordering = ('-date',)

@admin.register(RecurringExpense)
class RecurringExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'category', 'amount', 'description', 'frequency')
    list_filter = ('user', 'category', 'start_date')
    search_fields = ('user', 'start_date', 'category')
    ordering = ('-start_date',)