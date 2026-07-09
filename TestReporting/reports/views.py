import json

from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from .models import Execution, TestCase
from .parsers import parse_report_payload


@require_GET
def health(_request):
    return JsonResponse({'status': 'ok', 'service': 'reports'})


@csrf_exempt
@require_POST
def parse_json_reports(request):
    """Parse one or more uploaded JsonReport.json files AND persist them to the database."""
    files = request.FILES.getlist('files')

    if not files:
        return JsonResponse({'error': 'Upload one or more JSON files using the "files" form field.'}, status=400)

    rows = []
    loaded_files = []

    try:
        for uploaded_file in files:
            payload = json.loads(uploaded_file.read().decode('utf-8'))
            parsed_rows = parse_report_payload(payload, uploaded_file.name)

            execution = Execution.objects.create(file_name=uploaded_file.name)

            for parsed in parsed_rows:
                testcase = TestCase.objects.create(
                    execution=execution,
                    testcase_id=parsed['testcaseId'],
                    testcase_name=parsed['testcaseName'],
                    parameters=parsed['parameters'],
                    parameters_raw=parsed['parametersRaw'],
                    status=parsed['status'],
                    description=parsed['description'],
                    message=parsed['message'],
                    test_step_description=parsed['testStepDescription'],
                    test_step_status=parsed['testStepStatus'],
                    expected_result=parsed['expectedResult'],
                    actual_result=parsed['actualResult'],
                    steps=parsed['steps'],
                )
                rows.append(testcase.to_row())

            loaded_files.append({'name': uploaded_file.name, 'size': uploaded_file.size})
    except json.JSONDecodeError as error:
        return JsonResponse({'error': f'Invalid JSON: {error}'}, status=400)
    except UnicodeDecodeError:
        return JsonResponse({'error': 'Uploaded files must be UTF-8 encoded JSON.'}, status=400)

    return JsonResponse(
        {
            'loadedFiles': loaded_files,
            'totalRows': len(rows),
            'rows': rows,
        }
    )


@require_GET
def list_testcases(_request):
    """Return every test case currently stored, across all uploaded executions."""
    testcases = TestCase.objects.select_related('execution').order_by('execution_id', 'id')
    rows = [testcase.to_row() for testcase in testcases]
    loaded_files = list(Execution.objects.values_list('file_name', flat=True).order_by('uploaded_at'))
    return JsonResponse({'rows': rows, 'loadedFiles': loaded_files})


@csrf_exempt
@require_http_methods(['PATCH'])
def update_testcase(request, testcase_id):
    """Save the tester's conclusion and analysis status for one test case."""
    try:
        testcase = TestCase.objects.get(id=testcase_id)
    except TestCase.DoesNotExist:
        return JsonResponse({'error': 'Test case not found.'}, status=404)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    if 'testerConclusion' in payload:
        testcase.tester_conclusion = payload['testerConclusion']
    if 'analysisStatus' in payload:
        testcase.analysis_status = payload['analysisStatus']

    testcase.save()
    return JsonResponse(testcase.to_row())


@require_GET
def export_excel(_request):
    """Export every stored test case to an .xlsx file."""
    from openpyxl import Workbook
    from openpyxl.styles import Font

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = 'Execution Report'

    headers = [
        'Source file', 'Testcase ID', 'Testcase name', 'Parameters', 'Status',
        'Description', 'Test step description', 'Test step status',
        'Expected result', 'Actual result', 'Tester conclusion', 'Analysis status',
    ]
    sheet.append(headers)
    for cell in sheet[1]:
        cell.font = Font(bold=True)

    testcases = TestCase.objects.select_related('execution').order_by('execution_id', 'id')
    for testcase in testcases:
        sheet.append([
            testcase.execution.file_name,
            testcase.testcase_id,
            testcase.testcase_name,
            testcase.parameters,
            testcase.status,
            testcase.description,
            testcase.test_step_description,
            testcase.test_step_status,
            testcase.expected_result,
            testcase.actual_result,
            testcase.tester_conclusion,
            testcase.analysis_status,
        ])

    for column_cells in sheet.columns:
        length = max(len(str(cell.value or '')) for cell in column_cells)
        sheet.column_dimensions[column_cells[0].column_letter].width = min(max(length + 2, 12), 60)

    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename="execution_report.xlsx"'
    workbook.save(response)
    return response
