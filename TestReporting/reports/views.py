import json
import os
from datetime import datetime

from django.contrib.auth import authenticate, login, logout, get_user_model
from django.http import HttpResponse, JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from .models import Execution, TestCase, Ticket, ApprovalRequest, ApprovedReport
from .parsers import parse_report_payload

User = get_user_model()


@require_GET
def health(_request):
    return JsonResponse({'status': 'ok', 'service': 'reports'})


@require_GET
def serve_react_app(_request):
    """Serve the React app for all non-API routes."""
    react_index = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'desktop', 'dist', 'index.html')
    if os.path.exists(react_index):
        with open(react_index, 'rb') as f:
            return HttpResponse(f.read(), content_type='text/html')
    return JsonResponse({'error': 'Frontend not built. Run `npm run build` in desktop folder.'}, status=503)


@require_GET
def current_user(request):
    """Get current user info with role."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        profile = request.user.profile
        role = profile.role
    except:
        role = 'Tester'
    
    return JsonResponse({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'fullName': request.user.get_full_name() or request.user.username,
        'role': role,
    })


@require_GET
def list_users(_request):
    """Return all users for assignment dropdowns."""
    users = User.objects.filter(is_active=True).order_by('username')
    data = [
        {
            'id': user.id,
            'username': user.username,
            'name': user.get_full_name() or user.username,
            'email': user.email,
        }
        for user in users
    ]
    return JsonResponse({'users': data})


@csrf_exempt
@require_POST
def login_view(request):
    """Login endpoint."""
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    username = payload.get('username', '').strip()
    password = payload.get('password', '')

    if not username or not password:
        return JsonResponse({'error': 'Username and password are required.'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({'error': 'Invalid username or password.'}, status=401)

    if not user.is_active:
        return JsonResponse({'error': 'Account is disabled.'}, status=401)

    login(request, user)

    # Get role from profile
    try:
        profile = user.profile
        role = profile.role
    except:
        role = 'Tester'

    return JsonResponse({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'fullName': user.get_full_name() or user.username,
        'role': role,
    })


@csrf_exempt
@require_POST
def logout_view(request):
    """Logout endpoint."""
    logout(request)
    return JsonResponse({'success': True})


@csrf_exempt
@require_POST
def register_view(request):
    """Register a new user account."""
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    username = payload.get('username', '').strip()
    email = payload.get('email', '').strip()
    password = payload.get('password', '')
    full_name = payload.get('fullName', '').strip()

    if not username or not password:
        return JsonResponse({'error': 'Username and password are required.'}, status=400)

    if len(password) < 6:
        return JsonResponse({'error': 'Password must be at least 6 characters.'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'error': 'Username already exists.'}, status=400)

    if email and User.objects.filter(email=email).exists():
        return JsonResponse({'error': 'Email already registered.'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    if full_name:
        parts = full_name.split(' ', 1)
        user.first_name = parts[0]
        user.last_name = parts[1] if len(parts) > 1 else ''
        user.save()

    login(request, user)

    return JsonResponse({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'fullName': user.get_full_name() or user.username,
        'role': 'Tester',
    })


@require_GET
def list_tickets(_request):
    """Return all tickets with their executions and test case counts."""
    tickets = Ticket.objects.select_related('assigned_user', 'created_by').prefetch_related('executions__testcases').all()
    data = []
    for ticket in tickets:
        executions = []
        total_testcases = 0
        for execution in ticket.executions.all().order_by('-uploaded_at'):
            testcases = list(execution.testcases.all().order_by('id'))
            total_testcases += len(testcases)
            executions.append({
                'id': execution.id,
                'fileName': execution.file_name,
                'uploadedAt': execution.uploaded_at.isoformat(),
                'description': execution.description,
                'testCaseCount': len(testcases),
                'testcases': [tc.to_row() for tc in testcases],
            })
        data.append({
            'id': ticket.id,
            'key': ticket.key,
            'title': ticket.title,
            'url': ticket.url,
            'description': ticket.description,
            'status': ticket.status,
            'approvalStatus': ticket.approval_status,
            'assignedUser': ticket.assigned_user.get_full_name() if ticket.assigned_user else None,
            'assignedUserId': ticket.assigned_user.id if ticket.assigned_user else None,
            'createdBy': ticket.created_by.get_full_name() if ticket.created_by else None,
            'createdById': ticket.created_by.id if ticket.created_by else None,
            'managerComment': ticket.manager_comment or '',
            'rejectionReason': ticket.rejection_reason or '',
            'executionCount': len(executions),
            'testCaseCount': total_testcases,
            'createdAt': ticket.created_at.isoformat(),
            'executions': executions,
        })
    return JsonResponse({'tickets': data})


@require_GET
def list_tickets_flat(_request):
    """Return all tickets with execution counts (flat list for dropdowns)."""
    tickets = Ticket.objects.select_related('assigned_user').prefetch_related('executions').all()
    data = [
        {
            'id': ticket.id,
            'key': ticket.key,
            'title': ticket.title,
            'url': ticket.url,
            'description': ticket.description,
            'status': ticket.status,
            'approvalStatus': ticket.approval_status,
            'assignedUser': ticket.assigned_user.get_full_name() if ticket.assigned_user else None,
            'executionCount': ticket.executions.count(),
            'createdAt': ticket.created_at.isoformat(),
        }
        for ticket in tickets
    ]
    return JsonResponse({'tickets': data})


@csrf_exempt
@require_http_methods(['POST'])
def create_ticket(request):
    """Create a new ticket."""
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    key = payload.get('key', '').strip()
    title = payload.get('title', '').strip()

    if not key or not title:
        return JsonResponse({'error': 'Key and title are required.'}, status=400)

    if Ticket.objects.filter(key=key).exists():
        return JsonResponse({'error': 'Ticket with this key already exists.'}, status=400)

    # Get assigned user if provided
    assigned_user_id = payload.get('assigned_user_id')
    assigned_user = None
    if assigned_user_id:
        try:
            assigned_user = User.objects.get(id=assigned_user_id)
        except User.DoesNotExist:
            pass

    ticket = Ticket.objects.create(
        key=key,
        title=title,
        url=payload.get('url', ''),
        description=payload.get('description', ''),
        status=payload.get('status', 'Open'),
        assigned_user=assigned_user,
        created_by=request.user if request.user.is_authenticated else None,
    )
    return JsonResponse({
        'id': ticket.id,
        'key': ticket.key,
        'title': ticket.title,
        'url': ticket.url,
        'description': ticket.description,
        'status': ticket.status,
        'approvalStatus': ticket.approval_status,
        'assignedUser': ticket.assigned_user.get_full_name() if ticket.assigned_user else None,
        'createdBy': ticket.created_by.get_full_name() if ticket.created_by else None,
        'executionCount': 0,
        'createdAt': ticket.created_at.isoformat(),
    })


@csrf_exempt
@require_http_methods(['PATCH', 'DELETE'])
def update_ticket(request, ticket_id):
    """Update or delete a ticket."""
    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return JsonResponse({'error': 'Ticket not found.'}, status=404)

    if request.method == 'DELETE':
        ticket.delete()
        return JsonResponse({'success': True})

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    if 'title' in payload:
        ticket.title = payload['title'].strip()
    if 'url' in payload:
        ticket.url = payload['url'].strip()
    if 'description' in payload:
        ticket.description = payload['description'].strip()
    if 'status' in payload:
        ticket.status = payload['status']
    if 'assigned_user_id' in payload:
        assigned_user_id = payload['assigned_user_id']
        if assigned_user_id:
            try:
                ticket.assigned_user = User.objects.get(id=assigned_user_id)
            except User.DoesNotExist:
                pass
        else:
            ticket.assigned_user = None

    ticket.save()
    return JsonResponse({
        'id': ticket.id,
        'key': ticket.key,
        'title': ticket.title,
        'url': ticket.url,
        'description': ticket.description,
        'status': ticket.status,
        'approvalStatus': ticket.approval_status,
        'assignedUser': ticket.assigned_user.get_full_name() if ticket.assigned_user else None,
        'executionCount': ticket.executions.count(),
        'createdAt': ticket.created_at.isoformat(),
    })


@require_GET
def get_ticket_detail(request, ticket_id):
    """Get a single ticket with all executions and testcases."""
    try:
        ticket = Ticket.objects.select_related('assigned_user').prefetch_related('executions__testcases').get(id=ticket_id)
    except Ticket.DoesNotExist:
        return JsonResponse({'error': 'Ticket not found.'}, status=404)

    executions = []
    for execution in ticket.executions.all().order_by('-uploaded_at'):
        testcases = list(execution.testcases.all().order_by('id'))
        executions.append({
            'id': execution.id,
            'fileName': execution.file_name,
            'uploadedAt': execution.uploaded_at.isoformat(),
            'description': execution.description,
            'testCaseCount': len(testcases),
            'testcases': [tc.to_row() for tc in testcases],
        })

    return JsonResponse({
        'id': ticket.id,
        'key': ticket.key,
        'title': ticket.title,
        'url': ticket.url,
        'description': ticket.description,
        'status': ticket.status,
        'approvalStatus': ticket.approval_status,
        'assignedUser': ticket.assigned_user.get_full_name() if ticket.assigned_user else None,
        'assignedUserId': ticket.assigned_user.id if ticket.assigned_user else None,
        'executionCount': len(executions),
        'testCaseCount': sum(e['testCaseCount'] for e in executions),
        'createdAt': ticket.created_at.isoformat(),
        'executions': executions,
    })


@require_GET
def get_execution_detail(request, execution_id):
    """Get a single execution with all its testcases."""
    try:
        execution = Execution.objects.select_related('ticket').prefetch_related('testcases').get(id=execution_id)
    except Execution.DoesNotExist:
        return JsonResponse({'error': 'Execution not found.'}, status=404)

    testcases = list(execution.testcases.all().order_by('id'))
    return JsonResponse({
        'id': execution.id,
        'fileName': execution.file_name,
        'uploadedAt': execution.uploaded_at.isoformat(),
        'ticketKey': execution.ticket.key if execution.ticket else None,
        'ticketTitle': execution.ticket.title if execution.ticket else None,
        'ticketId': execution.ticket.id if execution.ticket else None,
        'description': execution.description,
        'testCaseCount': len(testcases),
        'testcases': [tc.to_row() for tc in testcases],
    })


@csrf_exempt
@require_POST
def parse_json_reports(request):
    """Parse one or more uploaded JsonReport.json files AND persist them to the database.
    Files can be uploaded without a ticket - ticket can be assigned later."""
    files = request.FILES.getlist('files')

    if not files:
        return JsonResponse({'error': 'Upload one or more JSON files using the "files" form field.'}, status=400)

    rows = []
    loaded_files = []
    created_execution_ids = []

    try:
        for uploaded_file in files:
            payload = json.loads(uploaded_file.read().decode('utf-8'))
            parsed_rows = parse_report_payload(payload, uploaded_file.name)

            execution = Execution.objects.create(
                file_name=uploaded_file.name,
                ticket=None,  # No ticket assigned initially
                description=request.POST.get('execution_description', ''),
                uploaded_by=request.user if request.user.is_authenticated else None,
            )
            created_execution_ids.append(execution.id)

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
            'executionIds': created_execution_ids,
        }
    )


@csrf_exempt
@require_http_methods(['POST'])
def assign_executions_to_ticket(request):
    """Assign a list of execution IDs to a ticket."""
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    execution_ids = payload.get('execution_ids', [])
    ticket_id = payload.get('ticket_id')

    if not execution_ids:
        return JsonResponse({'error': 'No execution IDs provided.'}, status=400)

    if not ticket_id:
        return JsonResponse({'error': 'Ticket ID is required.'}, status=400)

    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return JsonResponse({'error': 'Ticket not found.'}, status=404)

    updated_count = Execution.objects.filter(id__in=execution_ids).update(ticket=ticket)

    return JsonResponse({
        'success': True,
        'updatedCount': updated_count,
        'ticket': {
            'id': ticket.id,
            'key': ticket.key,
            'title': ticket.title,
        }
    })


@require_GET
def list_testcases(_request):
    """Return every test case currently stored, across all uploaded executions."""
    testcases = TestCase.objects.select_related('execution', 'execution__ticket').order_by('execution_id', 'id')
    rows = [testcase.to_row() for testcase in testcases]
    loaded_files = list(Execution.objects.values_list('file_name', flat=True).order_by('uploaded_at'))
    return JsonResponse({'rows': rows, 'loadedFiles': loaded_files})


@require_GET
def list_executions(_request):
    """Return all executions with their test case counts and testcases, optionally filtered by ticket."""
    ticket_id = _request.GET.get('ticket_id')
    executions = Execution.objects.select_related('ticket').prefetch_related('testcases').order_by('-uploaded_at')
    if ticket_id:
        executions = executions.filter(ticket_id=ticket_id)
    
    data = [
        {
            'id': execution.id,
            'fileName': execution.file_name,
            'uploadedAt': execution.uploaded_at.isoformat(),
            'ticketKey': execution.ticket.key if execution.ticket else None,
            'ticketTitle': execution.ticket.title if execution.ticket else None,
            'description': execution.description,
            'testCaseCount': execution.testcases.count(),
            'testcases': [tc.to_row() for tc in execution.testcases.all().order_by('id')],
        }
        for execution in executions
    ]
    return JsonResponse({'executions': data})


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


# ============ APPROVAL WORKFLOW ============

@csrf_exempt
@csrf_exempt
@require_http_methods(['POST'])
def submit_for_approval(request, ticket_id):
    """Submit a ticket for Manager approval."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)

    try:
        profile = request.user.profile
    except:
        return JsonResponse({'error': 'User profile not found.'}, status=400)

    if profile.role != 'Tester':
        return JsonResponse({'error': 'Only Testers can submit tickets for approval.'}, status=403)

    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return JsonResponse({'error': 'Ticket not found.'}, status=404)

    if ticket.created_by and ticket.created_by != request.user:
        return JsonResponse({'error': 'You can only submit your own tickets for approval.'}, status=403)

    if hasattr(ticket, 'approval_request') and ticket.approval_request.status == 'Pending':
        return JsonResponse({'error': 'Ticket already has a pending approval request.'}, status=400)

    if hasattr(ticket, 'approval_request'):
        approval = ticket.approval_request
        approval.status = 'Pending'
        approval.requested_by = request.user
        approval.reviewed_by = None
        approval.reviewed_at = None
        approval.review_comments = ''
        approval.save()
    else:
        approval = ApprovalRequest.objects.create(
            ticket=ticket,
            requested_by=request.user,
        )

    ticket.approval_status = 'Pending Approval'
    ticket.save()

    return JsonResponse({
        'success': True,
        'approval': {
            'id': approval.id,
            'ticket': {'id': ticket.id, 'key': ticket.key, 'title': ticket.title},
            'requestedBy': approval.requested_by.get_full_name() if approval.requested_by else None,
            'requestedAt': approval.requested_at.isoformat(),
            'status': approval.status,
        }
    })


@require_GET
def list_approvals(request):
    """List all approval requests. Manager only."""
    if not request.user.is_authenticated:
        return JsonResponse({'approvals': []})

    try:
        profile = request.user.profile
        is_manager = profile.role == 'Manager'
    except:
        is_manager = False

    if not is_manager:
        return JsonResponse({'approvals': []})

    approvals = ApprovalRequest.objects.select_related('ticket', 'requested_by', 'reviewed_by').order_by('-requested_at')
    data = [
        {
            'id': a.id,
            'ticket': {
                'id': a.ticket.id,
                'key': a.ticket.key,
                'title': a.ticket.title,
                'status': a.ticket.status,
                'approvalStatus': a.ticket.approval_status,
            },
            'requestedBy': a.requested_by.get_full_name() if a.requested_by else None,
            'requestedAt': a.requested_at.isoformat(),
            'status': a.status,
            'reviewedBy': a.reviewed_by.get_full_name() if a.reviewed_by else None,
            'reviewedAt': a.reviewed_at.isoformat() if a.reviewed_at else None,
            'reviewComments': a.review_comments,
            'managerComment': a.ticket.manager_comment or '',
            'rejectionReason': a.ticket.rejection_reason or '',
        }
        for a in approvals
    ]
    return JsonResponse({'approvals': data})


@csrf_exempt
@require_http_methods(['POST'])
def review_approval(request, approval_id):
    """Approve or reject an approval request. Manager only."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)

    try:
        profile = request.user.profile
    except:
        return JsonResponse({'error': 'User profile not found.'}, status=400)

    if profile.role != 'Manager':
        return JsonResponse({'error': 'Only Managers can approve or reject tickets.'}, status=403)

    try:
        approval = ApprovalRequest.objects.select_related('ticket').get(id=approval_id)
    except ApprovalRequest.DoesNotExist:
        return JsonResponse({'error': 'Approval request not found.'}, status=404)

    if approval.requested_by == request.user:
        return JsonResponse({'error': 'You cannot approve or reject your own ticket.'}, status=403)
    
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)
    
    action = payload.get('action')  # 'approve' or 'reject'
    comments = payload.get('comments', '')
    
    if action not in ['approve', 'reject']:
        return JsonResponse({'error': 'Invalid action. Must be approve or reject.'}, status=400)
    
    if approval.status != 'Pending':
        return JsonResponse({'error': 'This approval has already been reviewed.'}, status=400)
    
    approval.status = 'Approved' if action == 'approve' else 'Rejected'
    approval.reviewed_by = request.user if request.user.is_authenticated else None
    approval.reviewed_at = datetime.now()
    approval.review_comments = comments
    approval.save()
    
    # Update ticket
    ticket = approval.ticket
    if action == 'approve':
        ticket.approval_status = 'Approved'
        ticket.approved_at = datetime.now()
        ticket.approved_by = request.user if request.user.is_authenticated else None
        ticket.manager_comment = comments
    else:
        ticket.approval_status = 'Rejected'
        ticket.rejection_reason = comments
        ticket.manager_comment = comments
    
    ticket.save()
    
    return JsonResponse({
        'success': True,
        'approval': {
            'id': approval.id,
            'status': approval.status,
            'reviewedBy': approval.reviewed_by.get_full_name() if approval.reviewed_by else None,
            'reviewedAt': approval.reviewed_at.isoformat(),
        },
        'ticket': {
            'id': ticket.id,
            'approvalStatus': ticket.approval_status,
        }
    })


@require_GET
def my_approvals(request):
    """Get approval requests for the current user (where they are reviewer)."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        profile = request.user.profile
        is_manager = profile.is_manager
    except:
        is_manager = False
    
    if not is_manager:
        return JsonResponse({'approvals': []})
    
    approvals = ApprovalRequest.objects.select_related('ticket', 'requested_by').filter(status='Pending').order_by('-requested_at')
    data = [
        {
            'id': a.id,
            'ticket': {
                'id': a.ticket.id,
                'key': a.ticket.key,
                'title': a.ticket.title,
                'status': a.ticket.status,
                'approvalStatus': a.ticket.approval_status,
            },
            'requestedBy': a.requested_by.get_full_name() if a.requested_by else None,
            'requestedAt': a.requested_at.isoformat(),
            'managerComment': a.ticket.manager_comment or '',
            'rejectionReason': a.ticket.rejection_reason or '',
        }
        for a in approvals
    ]
    return JsonResponse({'approvals': data})


# ============ APPROVED REPORTS ARCHIVE ============

@csrf_exempt
@require_http_methods(['POST'])
def create_approved_report(request):
    """Create an approved report archive entry."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)
    
    ticket_id = payload.get('ticket_id')
    if not ticket_id:
        return JsonResponse({'error': 'Ticket ID is required.'}, status=400)
    
    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return JsonResponse({'error': 'Ticket not found.'}, status=404)
    
    if ticket.approval_status != 'Approved':
        return JsonResponse({'error': 'Ticket must be approved before creating report.'}, status=400)
    
    # Generate report ID
    report_id = f"RPT-{datetime.now().strftime('%Y%m%d')}-{ticket.key}"
    
    # Create Excel file in memory
    from openpyxl import Workbook
    from openpyxl.styles import Font
    from io import BytesIO
    
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = 'Execution Report'
    
    headers = [
        'Ticket Key', 'Ticket Title', 'Source file', 'Execution Description', 'Testcase ID', 'Testcase name', 'Parameters', 'Status',
        'Description', 'Test step description', 'Test step status',
        'Expected result', 'Actual result', 'Tester conclusion', 'Analysis status',
    ]
    sheet.append(headers)
    for cell in sheet[1]:
        cell.font = Font(bold=True)
    
    testcases = TestCase.objects.select_related('execution', 'execution__ticket').filter(execution__ticket=ticket).order_by('execution_id', 'id')
    for testcase in testcases:
        sheet.append([
            testcase.execution.ticket.key if testcase.execution.ticket else '',
            testcase.execution.ticket.title if testcase.execution.ticket else '',
            testcase.execution.file_name,
            testcase.execution.description,
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
    
    # Save to BytesIO
    output = BytesIO()
    workbook.save(output)
    output.seek(0)
    
    # Save file to model
    from django.core.files.base import ContentFile
    
    # Calculate status summary
    from django.db.models import Count
    status_counts = TestCase.objects.filter(execution__ticket=ticket).values('status').annotate(count=Count('status'))
    status_summary = {item['status']: item['count'] for item in status_counts}
    
    executions = ticket.executions.all()
    
    report = ApprovedReport.objects.create(
        ticket=ticket,
        report_id=report_id,
        title=f"Report for {ticket.key} - {ticket.title}",
        excel_file=ContentFile(output.getvalue(), name=f'{report_id}.xlsx'),
        total_executions=executions.count(),
        total_testcases=testcases.count(),
        status_summary=status_summary,
        approved_by=request.user,
    )
    
    return JsonResponse({
        'success': True,
        'report': {
            'id': report.id,
            'reportId': report.report_id,
            'title': report.title,
            'totalExecutions': report.total_executions,
            'totalTestcases': report.total_testcases,
            'statusSummary': report.status_summary,
            'approvedBy': report.approved_by.get_full_name() if report.approved_by else None,
            'approvedAt': report.approved_at.isoformat(),
        }
    })


@require_GET
def list_approved_reports(_request):
    """List all approved reports."""
    reports = ApprovedReport.objects.select_related('ticket', 'approved_by').order_by('-approved_at')
    data = [
        {
            'id': r.id,
            'reportId': r.report_id,
            'title': r.title,
            'ticket': {
                'id': r.ticket.id,
                'key': r.ticket.key,
                'title': r.ticket.title,
            },
            'totalExecutions': r.total_executions,
            'totalTestcases': r.total_testcases,
            'statusSummary': r.status_summary,
            'approvedBy': r.approved_by.get_full_name() if r.approved_by else None,
            'approvedAt': r.approved_at.isoformat(),
            'fileUrl': r.excel_file.url if r.excel_file else None,
        }
        for r in reports
    ]
    return JsonResponse({'reports': data})


@require_GET
def download_approved_report(request, report_id):
    """Download an approved report's Excel file."""
    try:
        report = ApprovedReport.objects.get(report_id=report_id)
    except ApprovedReport.DoesNotExist:
        return JsonResponse({'error': 'Report not found.'}, status=404)
    
    if not report.excel_file:
        return JsonResponse({'error': 'File not available.'}, status=404)
    
    response = HttpResponse(
        report.excel_file.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{report.report_id}.xlsx"'
    return response


@require_GET
def export_excel(_request):
    """Export every stored test case to an .xlsx file."""
    from openpyxl import Workbook
    from openpyxl.styles import Font

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = 'Execution Report'

    headers = [
        'Ticket Key', 'Ticket Title', 'Source file', 'Execution Description', 'Testcase ID', 'Testcase name', 'Parameters', 'Status',
        'Description', 'Test step description', 'Test step status',
        'Expected result', 'Actual result', 'Tester conclusion', 'Analysis status',
    ]
    sheet.append(headers)
    for cell in sheet[1]:
        cell.font = Font(bold=True)

    testcases = TestCase.objects.select_related('execution', 'execution__ticket').order_by('execution_id', 'id')
    for testcase in testcases:
        sheet.append([
            testcase.execution.ticket.key if testcase.execution.ticket else '',
            testcase.execution.ticket.title if testcase.execution.ticket else '',
            testcase.execution.file_name,
            testcase.execution.description,
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