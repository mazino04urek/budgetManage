from django import forms
from django.contrib.auth.forms import AuthenticationForm

from .models import User

class LoginForm(forms.Form):
    email = forms.CharField(widget=forms.EmailInput(attrs={'placeholder': 'Enter your email'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Enter your password'}))

class SignupForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'placeholder': 'Create a password'
    }))
    confirm_password = forms.CharField(widget=forms.PasswordInput(attrs={
        'placeholder': 'Confirm your password'
    }))

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']