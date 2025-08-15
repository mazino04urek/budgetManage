from django.urls import path
from . import views
from django.urls import path, include

urlpatterns = [
    path('auth/', views.auth, name='auth'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('logout/', views.logout_view, name='logout'),
]