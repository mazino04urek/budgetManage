from django.contrib import admin
from .models import Category, Expense, RecurringExpense

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'name')
    search_fields = ('user', 'name')

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