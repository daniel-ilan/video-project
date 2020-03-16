"""
Routes and views for the flask application.
"""
from videoProject import app


import os
from datetime import datetime
from os import environ
import time
from flask import render_template, request, make_response, redirect, url_for, send_file
from tgs import Color
from tgs import objects
from tgs.parsers.tgs import parse_tgs
from tgs import exporters


file = "static/content/temp2.json"



@app.route('/home')
def home():
    """Renders the home page."""
    return render_template(
        'index.html',
        title='Home Page',
        year=datetime.now().year,
        file=file
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
        message='',
        file=file
    )


@app.route('/editColor')
def editColor():
    """Renders the about page."""
    return render_template(
        'editColor.html',
        title='צבע',
        year=datetime.now().year,
        message='',
        file=file
    )


@app.route("/")
@app.route('/editTemplate', methods=['POST', 'GET'])
def editTemplate():
    """
    gets an ajax request and changes the json file attached to the lottie-player
    todo: this is not secure now and needs to be written correctly
    :return:
    """
    print("I am here")
    """Renders the about page."""
    if request.method == 'POST':
        a = request.data
        change_animation(a.decode("utf-8"))
        print(a)
    return render_template(
        'editTemplate.html',
        title='תבנית',
        year=datetime.now().year,
        message='',
        file=file
    )


@app.route('/success', methods=['POST', 'GET'])
def print_data():
    """
    this will be used to change the colors for now it's here
    :return:
    """
    os.path.join(os.path.dirname(os.path.abspath(__file__)))
    if request.method == 'POST':
        global file
        result = request.form['username'].split(",")
        result = [float(i) for i in result]
        an = parse_tgs("static/content/temp2.json")
        layers = an.layers
        for layer in layers:
            layer.effects = [objects.effects.FillEffect(color=Color(result[0], result[1], result[2]), opacity=1)]

        new_name = "temp"+str(int(time.time()))+".json"
        exporters.export_lottie(an, "static/content/"+new_name)
        new_json = "static/content/"+new_name
        if file[-6:-9:-1].isdigit():
            os.remove(file)
        file = new_json
        return render_template("index.html", file=file)


def change_animation(path):
    global file
    file = path
    return render_template("editTemplate.html", file=file)


if __name__ == '__main__':
    HOST = environ.get('SERVER_HOST', 'localhost')
    try:
        PORT = int(environ.get('SERVER_PORT', '5555'))
    except ValueError:
        PORT = 5555
    app.run(HOST, PORT, debug=True)
