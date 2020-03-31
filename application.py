"""
Routes and views for the flask application.
"""

from flask import Flask
import os
from datetime import datetime
import time
from flask import render_template, request
from tgs import Color
from tgs import objects
from tgs.parsers.tgs import parse_tgs
from tgs import exporters
from matplotlib import colors

application = Flask(__name__)


def readable(path):
    """
    :param path: type str <path to main animation json>
    :return: tgs object to work with
    """
    temp_an = open(path, "r", encoding='utf-8')
    file = parse_tgs(temp_an)
    temp_an.close()
    return file


def get_anim_props(anim):
    text_color = anim.find('.myText').data.data.keyframes[0].start.color
    text_content = anim.find('.myText').data.data.keyframes[0].start.text
    color = anim.find('.primaryColor').find('Group 1').find('Fill 1').color.value.components
    out_color = anim.find('.baseColor').find('Group 1').find('Fill 1').color.value.components
    anim_props = {'text':{'color':list(text_color[0:3] + [1]),
                          'content': text_content},
                  'shapes':{'background':color,
                            'outline':out_color}}
    return anim_props

changing_path = "static/content/temp1_anim1.json"
an = readable(changing_path)
anim_properties = get_anim_props(an)


@application.route('/home')
def home():
    """Renders the home page."""
    return render_template(
        'index.html',
        title='אודות',
        year=datetime.now().year,
        anim_path=changing_path
    )


@application.route('/contact')
def contact():
    """Renders the contact page."""
    return render_template(
        'contact.html',
        title='Contact',
        year=datetime.now().year,
        message='Your contact page.'
    )


@application.route('/about')
def about():
    """Renders the about page."""
    return render_template(
        'about.html',
        title='About',
        year=datetime.now().year,
        message='Your application description page.'
    )


@application.route('/editContent', methods=['POST', 'GET'])
def editContent():
    global anim_properties
    if request.method == 'POST':
        result = request.form['animText']
        color = request.form['textColor']
        change_text(result, color)
    text_color = colors.to_hex(anim_properties['text']['color'])
    text_content = anim_properties['text']['content']
    return render_template(
        'editContent.html',
        title='תוכן',
        year=datetime.now().year,
        message='',
        anim_path=changing_path,
        textColor=text_color,
        textContent=text_content,
    )


def change_text(text, color):
    global an
    global changing_path
    global anim_properties
    if len(text) >= 1:
        text = correct_text(text)
        an.find('text').data.data.keyframes[0].start.text = text
        anim_properties['text']['content'] = text

    correct_color = colors.to_rgba(color, float)
    an.find('text').data.data.keyframes[0].start.color[0:3] = list(correct_color[0:3] + (1,))


    new_name = "temp" + str(int(time.time())) + ".json"
    exporters.export_lottie(an, "static/content/" + new_name)
    new_json = "static/content/" + new_name
    if changing_path[-6:-9:-1].isdigit():
        os.remove(changing_path)

    changing_path = new_json
    anim_properties['text']['color'] = list(correct_color[0:3] + (1,))
    an = readable(changing_path)


def correct_text(sentence):
    """
    Formatting Hebrew and English text so it displays right
    on the animation
    todo: no support for combined english and Hebrew && no support for multiple english words
    :param sentence: type str
    :return: str
    """

    if " " in sentence:
        sentence = sentence.split(" ")
        for word in sentence:
            if ord(word[0]) >= 1424 and ord(word[0]) <= 1514:
                index = sentence.index(word)
                sentence[index] = word[::-1]
            else:
                pass
        sentence.reverse()
        return ' '.join(sentence)
    else:
        if ord(sentence[1]) >= 1424 and ord(sentence[1]) <= 1514:
            return sentence[::-1]
        else:
            return sentence


@application.route('/editColor', methods=['POST', 'GET'])
def editColor():
    global anim_properties
    """Renders the about page."""
    if request.method == 'POST':
        background = request.form['animColor']
        outline = request.form['outlineColor']
        change_color(background, outline)
    main_color = colors.to_hex(anim_properties['shapes']['background'])
    outline_color = colors.to_hex(anim_properties['shapes']['outline'])

    return render_template(
        'editColor.html',
        title='צבע',
        year=datetime.now().year,
        message='',
        anim_path=changing_path,
        mainColor=main_color,
        outlineColor=outline_color

    )


def change_color(color, outline_color):
    global an
    global changing_path
    global anim_properties
    correct_color = colors.to_rgba(color, float)
    correct_outline_color = colors.to_rgba(outline_color, float)
    an.find('.primaryColor').find('Fill 1').color.value.components = list(correct_color[0:3] + (1,))
    an.find('.baseColor').find('Fill 1').color.value.components = list(correct_outline_color[0:3] + (1,))
    new_name = "temp" + str(int(time.time())) + ".json"
    exporters.export_lottie(an, "static/content/" + new_name)
    new_json = "static/content/" + new_name

    if changing_path[-6:-9:-1].isdigit():
        os.remove(changing_path)
    changing_path = new_json
    anim_properties['shapes']['background'] = list(correct_color[0:3] + (1,))
    anim_properties['shapes']['outline'] = list(correct_outline_color[0:3] + (1,))


@application.route("/")
@application.route('/editTemplate', methods=['POST', 'GET'])
def editTemplate():
    global changing_path
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
        pass
    return render_template(
        'editTemplate.html',
        title='תבנית',
        year=datetime.now().year,
        message='',
        anim_path=changing_path
    )


def change_animation(path):
    global an
    global changing_path
    global anim_properties
    changing_path = path[3:]
    an = readable(changing_path)
    anim_properties = get_anim_props(an)
    pass



if __name__ == '__main__':
    application.run()
