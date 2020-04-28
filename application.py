"""
Routes and views for the flask application.
"""

import os
import time
from datetime import datetime
from flask import jsonify
import db
from flask import Flask
from flask import render_template, request
from lottie import exporters, objects
from lottie.parsers.tgs import parse_tgs
from matplotlib import colors

import db

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


def get_anim_props(anim, changing_path):
    """
    todo: add any new property we are changing: last added image_layer: image
    :param anim: tgs Animation object
    :return: dictionary with all values used in HTML controls
    """
    anim_props = {'path': changing_path}
    if anim.find('.myText'):
        text_color = anim.find('.myText').data.data.keyframes[0].start.color
        text_content = anim.find('.myText').data.data.keyframes[0].start.text
        text_alignment = an.find('.myText').data.data.keyframes[0].start.justify.value
        text_dict = {'color': colors.to_hex(list(text_color[0:3] + [1])),
                     'content': correct_text(text_content),
                     'alignment': text_alignment}
        anim_props['text'] = text_dict

    if anim.find('.primaryColor'):
        color = colors.to_hex(anim.find('.primaryColor').find('Fill 1').color.value.components)
        prim_opacity = anim.find('.primaryColor').find('Fill 1').opacity.value
        primary_dict = {'primary':{'color': color,'opacity': prim_opacity}}
        anim_props.update(primary_dict)

    if anim.find('.baseColor'):
        out_color = colors.to_hex(anim.find('.baseColor').find('Fill 1').color.value.components)
        sec_opacity = anim.find('.baseColor').find('Fill 1').opacity.value
        secondary_dict = {'secondary':{'color': out_color,'opacity': sec_opacity}}
        anim_props.update(secondary_dict)

    if anim.find('.image'):
        image_dict = {'image': an.assets[0].image}
        anim_props['image'] = image_dict


    return anim_props


changing_path = "static/content/animations/temp1_anim2.json"

an = readable(changing_path)
anim_properties = get_anim_props(an, changing_path)
# lottiePlayersArray = [["temp1_anim1.json", "שקיפות"], ["temp1_anim2.json", "בהדרגה מימין"],
#                       ["temp1_anim3.json", "מצד ימין"], ["temp1_anim4.json", "שלום"], ["temp2_anim1.json", "שקיפות"],
#                       ["temp2_anim2.json", "בהדרגה מימין"], ["temp2_anim3.json", "מצד ימין"],
#                       ["temp2_anim4.json", "שלום"]]

lottiePlayersArray = db.get_all_animations()
# get_all_animations()
lottiePlayersArrayPath = "../static/content/"

colorsArray = []
# myLoAr = ["../static/content/temp1_anim1.json", "../static/content/temp1_anim1.json"]


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
    global person_last_name
    global email
    global password
    if request.method == 'POST':
        # new user
        person_name = request.form['person_name']
        person_last_name = request.form['person_last_name']
        email = request.form['email']
        password = request.form['password']
        image = None  # request.form['image']
        db.create_new_user(person_name, person_last_name, email, password, image)
        # get user info
        # dataFromDB = get_user(str(request.form['existUserEmail']), str(request.form['existUserPass']))
        # print(dataFromDB)
        # person_name = dataFromDB[1]
        # person_last_name = dataFromDB[2]
        # email = dataFromDB[3]
        # password = dataFromDB[4]
    else:
        person_name = ""
        person_last_name = ""
        email = ""
        password = ""
    """Renders the about page."""
    return render_template(
        'about.html',
        title='About',
        year=datetime.now().year,
        message='Your application description page.',
        person_name=person_name,
        person_last_name=person_last_name,
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
    global palteName
    palteName = ""
    colors_data = ["#000000"]
    # color1 = color2 = color3 = color4 = "#000000"

    if request.method == 'POST':
        if request.form['submit_button'] == 'submit_new_Color':
            color = request.form['add_color']
            kind = request.form['kind']
            db.create_color(color, kind)
        elif request.form['submit_button'] == 'submit_search_palte_id':
            search_palte_id = request.form['search_palte_id']
            data = db.get_palte(search_palte_id)
            palteName = data[2]
            colors_data = db.get_colors_by_plate(search_palte_id)
            # color1 = colors_data[0][0]
            # color2 = colors_data[1][0]
            # color3 = colors_data[2][0]
            # color4 = colors_data[3][0]

            print(colors_data)
        else:
            if request.form['existUserEmail'] != '' and request.form['existUserPass'] != '':
                dataFromDB = db.get_user(str(request.form['existUserEmail']), str(request.form['existUserPass']))
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
        # color1=color1,
        # color2=color2,
        # color3=color3,
        # color4=color4,
        my_colors=colors_data,
        palte_name=palteName

    )



@application.route('/editContent')
def editContent():
    global anim_properties
    # loadAnimProps()
    # if request.method == 'POST':
    #     result = request.form['animText']
    #     color = request.form['textColor']
    #     alignment = request.form['selectedAlignment']
    #     change_text(result, color, alignment)
    #
    #
    # text_color = colors.to_hex(anim_properties['text']['color'])
    # text_content = anim_properties['text']['content']
    # alignment = anim_properties['text']['alignment']
    return render_template(
        'editContent.html',
        title='תוכן',
        var=anim_properties
    )

@application.route('/changeAnimText', methods=['POST'])
def change_anim_text():
    text = request.form['animText']
    color = request.form['textColor']
    alignment = request.form['selectedAlignment']
    new_text = change_text(text, color, alignment)
    return jsonify(result=new_text)


def change_text(text, color, alignment=1):
    global an
    global changing_path


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
    an = readable(changing_path)
    return get_anim_props(an, changing_path)


    # anim_properties['text']['color'] = correct_color[0:3]
    # anim_properties['text']['content'] = text
    # anim_properties['text']['alignment'] = alignment
    # an.find('.myText').transform.position.value = Point(30, 200)
    # an.find('.myText').data.data.keyframes[0].start = objects.text.TextDocument(text, 48, Color(correct_color[0], correct_color[1], correct_color[2]), font)
    # an.fonts.append(objects.text.Font(font, name=f"{font}"))
    # an.find('.myText').data.data.keyframes[0].start.justify.value = 0
    # an.find('.myText').data.data.keyframes[0].start.justify = objects.text.TextJustify(2)


@application.route('/editColor', methods=['POST', 'GET'])
def editColor():
    """
    Renders the color editing page page
    :return:
    """
    global anim_properties

    # if request.method == 'POST':
    #     background = request.form['animColor']
    #     outline = request.form['outlineColor']
    #     prim_opacity = request.form['opacityRange']
    #     change_color(background, outline, prim_opacity)
    # main_color = colors.to_hex(anim_properties['primary']['color'])
    # outline_color = colors.to_hex(anim_properties['secondary']['color'])
    # prim_opacity = anim_properties['primary']['opacity']

    return render_template(
        'editColor.html',
        title='צבע',
        var=anim_properties,
        # mainColor=main_color,
        # outlineColor=outline_color,
        # opacity=prim_opacity
    )

@application.route('/changeAnimColor', methods=['POST'])
def change_anim_color():
    prime_color = request.form['animColor']
    sec_color = request.form['outlineColor']
    prim_opacity = request.form['opacityRange']
    new_color = change_color(prime_color, sec_color, prim_opacity)
    return jsonify(result=new_color)


def change_color(color, outline_color, opacity):
    global an
    global changing_path


    correct_color = colors.to_rgba(color, float)
    correct_outline_color = colors.to_rgba(outline_color, float)
    an.find('.primaryColor').find('Fill 1').color.value.components = list(correct_color[0:3] + (1,))
    an.find('.baseColor').find('Fill 1').color.value.components = list(correct_outline_color[0:3] + (1,))
    an.find('.primaryColor').find('Fill 1').opacity.value = float(opacity)

    new_name = "temp" + str(int(time.time())) + ".json"
    exporters.export_lottie(an, "static/content/" + new_name)
    new_json = "static/content/" + new_name

    if changing_path[-6:-9:-1].isdigit():
        os.remove(changing_path)
    changing_path = new_json
    an = readable(changing_path)
    return get_anim_props(an, changing_path)

    # an.layers[-1].matte_mode = objects.MatteMode.Luma
    # script.script_main(an, path="static/content/", formats=['json'])


@application.route('/editTemplate', methods=['POST', 'GET'])
def editTemplate():
    colorsArray = db.get_colors_by_plate("1")
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
    anim_properties = get_anim_props(an, changing_path)
    pass


if __name__ == '__main__':
    application.run()
