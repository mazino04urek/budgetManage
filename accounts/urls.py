from django.urls import path
from . import views
from django.urls import path

urlpatterns = [
    path('auth/', views.auth, name='auth'),
    path('logout/', views.logout_view, name='logout'),
]