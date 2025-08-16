from django.conf import settings
from django.shortcuts import render, redirect
from django.core.serializers.json import DjangoJSONEncoder
import json
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
import requests
import io
from dotenv import load_dotenv
import os
import csv
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from .models import Expense

env_path = settings.BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(env_path)


def index(request):
    return render(request, 'index.html')

def dashboard(request):
    if not request.user.is_authenticated:
        return redirect('/')
    return render(request, 'dashboard.html', {'user': request.user})

def setting(request):
    if not request.user.is_authenticated:
        return redirect("/")
    return render(request, 'settings.html')

def addExpense(request):
    if not request.user.is_authenticated:
        return redirect("/")
    return render(request, 'add-expense.html')

def profile(request):
    if not request.user.is_authenticated:
        return redirect("/")
    return render(request, 'profile.html', {"user": request.user})

def recurring(request):
    if not request.user.is_authenticated:
        return redirect("/")
    return render(request, 'recurring.html')

def analytics(request):
    if not request.user.is_authenticated:
        return redirect("/")
    return render(request, 'analytics.html')

@login_required
def download_expenses_csv(request):
    response = HttpResponse(
        content_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename="expenses.csv"'},
    )

    writer = csv.writer(response)
    writer.writerow(['Date', 'Category', 'Amount', 'Currency', 'Description'])

    expenses = Expense.objects.filter(user=request.user).order_by('date')
    currency = request.user.profile.preferred_currency

    for expense in expenses:
        writer.writerow([
            expense.date, 
            expense.category.name if expense.category else 'N/A', 
            expense.amount, 
            currency,
            expense.description
        ])

    return response