"""
The flask application package.
"""

from flask import Flask
app = Flask(__name__)

import r_d_video_project.views
