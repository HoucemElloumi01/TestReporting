"""
URL configuration for TestReporting project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import include, path, re_path
from reports.views import serve_react_app

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reports/', include('reports.urls')),
]

# Serve static files in development (from STATICFILES_DIRS)
urlpatterns += staticfiles_urlpatterns()

# Serve React app for all other routes (excluding api, admin, static)
urlpatterns += [
    re_path(r'^(?!api/|admin/|static/).*$', serve_react_app, name='react_app'),
]
