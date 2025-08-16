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