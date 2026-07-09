from django.contrib import admin

from .models import Execution, TestCase


@admin.register(Execution)
class ExecutionAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'uploaded_at')


@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ('testcase_id', 'testcase_name', 'status', 'analysis_status', 'execution')
    list_filter = ('status', 'analysis_status', 'execution')
    search_fields = ('testcase_id', 'testcase_name')
