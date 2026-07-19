from django.urls import path

from . import views

urlpatterns = [
    path('health/', views.health, name='reports-health'),
    path('current-user/', views.current_user, name='reports-current-user'),
    path('login/', views.login_view, name='reports-login'),
    path('logout/', views.logout_view, name='reports-logout'),
    path('register/', views.register_view, name='reports-register'),
    path('users/', views.list_users, name='reports-list-users'),
    path('tickets/', views.list_tickets, name='reports-list-tickets'),
    path('tickets/flat/', views.list_tickets_flat, name='reports-list-tickets-flat'),
    path('tickets/create/', views.create_ticket, name='reports-create-ticket'),
    path('tickets/<int:ticket_id>/', views.update_ticket, name='reports-update-ticket'),
    path('tickets/<int:ticket_id>/detail/', views.get_ticket_detail, name='reports-ticket-detail'),
    path('tickets/<int:ticket_id>/submit-approval/', views.submit_for_approval, name='reports-submit-approval'),
    path('executions/<int:execution_id>/detail/', views.get_execution_detail, name='reports-execution-detail'),
    path('parse-json/', views.parse_json_reports, name='reports-parse-json'),
    path('assign-ticket/', views.assign_executions_to_ticket, name='reports-assign-ticket'),
    path('executions/', views.list_executions, name='reports-list-executions'),
    path('testcases/', views.list_testcases, name='reports-list-testcases'),
    path('testcases/<int:testcase_id>/', views.update_testcase, name='reports-update-testcase'),
    path('export/', views.export_excel, name='reports-export-excel'),
    # Approval workflow
    path('approvals/', views.list_approvals, name='reports-list-approvals'),
    path('approvals/my/', views.my_approvals, name='reports-my-approvals'),
    path('approvals/<int:approval_id>/review/', views.review_approval, name='reports-review-approval'),
    # Approved reports archive
    path('approved-reports/', views.list_approved_reports, name='reports-list-approved-reports'),
    path('approved-reports/create/', views.create_approved_report, name='reports-create-approved-report'),
    path('approved-reports/<str:report_id>/download/', views.download_approved_report, name='reports-download-approved-report'),
]