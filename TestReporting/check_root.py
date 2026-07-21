import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "TestReporting.settings")
import django
django.setup()
from django.test import Client
client = Client()
r = client.get("/")
print("Root path:", r.status_code)
print("Content type:", r.get("Content-Type", ""))
content = b"".join(r.streaming_content) if hasattr(r, "streaming_content") else r.content
print("Length:", len(content))
html = content.decode("utf-8", errors="replace")
print("Has div#root:", "id=\"root\"" in html)
print("Has script src:", 'src="/assets/' in html)
print("Has link rel:", 'href="/assets/' in html)