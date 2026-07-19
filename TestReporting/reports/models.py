from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()


class UserProfile(models.Model):
    """Extended user profile with role information."""
    
    ROLE_CHOICES = [
        ('Tester', 'Tester'),
        ('Manager', 'Manager'),
    ]
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Tester')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f'{self.user.username} - {self.role}'
    
    @property
    def is_tester(self):
        return self.role == 'Tester'
    
    @property
    def is_manager(self):
        return self.role == 'Manager'

    @property
    def is_team_lead(self):
        return self.role == 'Manager'


class Ticket(models.Model):
    """A ticket (e.g., JIRA ticket, GitHub issue) that can have multiple executions."""
    
    TICKET_STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
        ('Reopened', 'Reopened'),
    ]
    
    APPROVAL_STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Pending Approval', 'Pending Approval'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
    title = models.CharField(max_length=255)
    key = models.CharField(max_length=100, unique=True, help_text='External ticket key, e.g., JIRA-123')
    url = models.URLField(blank=True, help_text='Link to the ticket in the tracking system')
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=TICKET_STATUS_CHOICES, default='Open')
    approval_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='Draft')
    assigned_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_tickets')
    rejection_reason = models.TextField(blank=True)
    manager_comment = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.key} - {self.title}'
    
    @property
    def execution_count(self):
        return self.executions.count()
    
    @property
    def testcase_count(self):
        return sum(e.testcases.count() for e in self.executions.all())


class Execution(models.Model):
    """One uploaded JsonReport.json file, optionally linked to a ticket."""
    
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    ticket = models.ForeignKey(Ticket, on_delete=models.SET_NULL, null=True, blank=True, related_name='executions')
    description = models.TextField(blank=True, help_text='Optional description of this execution run')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_executions')
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        ticket_info = f' [{self.ticket.key}]' if self.ticket else ''
        return f'{self.file_name}{ticket_info}'
    
    @property
    def testcase_count(self):
        return self.testcases.count()
    
    @property
    def status_summary(self):
        """Return dict with count of each status."""
        from django.db.models import Count
        counts = self.testcases.values('status').annotate(count=Count('status'))
        summary = {'Passed': 0, 'Failed': 0, 'Skipped': 0, 'Not Executed': 0}
        for c in counts:
            if c['status'] in summary:
                summary[c['status']] = c['count']
        return summary


class TestCase(models.Model):
    """A single test case extracted from an execution's JSON report."""
    
    ANALYSIS_STATUS_CHOICES = [
        ('Not Started', 'Not Started'),
        ('In Progress', 'In Progress'),
        ('Analyzed', 'Analyzed'),
        ('Issue Confirmed', 'Issue Confirmed'),
        ('False Alarm', 'False Alarm'),
        ('Closed', 'Closed'),
    ]
    
    execution = models.ForeignKey(Execution, on_delete=models.CASCADE, related_name='testcases')
    
    testcase_id = models.CharField(max_length=100)
    testcase_name = models.CharField(max_length=255)
    parameters = models.TextField(blank=True)
    parameters_raw = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20)
    description = models.TextField(blank=True)
    message = models.TextField(blank=True)
    test_step_description = models.TextField(blank=True)
    test_step_status = models.CharField(max_length=20, blank=True)
    expected_result = models.TextField(blank=True)
    actual_result = models.TextField(blank=True)
    steps = models.JSONField(default=list, blank=True)
    
    tester_conclusion = models.TextField(blank=True)
    analysis_status = models.CharField(
        max_length=30, choices=ANALYSIS_STATUS_CHOICES, default='Not Started'
    )
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['execution_id', 'testcase_id']
    
    def __str__(self):
        return f'{self.testcase_id} - {self.testcase_name}'
    
    def to_row(self):
        """Serialize back to the exact row shape the React table expects."""
        return {
            'id': self.id,
            'sourceFilename': self.execution.file_name,
            'executionId': self.execution_id,
            'executionDescription': self.execution.description,
            'ticketKey': self.execution.ticket.key if self.execution.ticket else None,
            'ticketTitle': self.execution.ticket.title if self.execution.ticket else None,
            'testcaseId': self.testcase_id,
            'testcaseName': self.testcase_name,
            'parameters': self.parameters,
            'parametersRaw': self.parameters_raw,
            'status': self.status,
            'description': self.description,
            'message': self.message,
            'testStepDescription': self.test_step_description,
            'testStepStatus': self.test_step_status,
            'expectedResult': self.expected_result,
            'actualResult': self.actual_result,
            'steps': self.steps,
            'testerConclusion': self.tester_conclusion,
            'analysisStatus': self.analysis_status,
        }
    
    def get_steps_summary(self):
        """Return a summary of test steps for quick display."""
        if not self.steps:
            return []
        return [
            {
                'name': step.get('name', f'Step {i+1}'),
                'status': step.get('status', 'Not Executed'),
                'message': step.get('message', ''),
                'expectedResult': step.get('expectedResult', ''),
                'actualResult': step.get('actualResult', ''),
                'group': step.get('group', ''),
                'type': step.get('type', 'STEP'),
            }
            for i, step in enumerate(self.steps)
        ]


class ApprovalRequest(models.Model):
    """Approval workflow for reports."""
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
    ticket = models.OneToOneField(Ticket, on_delete=models.CASCADE, related_name='approval_request')
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requested_approvals')
    requested_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_approvals')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_comments = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-requested_at']
    
    def __str__(self):
        return f'Approval for {self.ticket.key} - {self.status}'


class ApprovedReport(models.Model):
    """Archive of approved reports (Section 3)."""
    
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='approved_reports')
    report_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    excel_file = models.FileField(upload_to='reports/')
    total_executions = models.IntegerField()
    total_testcases = models.IntegerField()
    status_summary = models.JSONField(default=dict)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_reports')
    approved_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-approved_at']
    
    def __str__(self):
        return f'{self.report_id} - {self.ticket.key}'
    
    @property
    def status_badges(self):
        """Return list of status badges for display."""
        badges = []
        for status, count in self.status_summary.items():
            if count > 0:
                badges.append({'status': status, 'count': count})
        return badges