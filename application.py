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
WORKING_PATH = 'static/db/users/10/11/videos/27/frames/'

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


def get_anim_props(path, image_path=""):
    """
    todo: add any new property we are changing: last added image_layer: image
    :param anim: tgs Animation object
    :return: dictionary with all values used in HTML controls

    """
    anim = readable(path)
    anim_props = {'path': path}
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
        elif layer.name == ".empty":
            empty_dict = {'empty': 'empty'}
            anim_props.update(empty_dict)
    return anim_props


frames_arrayPath = "static/content/animations/"
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

            # 3 lines below this needs to be in a function called get_frames_path
            project_owner = db.get_project_owner(str(project_id))[0]
            video_id = db.get_last_video_id(project_id)[0]
            frame_path = f'static/db/users/{project_owner}/{project_id}/videos/{video_id}/frames/'

            frame_name = copy_animations(frame_path)
            id = db.get_last_video_id(str(project_id))[0]
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


@application.route("/")
@application.route('/editContent', methods=['POST', 'GET'])
def editContent():
    return render_template(
        'editContent.html',
        title='שם הסרטון',
        # var=anim_properties
    )


@application.route('/frame_change', methods=['POST', 'GET'])
def frame_change():
    anim_props = ""
    frames_props=""
    current_frame=""
    lit_anim = ""
    kind = ""
    if request.method == 'POST':
        event_kind = request.form["event_kind"]
        if(event_kind == "onLoad"):
            frames_props = get_frames_from_db()
            anim_props = get_anim_props(frames_props[0] + str(frames_props[1][0][1]))
            current_frame = frames_props[1][0]
            kind = current_frame[3]

        elif event_kind == "delete_frame":
            frame_id = request.form["frame_id"]
            current_frame = delete_frame(frame_id)
            frames_props = get_frames_from_db()
            anim_props = get_anim_props(frames_props[0] + str(current_frame[3]))
            kind = current_frame[4]


        elif event_kind == "new_frame":
            add_frame()
            frames_props = get_frames_from_db()
            last_frame = len(frames_props[1]) - 1
            anim_props = get_anim_props(frames_props[0] + str(frames_props[1][last_frame][1]))
            current_frame = frames_props[1][last_frame]
            kind = current_frame[3]


        elif event_kind == "frame_click":
            frames_props = get_frames_from_db()
            frame_id = request.form["frame_id"][request.form["frame_id"].find('_') + 1:]
            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))
            anim_props = get_anim_props(frames_props[0] + current_frame[3])
            frames_props= None
            kind = current_frame[4]


        lit_anim = get_animations_by_kind(kind)
        return jsonify(anim_props=anim_props, frames=frames_props, event_kind=event_kind, current_frame =current_frame, animation_by_kind =lit_anim, kind = kind)


def convert_row_to_list(row_data):
    frames_list = []
    for my_data in row_data:
        frames_list.append(my_data)
    return frames_list


def delete_frame(id: str):
    data = id
    my_id = data[data.find('_') + 1:]
    all_frames = db.get_all_frames("27")
    prev_id = all_frames[0][1]
    for i in range(1, len(all_frames)):
        if all_frames[i][0] == int(my_id):
            prev_id = all_frames[i - 1][0]
            break

    path = WORKING_PATH + str(db.get_frame_by_id(my_id)[3])
    os.remove(path)
    db.delete_frame(my_id)
    return convert_row_to_list(db.get_frame_by_id(str(prev_id)))


def get_animations_by_kind(kind):
    """
    todo: change '11' to the project we are working on
    :return:
    """
    myArray = []
    animations = db.get_animations_by_project_and_kind('11', kind)

    for anim in animations:
        myArray.append([anim[0], "static/content/animations/" + anim[1], anim[2]])
    return myArray


def add_frame():
    frame_path = WORKING_PATH
    with open(frames_arrayPath + "empty.json", 'r') as in_file:
        # Reading from json file
        json_object = json.load(in_file)

    new_name = 'empty_' + str(int(time.time())) + ".json"

    with open(frame_path + new_name, "w") as out_file:
        json.dump(json_object, out_file)

    db.create_new_frame("27", new_name)


def copy_animations(new_path, old_path='static/content/animations/', name='empty'):
    if name == 'empty':
        empty_anim = db.get_animations_by_kind('empty')
        old_path = old_path + empty_anim[0][0]  # url
        anim_id = empty_anim[0][2]
    with open(old_path, 'r') as in_file:
        # Reading from json file
        json_object = json.load(in_file)

    new_name = name + '_' + str(int(time.time())) + ".json"

    with open(new_path + new_name, "w") as out_file:
        json.dump(json_object, out_file)
    return new_name, anim_id


def get_frames_from_db():
    # need to change "27"
    frames_array = db.get_all_frames("27")

    "need to change frames_arrayPath"
    # line velow should come out of a functions called get_frames_path
    frames_arrayPath = "static/db/users/10/11/videos/27/frames/"
    frames_list = []
    myArray = [frames_arrayPath, frames_list]

    for frame in frames_array:
        frames_list.append([frame[0], frame[1], frame[2],frame[3]])
    return myArray


@application.route('/changeAnim', methods=['POST'])
def change_anim():
    global an
    to_change = request.form
    text = {}
    color = {}
    image = []
    list = []
    path = request.form["path"]
    for item in to_change:
        if item == "primary":
            color.update({"primary": to_change[item]})
        elif item == "secondary":
            color.update({"secondary": to_change[item]})
        elif item == "textalignment":
            text.update({"textalignment": to_change[item]})
        elif item == "textcontent":
            text.update({"textcontent": to_change[item]})
        elif item == "textcolor":
            text.update({"textcolor": to_change[item]})

    if len(text) > 0:
        new_text = change_text(text["textcontent"], text["textcolor"], text["textalignment"])
    if len(color) > 0:
        new_color = change_color(color["primary"], color["secondary"], 100)

    new_name = "temp" + str(int(time.time())) + ".json"
    exporters.export_lottie(an, path)
    new_json = WORKING_PATH + new_name
    if path[-6:-9:-1].isdigit():
        os.remove(path)
    path = new_json
    an = readable(path)
    return get_anim_props(an, path)


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

    return an


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
    return an


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


if __name__ == '__main__':
    application.run()
