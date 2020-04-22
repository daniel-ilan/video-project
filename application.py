"""
Routes and views for the flask application.
"""

import os
import time
from datetime import datetime
import db
from flask import Flask
from flask import render_template, request
from matplotlib import colors
from tgs import exporters, objects
from tgs.parsers.tgs import parse_tgs

application = Flask(__name__)

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
    """
    todo: add any new property we are changing: last added image_layer: image
    :param anim: tgs Animation object
    :return: dictionary with all values used in HTML controls
    """
    text_color = anim.find('.myText').data.data.keyframes[0].start.color
    text_content = anim.find('.myText').data.data.keyframes[0].start.text
    text_alignment = an.find('.myText').data.data.keyframes[0].start.justify.value

    color = anim.find('.primaryColor').find('Fill 1').color.value.components
    prim_opacity = anim.find('.primaryColor').find('Fill 1').opacity.value

    out_color = anim.find('.baseColor').find('Fill 1').color.value.components
    sec_opacity = anim.find('.baseColor').find('Fill 1').opacity.value

    anim_props = {'text':
                      {'color': list(text_color[0:3] + [1]),
                       'content': correct_text(text_content),
                       'alignment': text_alignment},
                  'shapes': {
                      'primary': {'color': color,
                                  'opacity': prim_opacity},
                      'secondary': {'color': out_color,
                                    'opacity': sec_opacity}}}
    return anim_props


changing_path = "static/content/animations/temp1_anim2.json"

an = readable(changing_path)
anim_properties = get_anim_props(an)
lottiePlayersArray = db.get_all_animations()
lottiePlayersArrayPath = "../static/content/"

colorsArray = []


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


@application.route('/about', methods=['POST', 'GET'])
def about():
    global person_name
    global email
    global password
    if request.method == 'POST':
        # new user
        person_name = request.form['person_name']
        email = request.form['email']
        password = request.form['password']
        image = None  # request.form['image']
        db.create_new_user(person_name, email, password, image)
        # get user info
        # dataFromDB = get_user(str(request.form['existUserEmail']), str(request.form['existUserPass']))
        # print(dataFromDB)
        # person_name = dataFromDB[1]
        # person_last_name = dataFromDB[2]
        # email = dataFromDB[3]
        # password = dataFromDB[4]
    else:
        person_name = ""
        email = ""
        password = ""
    """Renders the about page."""
    return render_template(
        'about.html',
        title='About',
        year=datetime.now().year,
        message='Your application description page.',
        person_name=person_name,
        email=email,
        password=password
    )


@application.route('/newProject', methods=['POST', 'GET'])
def newProject():
    if request.method == 'POST':
        if request.form['submit_button'] == 'submit_id':
            # get user info
            userID = request.form['userID']
            db.update_project_last_update("2")
            data = db.get_project_info(userID)
            print(data)
        elif request.form['submit_button'] == 'submit_newVid':
            project_id = request.form['project_id']
            video_name = request.form['video_name']
            db.create_new_video(project_id,video_name)

        else:
            # new user
            userID = int(request.form['project_owner'])
            project_name = request.form['project_name']
            project_image = None  # request.form['project_image']
            db.create_new_project(userID, project_name, project_image)

    """Renders the contact page."""
    return render_template(
        'newProject.html',
        title='newProject',
        year=datetime.now().year,
        message='Your contact page.',
        username="xxxx"
    )


@application.route("/")
@application.route('/homePage', methods=['POST', 'GET'])
def homePage():
    global alertM
    global color1
    global color2
    global color3
    global color4
    global paletteName
    paletteName = ""
    alertM = ""
    colors_data = ["#000000"]

    if request.method == 'POST':
        if request.form['submit_button'] == 'submit_new_Color':
            color = request.form['add_color']
            kind = request.form['kind']
            db.create_color(color, kind)
        elif request.form['submit_button'] == 'submit_search_palette_id':
            search_palette_id = request.form['search_palette_id']
            data = db.get_palette(search_palette_id)
            paletteName = data[1]
            colors_data = db.get_colors_by_palette(search_palette_id)
        else:
            if request.form['existUserEmail'] != '' and request.form['existUserPass'] != '':
                dataFromDB = db.check_log_in(str(request.form['existUserEmail']), str(request.form['existUserPass']))
                print(dataFromDB)
                if dataFromDB[0] is True and dataFromDB[1] is False:
                    alertM = "סיסמא שגויה"
                elif dataFromDB[0] is True and dataFromDB[1] is True:
                    alertM = "התחברות הצליחה"
                else:
                    alertM = "שם משתמש או סימא שגויים"
    else:
        alertM = ""
    """Renders the contact page."""
    return render_template(
        'homePage.html',
        title='homePage',
        year=datetime.now().year,
        message='Your contact page.',
        alertMessage=alertM,
        my_colors=colors_data,
        palette_name=paletteName

    )


@application.route('/editContent', methods=['POST', 'GET'])
def editContent():
    global anim_properties
    if request.method == 'POST':
        result = request.form['animText']
        color = request.form['textColor']
        alignment = request.form['selectedAlignment']
        change_text(result, color, alignment)

    text_color = colors.to_hex(anim_properties['text']['color'])
    text_content = anim_properties['text']['content']
    alignment = anim_properties['text']['alignment']
    return render_template(
        'editContent.html',
        title='תוכן',
        year=datetime.now().year,
        message='',
        anim_path=changing_path,
        textColor=text_color,
        textContent=text_content,
        alignment=alignment
    )


def change_text(text, color, alignment=1):
    global an
    global changing_path
    global anim_properties

    anim_text = correct_text(text)

    correct_color = list(colors.to_rgba(color, float) + (1,))
    an.find('.myText').data.data.keyframes[0].start.color = correct_color[0:3]
    an.find('.myText').data.data.keyframes[0].start.text = anim_text
    an.find('.myText').data.data.keyframes[0].start.justify = objects.text.TextJustify(int(alignment))

    new_name = "temp" + str(int(time.time())) + ".json"
    exporters.export_lottie(an, "static/content/" + new_name)
    new_json = "static/content/" + new_name
    if changing_path[-6:-9:-1].isdigit():
        os.remove(changing_path)
    changing_path = new_json

    anim_properties['text']['color'] = correct_color[0:3]
    anim_properties['text']['content'] = text
    anim_properties['text']['alignment'] = alignment

    an = readable(changing_path)
    # an.find('.myText').transform.position.value = Point(30, 200)
    # an.find('.myText').data.data.keyframes[0].start = objects.text.TextDocument(text, 48, Color(correct_color[0], correct_color[1], correct_color[2]), font)
    # an.fonts.append(objects.text.Font(font, name=f"{font}"))
    # an.find('.myText').data.data.keyframes[0].start.justify.value = 0
    # an.find('.myText').data.data.keyframes[0].start.justify = objects.text.TextJustify(2)


@application.route('/editColor', methods=['POST', 'GET'])
def editColor():
    global anim_properties
    """Renders the about page."""
    if request.method == 'POST':
        background = request.form['animColor']
        outline = request.form['outlineColor']
        prim_opacity = request.form['opacityRange']
        change_color(background, outline, prim_opacity)
    main_color = colors.to_hex(anim_properties['shapes']['primary']['color'])
    outline_color = colors.to_hex(anim_properties['shapes']['secondary']['color'])
    prim_opacity = anim_properties['shapes']['primary']['opacity']

    return render_template(
        'editColor.html',
        title='צבע',
        year=datetime.now().year,
        message='',
        anim_path=changing_path,
        mainColor=main_color,
        outlineColor=outline_color,
        opacity=prim_opacity
    )


def change_color(color, outline_color, opacity):
    global an
    global changing_path
    global anim_properties
    correct_color = colors.to_rgba(color, float)
    correct_outline_color = colors.to_rgba(outline_color, float)
    an.find('.primaryColor').find('Fill 1').color.value.components = list(correct_color[0:3] + (1,))
    an.find('.baseColor').find('Fill 1').color.value.components = list(correct_outline_color[0:3] + (1,))
    an.find('.primaryColor').find('Fill 1').opacity.value = float(opacity)

    # an.layers[-1].matte_mode = objects.MatteMode.Luma

    new_name = "temp" + str(int(time.time())) + ".json"
    exporters.export_lottie(an, "static/content/" + new_name)
    new_json = "static/content/" + new_name

    # script.script_main(an, path="static/content/", formats=['json'])

    if changing_path[-6:-9:-1].isdigit():
        os.remove(changing_path)
    changing_path = new_json
    anim_properties['shapes']['primary']['color'] = list(correct_color[0:3] + (1,))
    anim_properties['shapes']['secondary']['color'] = list(correct_outline_color[0:3] + (1,))


# @application.route("/")
@application.route('/editTemplate', methods=['POST', 'GET'])
def editTemplate():
    colorsArray = db.get_colors_by_palette("1")
    print(colorsArray)
    global changing_path
    """
    gets an ajax request and changes the json file attached to the lottie-player
    todo: this is not secure now and needs to be written correctly
    :return: nothing. It just changes the file associated with the main animation lottie-player
    """
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
        anim_path=changing_path,
        lottiePlayersArray=lottiePlayersArray,
        lottiePlayersArrayPath=lottiePlayersArrayPath,
        colorsArray=colorsArray

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
