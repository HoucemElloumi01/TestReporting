from django.urls import path

from . import views

urlpatterns = [
    path('health/', views.health, name='reports-health'),
    path('parse-json/', views.parse_json_reports, name='reports-parse-json'),
    path('testcases/', views.list_testcases, name='reports-list-testcases'),
    path('testcases/<int:testcase_id>/', views.update_testcase, name='reports-update-testcase'),
    path('export/', views.export_excel, name='reports-export-excel'),
]
