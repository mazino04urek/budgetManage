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
from .forms import AddExpenseForm, RecurringExpenseForm

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

@login_required
def addExpense(request):
    if request.method == 'POST' and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        is_recurring = request.POST.get('is_recurring') == 'on'
        if is_recurring:
            form = RecurringExpenseForm(request.POST, user=request.user)
        else:
            form = AddExpenseForm(request.POST, user=request.user)
        if form.is_valid():
            form.save()
            request.user.profile.update_streak()
            return JsonResponse({'status': 'success', 'message': 'Expense added successfully.'})
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)

    form = AddExpenseForm(user=request.user)
    recurring_form = RecurringExpenseForm(user=request.user)
    
    context = {
        'form': form,
        'recurring_form': recurring_form,
    }
    return render(request, 'add-expense.html', context)

def profile(request):
    if not request.user.is_authenticated:
        return redirect("/")
    return render(request, 'profile.html', {"user": request.user})

@login_required
def update_profile_view(request):
    if request.method == 'POST' and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        try:
            user = request.user
            profile = user.profile

            user.first_name = request.POST.get('first_name', user.first_name)
            user.last_name = request.POST.get('last_name', user.last_name)
            user.save()

            profile.phone_number = request.POST.get('phone_number', profile.phone_number)
            profile.university = request.POST.get('university', profile.university)
            profile.save()
            
            updated_data = {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone_number': profile.phone_number,
                'university': profile.university,
            }

            return JsonResponse({'status': 'success', 'data': updated_data})

        except Exception as e:
            return JsonResponse({'status': 'error', 'error': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'error': 'Invalid request'}, status=400)

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

@login_required
def qr_scanner(request):
    return render(request, 'qr-scanner.html')