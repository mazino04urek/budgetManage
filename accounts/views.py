from django.conf import settings
from django.shortcuts import render, redirect
from django.core.serializers.json import DjangoJSONEncoder
import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
import requests
import io
from dotenv import load_dotenv
import os

from .forms import LoginForm, SignupForm
from .models import User

def auth(request):
    if request.method == 'POST':
        if "login_submit" in request.POST:
            login_form = LoginForm(request.POST)
            signup_form = SignupForm()
            if login_form.is_valid():
                email = login_form.cleaned_data['email']
                password = login_form.cleaned_data['password']
                user = authenticate(request, username=email, password=password)
                if user is not None:
                    login(request, user)
                    return JsonResponse({'success': True})
                else:
                    login_form.add_error(None, "Invalid email or password")
        elif "signup_submit" in request.POST:
            signup_form = SignupForm(request.POST)
            login_form = LoginForm()
            if signup_form.is_valid():
                user = signup_form.save(commit=False)
                user.set_password(signup_form.cleaned_data['password'])
                user.username = user.email
                user.save()
                login(request, user)
                return JsonResponse({'success': True})
            else:
                signup_form.add_error(None, "Invalid email or password")
    signup_form = SignupForm()
    login_form = LoginForm()
    return render(
        request, 'login.html', 
        {
            'signup_form': signup_form, 
            'login_form': login_form,
        })

def logout_view(request):
    if request.user.is_authenticated:
        logout(request)
        return redirect("/auth")
    return redirect("/")

def dashboard(request):
    if not request.user.is_authenticated:
        return redirect('/')
    return render(request, 'dashboard.html', {'user': request.user})