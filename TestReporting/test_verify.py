import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TestReporting.settings')
import django
django.setup()
from django.test import Client
client = Client()

# Test API endpoints
r = client.post('/api/reports/login/', {'username': 'testuser', 'password': 'testpass123'}, content_type='application/json')
print('Login:', r.status_code, r.content.decode()[:80])

client.cookies = r.cookies

r = client.get('/api/reports/current-user/')
print('Current user:', r.status_code, r.content.decode()[:80])

r = client.get('/api/reports/executions/')
print('Executions:', r.status_code)

r = client.get('/api/reports/tickets/flat/')
print('Tickets:', r.status_code)

r = client.get('/api/reports/approved-reports/')
print('Approved reports:', r.status_code, r.content.decode()[:100])

r = client.get('/api/reports/approvals/')
print('Approvals:', r.status_code, r.content.decode()[:100])

# Root page
r = client.get('/')
content = b''.join(r.streaming_content) if hasattr(r, 'streaming_content') else r.content
html = content.decode('utf-8', errors='replace')
print('Root:', r.status_code, 'Has React:', 'Test Reporting' in content.decode('utf-8', errors='replace'))
print('Has div#root:', 'id=\"root\"' in r.content.decode('utf-8', errors='replace'))
print('Has script:', 'src=\"/static/assets/' in content.decode('utf-8', errors='replace'))
print('Has link:', 'href=\"/static/assets/' in html)