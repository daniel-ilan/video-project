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
from matplotlib import colors


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


@app.route('/editContent',  methods=['POST', 'GET'])
def editContent():
    """Renders the about page."""

    if request.method == 'POST':
        result = request.form['animText']
        change_text(result)
    return render_template(
        'editContent.html',
        title='תוכן',
        year=datetime.now().year,
        message='',
        file=file
    )

def change_text(text):
    global file
    an = parse_tgs(file)
    layers = an.layers
    file_to_check = "static/content/temp1.json"
    an_to_check = parse_tgs(file_to_check)
    print(an_to_check)
    for layer in layers:
        if layer.type == 5:
            if len(layer.data.data.keyframes[0].start.text) < 24:
                layer.data.data.keyframes[0].start.text = text

    new_name = "temp" + str(int(time.time())) + ".json"
    exporters.export_lottie(an, "static/content/" + new_name)
    new_json = "static/content/" + new_name
    if file[-6:-9:-1].isdigit():
        os.remove(file)
    file = new_json




@app.route('/editColor', methods=['POST', 'GET'])
def editColor():
    """Renders the about page."""
    if request.method == 'POST':
        result = request.form['animColor']
        correct_color = colors.to_rgba(result,float)
        # print(result)

        change_color(correct_color)
    return render_template(
        'editColor.html',
        title='צבע',
        year=datetime.now().year,
        message='',
        file=file
    )


def change_color(color):
    global file
    # os.path.join(os.path.dirname(os.path.abspath(__file__)))
    an = parse_tgs(file)
    layers = an.layers
    for layer in layers:
        if layer.type != 5:
            layer.effects = [objects.effects.FillEffect(color=Color(color[0], color[1], color[2]), opacity=1)]
    new_name = "temp" + str(int(time.time())) + ".json"
    exporters.export_lottie(an, "static/content/" + new_name)
    new_json = "static/content/" + new_name
    if file[-6:-9:-1].isdigit():
        os.remove(file)
    file = new_json


@app.route("/")
@app.route('/editTemplate', methods=['POST', 'GET'])
def editTemplate():
    """
    gets an ajax request and changes the json file attached to the lottie-player
    todo: this is not secure now and needs to be written correctly
    :return: nothing. It just changes the file associated with the main animation lottie-player
    """
    print("I am here")
    """Renders the about page."""
    if request.method == 'POST':
        a = request.data
        change_animation(a.decode("utf-8"))
        print(a)
        pass
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
    file = path[3:]
    pass
    # return render_template("editTemplate.html", file=file)


if __name__ == '__main__':
    HOST = environ.get('SERVER_HOST', 'localhost')
    try:
        PORT = int(environ.get('SERVER_PORT', '5555'))
    except ValueError:
        PORT = 5555
    app.run(HOST, PORT, debug=True)
