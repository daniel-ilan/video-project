"""
Routes and views for the flask application.
"""
from videoProject import app


import os
from datetime import datetime
from os import environ

from flask import render_template, request, make_response
from tgs import Color
from tgs import objects
from tgs.parsers.tgs import parse_tgs
from tgs.utils import script
from tgs import exporters




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


@app.route('/success', methods=['POST', 'GET'])
def print_data():
    os.path.join(os.path.dirname(os.path.abspath(__file__)))
    if request.method == 'POST':
        result = request.form['username'].split(",")
        result = [float(i) for i in result]
        print(result)
        an = parse_tgs("static/content/temp2.json")
        layers = an.layers
        print(layers)
        for layer in layers:
            layer.effects = [objects.effects.FillEffect(color=Color(result[0], result[1], result[2]), opacity=1)]
            print(layer)
        exporters.export_lottie(an, "static/content/temp2.json")
        # script.script_main(an, path="/tmp", formats=["json"])
        return render_template("index.html", result=result)


if __name__ == '__main__':
    HOST = environ.get('SERVER_HOST', 'localhost')
    try:
        PORT = int(environ.get('SERVER_PORT', '5555'))
    except ValueError:
        PORT = 5555
    app.run(HOST, PORT, debug=True)
