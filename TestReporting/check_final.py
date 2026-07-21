import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TestReporting.settings')
import django
django.setup()
from django.test import Client
client = Client()
r = client.get('/')
content = b''.join(r.streaming_content) if hasattr(r, 'streaming_content') else r.content
html = content.decode('utf-8', errors='replace')
print('Status:', r.status_code)
print('Has div#root:', 'id="root"' in html)
print('Has script src:', 'src="/static/assets/' in html)
print('Has link href:', 'href="/static/assets/' in html)