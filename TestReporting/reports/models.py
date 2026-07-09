from django.db import models


class Execution(models.Model):
    """One uploaded JsonReport.json file."""

    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name


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

    def __str__(self):
        return f'{self.testcase_id} - {self.testcase_name}'

    def to_row(self):
        """Serialize back to the exact row shape the React table expects."""
        return {
            'id': self.id,
            'sourceFilename': self.execution.file_name,
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
