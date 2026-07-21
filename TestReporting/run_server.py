import os, sys
os.chdir(r'C:\Users\User\Desktop\Nouveau dossier\project django v1\TestReporting\TestReporting')
os.environ['DJANGO_SETTINGS_MODULE'] = 'TestReporting.settings'
sys.path.insert(0, r'C:\Users\User\Desktop\Nouveau dossier\project django v1\TestReporting\TestReporting')
from django.core.management import execute_from_command_line
execute_from_command_line(['manage.py', 'runserver', '127.0.0.1:8000', '--noreload'])
