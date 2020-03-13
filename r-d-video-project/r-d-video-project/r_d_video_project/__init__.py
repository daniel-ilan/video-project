"""
The flask application package.
"""

from flask import Flask
app = Flask(__name__)

from r_d_video_project import views
