#!C:\video-project\venv\Scripts\python.exe
# EASY-INSTALL-ENTRY-SCRIPT: 'wfastcgi==3.0.0','console_scripts','wfastcgi-disable'
__requires__ = 'wfastcgi==3.0.0'
import re
import sys
from pkg_resources import load_entry_point

if __name__ == '__main__':
    sys.argv[0] = re.sub(r'(-script\.pyw?|\.exe)?$', '', sys.argv[0])
    sys.exit(
        load_entry_point('wfastcgi==3.0.0', 'console_scripts', 'wfastcgi-disable')()
    )
