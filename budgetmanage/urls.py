from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from .views import index, dashboard, setting, addExpense, recurring, analytics

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index, name="index"),
    path('', include('accounts.urls')),
    path('dashboard/', dashboard, name='dashboard'),
    path('setting/', setting, name="setting"),
    path('add-expense/', addExpense, name="add-expense"),
    path('recurring/', recurring, name="recurring"),
    path('analytics/', analytics, name="analytics"),
]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)