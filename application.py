"""
Routes and views for the flask application.
"""

import os
import time
from datetime import datetime

from flask import render_template, request, jsonify, Flask, redirect
from lottie import exporters, objects
from lottie.parsers.tgs import parse_tgs
from matplotlib import colors
from werkzeug.utils import secure_filename

import db, json

application = Flask(__name__)
UPLOAD_FOLDER = "static/content/animations/images"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
application.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


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


def get_anim_props(anim, changing_path, image_path=""):
    """
    todo: add any new property we are changing: last added image_layer: image
    :param anim: tgs Animation object
    :return: dictionary with all values used in HTML controls

    """
    anim_props = {'path': changing_path}
    for layer in anim.layers:
        list_changed = False
        if layer.name == '.myText':
            text_color = layer.data.data.keyframes[0].start.color
            text_content = layer.data.data.keyframes[0].start.text
            text_alignment = layer.data.data.keyframes[0].start.justify.value
            text_dict = {'color': colors.to_hex(list(text_color[0:3])),
                         'content': correct_text(text_content),
                         'alignment': text_alignment}
            anim_props['text'] = text_dict

        elif layer.name == '.primaryColor':
            color = colors.to_hex(layer.find('Fill 1').color.value.components)
            prim_opacity = layer.find('Fill 1').opacity.value
            primary_dict = {'primary': {'color': color, 'opacity': prim_opacity}}
            anim_props.update(primary_dict)

        elif layer.name == '.baseColor':
            out_color = colors.to_hex(layer.find('Fill 1').color.value.components)
            sec_opacity = layer.find('Fill 1').opacity.value
            secondary_dict = {'secondary': {'color': out_color, 'opacity': sec_opacity}}
            anim_props.update(secondary_dict)

        elif layer.name == '.image':
            image_name = image_path
            image_dict = {'image': an.assets[0].image, 'image_path': f"static/content/animations/images/{image_name}"}
            anim_props['image'] = image_dict

        elif layer.name.find(".listText") != -1 and list_changed is False:
            text_layer_num = int(layer.name[-1])
            if text_layer_num == 1:
                text_color = layer.data.data.keyframes[0].start.color
                text_content = layer.data.data.keyframes[0].start.text
                text_alignment = layer.data.data.keyframes[0].start.justify.value

                text_dict = {'listItem': {'text': {'color': colors.to_hex(list(text_color[0:3])),
                                               'content': [correct_text(text_content)],
                                               'alignment': text_alignment}}}

                anim_props.update(text_dict)

            else:
                text_content = layer.data.data.keyframes[0].start.text
                anim_props['listItem']['text']['content'].append(text_content)

        elif layer.name.find(".primaryColorList") != -1:
            primary_layer_num = int(layer.name[-1])
            if primary_layer_num == 1:
                color = colors.to_hex(layer.find('Fill 1').color.value.components)
                prim_opacity = layer.find('Fill 1').opacity.value
                color_dict = {'primary': {'color': color, 'opacity': prim_opacity}}
                anim_props['listItem'].update(color_dict)

        elif layer.name.find(".baseColorList") != -1:
            secondary_layer_num = int(layer.name[-1])
            if secondary_layer_num == 1:
                color = colors.to_hex(layer.find('Fill 1').color.value.components)
                prim_opacity = layer.find('Fill 1').opacity.value
                color_dict = {'secondary': {'color': color, 'opacity': prim_opacity}}
                anim_props['listItem'].update(color_dict)

    return anim_props


changing_path = "static/content/animations/temp1_anim2.json"

an = readable(changing_path)
anim_properties = get_anim_props(an, changing_path)

lottiePlayersArray = db.get_all_animations()
lottiePlayersArrayPath = "../static/content/"
frames_array = db.get_all_frames("17")
frames_arrayPath = "../static/content/animations/"
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
        image = None
        # request.form['image']
        db.create_new_user(person_name, email, password, image)
        # get user info
        # dataFromDB = get_user(str(request.form['existUserEmail']), str(request.form['existUserPass']))
        # print(dataFromDB)
        # person_name = dataFromDB[1]
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


def copy_animations(new_path, old_path='static/content/animations/', name='empty'):
    with open(old_path+name + '.json', 'r') as in_file:
        # Reading from json file
        json_object = json.load(in_file)

    new_name = name + '_' + str(int(time.time())) + ".json"

    with open(new_path+new_name, "w") as out_file:
        json.dump(json_object, out_file)
    return new_name


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
            db.create_new_video(project_id, video_name)

            project_owner = db.get_project_owner(str(project_id))[0]
            video_id = db.get_last_video_id(project_id)[0]
            frame_path = f'static/db/users/{project_owner}/{project_id}/videos/{video_id}/frames/'


            frame_name = copy_animations(frame_path)
            id =db.get_last_video_id(str(project_id))[0]
            db.create_new_frame(id, frame_name)

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
    global paletteName
    paletteName = ""
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
    if request.method == 'POST':

        return jsonify(result=get_anim_props(an, changing_path), frames=get_frames_from_db())
    # text_color = colors.to_hex(anim_properties['text']['color'])
    # text_content = anim_properties['text']['content']
    # alignment = anim_properties['text']['alignment']
    return render_template(
        'editContent.html',
        title='תוכן',
        # var=anim_properties
    )


def get_frames_from_db():
    frames_array = db.get_all_frames("17")
    frames_arrayPath = "../static/db/users/10/11/videos/17/frames/"
    frames_list = []
    myArray = [frames_arrayPath, frames_list]
    for frame in frames_array:
        frames_list.append([frame[0],frame[1]])
    return myArray


@application.route('/changeAnimText', methods=['POST'])
def change_anim_text():
    text = request.form['textcontent']
    color = request.form['textcolor']
    alignment = request.form['textalignment']
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


@application.route('/changeAnimColor', methods=['POST'])
def change_anim_color():
    prime_color = request.form['primary']
    sec_color = request.form['secondary']
    prim_opacity = 100  # request.form['opacityRange']
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


@application.route('/changeAnimImage', methods=['POST'])
def change_anim_image():
    if 'image' not in request.files:
        return jsonify(result="Not good!")
    file = request.files['image']
    if file.filename == '':
        return redirect(request.url)

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        location = os.path.join(application.config['UPLOAD_FOLDER'], filename)
        file.save(location)
        new_image = change_image(location)
        return jsonify(result=new_image)
    # myName = "something"
    # image_64 = request.form['image']
    # sec_color = request.form['secondary']
    # prim_opacity = 100  # request.form['opacityRange']
    # new_image = change_image(image_64)

    # image = objects.assets.Image().load(image_filename)
    # image_data = image.embedded(image_filename).image
    # an.assets[0].image = image_data

    # return jsonify(result=new_image)


def change_image(image_filename):
    global an
    global changing_path

    image = objects.assets.Image().load(image_filename)
    image_data = image.embedded(image_filename).image
    an.assets[0].image = image_data

    new_name = "temp" + str(int(time.time())) + ".json"
    exporters.export_lottie(an, "static/content/" + new_name)
    new_json = "static/content/" + new_name

    if changing_path[-6:-9:-1].isdigit():
        os.remove(changing_path)
    changing_path = new_json
    an = readable(changing_path)

    return get_anim_props(an, changing_path, image_filename)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS



@application.route('/add_frame', methods=['POST'])
def add_frame():
    db.create_new_frame("17")

    return jsonify(frames=get_frames_from_db())


@application.route('/changeFrame', methods=['POST'])
def change_frame():

    data = request.form['id']
    id = data[data.find('_')+1:]
    anim_url = db.get_frame_url_by_id(id)

    return change_animation(anim_url.decode("utf-8"))



@application.route('/editTemplate', methods=['POST', 'GET'])
def editTemplate():
    colorsArray = db.get_colors_by_palette("1")
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
        colorsArray=colorsArray,
        frames_array=frames_array,
        len=len(frames_array),
        frames_arrayPath=frames_arrayPath
    )


def change_animation(path):
    global an
    global changing_path
    global anim_properties
    changing_path = path[3:]
    an = readable(changing_path)
    anim_properties = get_anim_props(an, changing_path)
    return anim_properties


if __name__ == '__main__':
    application.run()

# @application.route('/editColor', methods=['POST', 'GET'])
# def editColor():
#     """
#     Renders the color editing page page
#     :return:
#     """
#     global anim_properties
#
#     if request.method == 'POST':
#         return jsonify(result=get_anim_props(an, changing_path))
#
#     return render_template(
#         'editColor.html',
#         title='צבע',
#     )
