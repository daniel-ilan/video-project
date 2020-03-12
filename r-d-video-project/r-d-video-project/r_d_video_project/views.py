"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import render_template, request
from r_d_video_project import app

@app.route('/')
@app.route('/home')
def home():
    """Renders the home page."""
    return render_template(
        'index.html',
        title='Home Page',
        year=datetime.now().year,
    )

@app.route('/contact')
def contact():
    """Renders the contact page."""
    return render_template(
        'contact.html',
        title='Contact',
        year=datetime.now().year,
        message='Your contact page.'
    )

@app.route('/about')
def about():
    """Renders the about page."""
    return render_template(
        'about.html',
        title='About',
        year=datetime.now().year,
        message='Your application description page.'
    )

@app.route('/editContent')
def editContent():
    """Renders the about page."""
    return render_template(
        'editContent.html',
        title='תוכן',
        year=datetime.now().year,
        message=''
    )

@app.route('/editColor')
def editColor():
    """Renders the about page."""
    return render_template(
        'editColor.html',
        title='צבע',
        year=datetime.now().year,
        message=''
    )

@app.route('/editTemplate')
def editTemplate():
    """Renders the about page."""
    return render_template(
        'editTemplate.html',
        title='תבנית',
        year=datetime.now().year,
        message=''
    )

@app.route('/success',methods = ['POST', 'GET'])
def print_data():
   if request.method == 'POST':
      result = request.form
      return render_template("index.html",result = result)
