from django.contrib import admin

from .models import Execution, TestCase, Ticket, UserProfile, ApprovalRequest, ApprovedReport


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email')


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('key', 'title', 'url', 'status', 'approval_status', 'assigned_user', 'created_at', 'execution_count')
    list_filter = ('status', 'approval_status', 'assigned_user', 'created_at')
    search_fields = ('key', 'title')
    readonly_fields = ('created_at', 'updated_at', 'approved_at', 'approved_by')

    def execution_count(self, obj):
        return obj.executions.count()
    execution_count.short_description = 'Executions'


@admin.register(Execution)
class ExecutionAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'ticket', 'uploaded_at', 'uploaded_by', 'testcase_count')
    list_filter = ('ticket', 'uploaded_at', 'uploaded_by')
    search_fields = ('file_name',)
    readonly_fields = ('uploaded_at',)

    def testcase_count(self, obj):
        return obj.testcases.count()
    testcase_count.short_description = 'Test Cases'


@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ('testcase_id', 'testcase_name', 'status', 'analysis_status', 'execution')
    list_filter = ('status', 'analysis_status', 'execution')
    search_fields = ('testcase_id', 'testcase_name')


@admin.register(ApprovalRequest)
class ApprovalRequestAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'requested_by', 'requested_at', 'status', 'reviewed_by', 'reviewed_at')
    list_filter = ('status', 'requested_at', 'reviewed_at')
    search_fields = ('ticket__key', 'ticket__title')
    readonly_fields = ('requested_at', 'reviewed_at')


@admin.register(ApprovedReport)
class ApprovedReportAdmin(admin.ModelAdmin):
    list_display = ('report_id', 'ticket', 'title', 'total_executions', 'total_testcases', 'approved_by', 'approved_at')
    list_filter = ('approved_at', 'approved_by')
    search_fields = ('report_id', 'title', 'ticket__key')
    readonly_fields = ('created_at', 'approved_at')