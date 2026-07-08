import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .parsers import parse_report_payload


@require_GET
def health(_request):
    return JsonResponse({'status': 'ok', 'service': 'reports'})


@csrf_exempt
@require_POST
def parse_json_reports(request):
    files = request.FILES.getlist('files')

    if not files:
        return JsonResponse({'error': 'Upload one or more JSON files using the "files" form field.'}, status=400)

    rows = []
    loaded_files = []

    try:
        for uploaded_file in files:
            payload = json.loads(uploaded_file.read().decode('utf-8'))
            rows.extend(parse_report_payload(payload, uploaded_file.name))
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
