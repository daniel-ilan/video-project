"""
Routes and views for the flask application.
"""

import json
import os
import time
from datetime import datetime

from flask import render_template, request, jsonify, Flask, redirect, session
from lottie import exporters, objects
from lottie.parsers.tgs import parse_tgs
from matplotlib import colors
from werkzeug.utils import secure_filename

import db



application = Flask(__name__)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
application.secret_key = os.urandom(24)



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

        if 'primary' in layer.name:
            color = colors.to_hex(layer.find('Fill 1').color.value.components)
            prim_opacity = layer.find('Fill 1').opacity.value
            primary_dict = {'primary': {'color': color, 'opacity': prim_opacity}}
            anim_props.update(primary_dict)

        elif 'base' in layer.name:
            out_color = colors.to_hex(layer.find('Fill 1').color.value.components)
            sec_opacity = layer.find('Fill 1').opacity.value
            secondary_dict = {'secondary': {'color': out_color, 'opacity': sec_opacity}}
            anim_props.update(secondary_dict)

        elif 'third' in layer.name:
            color = colors.to_hex(layer.find('Fill 1').color.value.components)
            prim_opacity = layer.find('Fill 1').opacity.value
            primary_dict = {'third': {'color': color, 'opacity': prim_opacity}}
            anim_props.update(primary_dict)

        elif layer.name == '.image':
            # image_dict = {'image': "name"}
            anim_props['image'] = "true"

        elif layer.name.startswith(".listText") and list_changed is False:
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
                anim_props['listItem']['text']['content'].append(correct_text(text_content))


        ### This code is for individual layer colors we are doing only 3 colors
        # elif layer.name.find(".primaryColorList") != -1:
        #     primary_layer_num = int(layer.name[-1])
        #     if primary_layer_num == 1:
        #         color = colors.to_hex(layer.find('Fill 1').color.value.components)
        #         prim_opacity = layer.find('Fill 1').opacity.value
        #         color_dict = {'primary': {'color': color, 'opacity': prim_opacity}}
        #         anim_props['listItem'].update(color_dict)
        #
        # elif layer.name.find(".baseColorList") != -1:
        #     secondary_layer_num = int(layer.name[-1])
        #     if secondary_layer_num == 1:
        #         color = colors.to_hex(layer.find('Fill 1').color.value.components)
        #         prim_opacity = layer.find('Fill 1').opacity.value
        #         color_dict = {'secondary': {'color': color, 'opacity': prim_opacity}}
        #         anim_props['listItem'].update(color_dict)


        elif layer.name == ".empty":
            empty_dict = {'empty': 'empty'}
            anim_props.update(empty_dict)
        elif layer.name == '.myText':
            text_color = layer.data.data.keyframes[0].start.color
            text_content = layer.data.data.keyframes[0].start.text
            text_alignment = layer.data.data.keyframes[0].start.justify.value
            text_dict = {'color': colors.to_hex(list(text_color[0:3])),
                         'content': correct_text(text_content),
                         'alignment': text_alignment}
            anim_props['text'] = text_dict
    return anim_props


colorsArray = []


@application.route('/index')
def index():

    frames_props = get_frames_from_db()

    """Renders the home page."""
    return render_template(
        'index.html',
        frames=frames_props,
        title='אודות',
        year=datetime.now().year
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
    current_project = 19
    current_video = 36

    user_id = db.get_user_id('rubider@hotmail.com')[0]
    session['CURRENT_USER'] = user_id
    session['CURRENT_PROJECT'] = current_project
    session['CURRENT_VIDEO'] = current_project

    session['COLLECTION_PATH'] = "static/content/animations/"
    session['UPLOAD_FOLDER'] = "static/content/animations/images"
    session['WORKING_PATH'] = f'static/db/users/{user_id}/{current_project}/videos/{current_video}/frames/'

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

            frame_name = copy_animations("empty new project", frame_path)
            id = db.get_last_video_id(str(project_id))[0]
            db.create_new_frame(id, frame_name,0)

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


# @application.route("/")
@application.route('/editContent', methods=['POST', 'GET'])
def editContent():

    current_project = 19
    current_video = 36

    user_id = db.get_user_id('rubider@hotmail.com')[0]
    session['CURRENT_USER'] = user_id
    session['COLLECTION_PATH'] = "static/content/animations/"
    session['UPLOAD_FOLDER'] = "static/content/animations/images"
    session['WORKING_PATH'] = f'static/db/users/{user_id}/{current_project}/videos/{current_video}/frames/'
    application.config['UPLOAD_FOLDER'] = session.get('UPLOAD_FOLDER')
    return render_template(
        'editContent.html',
        title='שם הסרטון',
        # var=anim_properties
    )


@application.route('/get_all_animation_by_kind', methods=['POST', 'GET'])
def get_all_animation_by_kind():
    animations_array = []
    my_path = ""
    if request.method == 'POST':
        event_kind = request.form["event_kind"]
        if (event_kind == "button_switch"):
            frames_props = get_frames_from_db()
            my_path = session.get('COLLECTION_PATH')
            frame_id = request.form["frame_id"][request.form["frame_id"].find('_') + 1:]
            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))
            kind = current_frame[4]
            selected_frames = db.get_all_animation_by_kind(kind)
            for frame in selected_frames:
                # [frame_id],[lottie_url],[selected_animation_id],[selected_animation_kind]
                animations_array.append([frame[0], frame[1], frame[2], False])
            brand_frames = get_animations_by_kind(kind)

            # mark the brand animations as True
            for x_all_frames in range(len(animations_array)):
                for y_brand_frames in range(len(brand_frames)):
                    if animations_array[x_all_frames][2] == brand_frames[y_brand_frames][2]:
                        animations_array[x_all_frames][3] = True

        return jsonify(frames=animations_array, event_kind=event_kind, path=my_path, kind=kind)


@application.route('/frame_change', methods=['POST', 'GET'])
def frame_change():
    anim_props = ""
    current_frame = []
    lit_anim = []
    kind = ""
    frames_props = get_frames_from_db()
    path = frames_props[0]
    general_frame = []
    frame_text = ""


    if request.method == 'POST':
        frame_id = request.form["frame_id"][request.form["frame_id"].find('_') + 1:]
        event_kind = request.form["event_kind"]
        if (event_kind == "onLoad"):
            anim_props = get_anim_props(path + str(frames_props[1][0][1]))
            current_frame = frames_props[1][0]
            kind = current_frame[3]
            frame_text = current_frame[4]

        elif event_kind == "delete_frame":
            current_frame = delete_frame(frame_id)
            anim_props = get_anim_props(path + str(current_frame[3]))
            kind = current_frame[4]
            frame_text = current_frame[6]

        elif event_kind == "new_frame":
            add_frame()
            last_frame = len(frames_props[1]) - 1
            anim_props = get_anim_props(path + str(frames_props[1][last_frame][1]))
            current_frame = frames_props[1][last_frame]
            kind = current_frame[3]
            frame_text = current_frame[4]


        elif event_kind == "frame_click":
            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))
            anim_props = get_anim_props(path + current_frame[3])
            frames_props = None
            kind = current_frame[4]
            frame_text = current_frame[6]

        elif event_kind == "change_kind_click":

            selected_kind = request.form["selected_kind"]
            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))

            # create a copy of new lottie by the kind
            new_lottie = copy_animations(selected_kind, "")

            # remove old file from dit
            remove_path = session.get('WORKING_PATH') + str(db.get_frame_by_id(frame_id)[3])
            os.remove(remove_path)

            # change data in db
            db.update_frame_props(current_frame[0], new_lottie[0], selected_kind, new_lottie[1])

            anim_props = get_anim_props(path + new_lottie[0])
            frames_props = None
            kind = selected_kind
            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))
            frame_text = current_frame[6]

        elif event_kind == "submitChange":
            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))
            kind = current_frame[4]
            if kind == "image":
                form_data = request.files
            else:
                form_data = json.loads(request.form["form_data"])

            anim_props = update_anim_props(str(db.get_frame_by_id(frame_id)[3]), form_data, current_frame,
                                           "submitChange")

            # form_data = json.loads(request.form["form_data"])
            # anim_props = update_anim_props(str(db.get_frame_by_id(frame_id)[3]), form_data, current_frame,
            #                                "submitChange")

            # current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))
            frame_text = current_frame[6]


        elif event_kind == "change_mini_lottie" or event_kind == "select_from_general":
            # origimal anim
            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))
            kind = current_frame[4]
            anim_props_original = get_anim_props(path + current_frame[3])

            new_anim_id = request.form["selected_kind"][request.form["selected_kind"].find('_') + 1:]
            data_to_db = [frame_id, kind, new_anim_id, str(db.get_frame_by_id(frame_id)[3])]
            anim_props = update_anim_props(db.get_animations_url_by_id(new_anim_id)[0], anim_props_original, data_to_db,
                                           "change_mini_lottie")

        color_palettes = db.get_colors_by_palette("1")
        color_palettes_array = []
        for color in color_palettes:
            color_palettes_array.append([color[1], color[0]])
        lit_anim = get_animations_by_kind(kind)

        if event_kind == "select_from_general":
            general_frame = db.get_genral_anim_props_by_id(new_anim_id)  # array structure [animation_name], [animation_url], [animation_id]

        elif event_kind == "onLoad" or event_kind == "new_frame":
            general_frame = db.get_genral_anim_props_by_id(str(current_frame[2]))

        elif event_kind == "delete_frame" or event_kind == "frame_click" or event_kind == "change_kind_click" or event_kind == "submitChange" or event_kind == "change_mini_lottie":
            general_frame = db.get_genral_anim_props_by_id(str(current_frame[5]))

        check_if_in_collection = False
        if (event_kind != "new_frame" or event_kind != "change_kind_click"):
            # the check isn't relevnt cause it's start only with collection animations
            for x in range(len(lit_anim)):
                if lit_anim[x][2] == general_frame[2]:
                    # check if the anmations is in the collection, if it is then make check_if_in_collection True
                    check_if_in_collection = True
        if check_if_in_collection == False:
            # it it's false then add the anim props to the page
            lit_anim.append([general_frame[0], session.get('COLLECTION_PATH') + general_frame[1], general_frame[2], True])


        return jsonify(anim_props=anim_props, frames=frames_props, event_kind=event_kind, current_frame=current_frame,
                       animation_by_kind=lit_anim, kind=kind, color_palettes=color_palettes_array, frame_text=frame_text)


def update_anim_props(file_name, data, frame_prop, kind_of_update_event):

    if kind_of_update_event == "submitChange":
        path = session.get('WORKING_PATH') + file_name
        name_for_new_name = frame_prop[4]
    else:
        path = session.get('COLLECTION_PATH') + file_name
        name_for_new_name = frame_prop[1]

    an = readable(path)
    text = {}
    color = {}
    list_text = {'listItem_color': "",
                 'listItemalignment': "",
                 'listContent': []}
    list_color = {}
    image = False
    notes = ""

    if kind_of_update_event == "submitChange":
        for item in data:
            if item[0] == "primary":
                color.update({"primary": item[1]})
            elif item[0] == "secondary":
                color.update({"base": item[1]})
            elif item[0] == "third":
                color.update({"third": item[1]})
            elif item[0] == "textalignment":
                text.update({"textalignment": item[1]})
            elif item[0] == "textcontent":
                text.update({"textcontent": item[1]})
            elif item[0] == "text_color":
                text.update({"textcolor": item[1]})
            elif item[0] == "side_note":
                notes = item[1]
            elif item[0] == "f":
                image = True

            # bullets text
            elif item[0].startswith('listItemcontent'):
                list_num = item[0][-1]
                list_text['listContent'].append([item[1], list_num])

            # bullets color
            elif item[0] == "listItem_color":
                list_text.update({"listItem_color": item[1]})
            # bullets alignment
            elif item[0] == 'listItemalignment':
                list_text.update({"listItemalignment": item[1]})

            ### This code is for individual bullet color - we are doing three colors alltogether
            # # bullets color 1
            # elif item[0] == 'listItem_primary':
            #     list_color.update({"primary": item[1]})
            # # bullets color 2
            # elif item[0] == 'listItem_secondary':
            #     list_color.update({"secondary": item[1]})
    else:
        for item in data:
            if item == "primary":
                color.update({"primary": data[item]['color']})
            elif item == "secondary":
                color.update({"base": data[item]['color']})
            elif item == "text":
                text.update({"textcontent": data[item]['content']})
                text.update({"textcolor": data[item]['color']})
                text.update({"textalignment": data[item]['alignment']})

    if len(text) > 0:
        an = change_text(an, text["textcontent"], text["textcolor"], text["textalignment"])
    if len(color) > 0:
        an = change_color(an, color, 100)
    if image is True:
        an = save_image(data, an)
    if len(list_text['listContent']) > 0:
        an = change_list_text(an, list_text['listContent'], list_text["listItem_color"], list_text["listItemalignment"])


    # create new name & file
    new_name = name_for_new_name + "_" + str(int(time.time())) + ".json"
    new_path = session.get('WORKING_PATH') + new_name
    exporters.export_lottie(an, new_path)

    if kind_of_update_event == "submitChange":
        os.remove(path)
        # update frame props on db
        db.update_frame_props(frame_prop[0], new_name, frame_prop[4], frame_prop[5], notes)
    else:
        os.remove(session.get('WORKING_PATH') + frame_prop[3])
        # update frame props on db
        db.update_frame_props(frame_prop[0], new_name, frame_prop[1], frame_prop[2], notes)
    return get_anim_props(new_path)


def save_image(data, an):
    if 'file' not in data:
        return jsonify(result="Not good!")
    file = data['file']
    if file.filename == '':
        return redirect(request.url)

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        location = os.path.join(application.config['UPLOAD_FOLDER'], filename)
        file.save(location)

        # convert image to lottie
        image = objects.assets.Image().load(location)
        image_data = image.embedded(location).image
        an.assets[0].image = image_data

        # remove from os
        os.remove(location)

        return an


def convert_row_to_list(row_data):
    # 0 -frame_id, 1- video_id, 2- connectionReplace, 3- lottie_url, 4- selected_animation_kind, 5-selected_animation_id 6
    frames_list = []
    for my_data in row_data:
        frames_list.append(my_data)
    return frames_list


def delete_frame(id: str):
    my_id = id
    # my_id = data[data.find('_') + 1:]
    all_frames = db.get_all_frames("36")
    prev_id = all_frames[0][1]
    for i in range(1, len(all_frames)):
        if all_frames[i][0] == int(my_id):
            prev_id = all_frames[i - 1][0]
            break

    path = session.get('WORKING_PATH') + str(db.get_frame_by_id(my_id)[3])
    os.remove(path)
    db.delete_frame(int(my_id))
    return convert_row_to_list(db.get_frame_by_id(str(prev_id)))


def get_animations_by_kind(kind):
    """
    todo: change '19' to the project we are working on
    :return:
    """
    myArray = []
    animations = db.get_animations_by_project_and_kind('19', kind)

    for anim in animations:
        myArray.append([anim[0], session.get('COLLECTION_PATH') + anim[1], anim[2]])
    return myArray


def add_frame():
    frame_path = session.get('WORKING_PATH')
    with open(session.get('COLLECTION_PATH') + "empty.json", 'r') as in_file:
        # Reading from json file
        json_object = json.load(in_file)

    new_name = 'empty_' + str(int(time.time())) + ".json"

    with open(frame_path + new_name, "w") as out_file:
        json.dump(json_object, out_file)

    num_frames = len(db.get_all_frames("36"))
    db.create_new_frame("36", new_name, num_frames)



def copy_animations(kind, new_path, old_path=''):
    old_path = session.get('COLLECTION_PATH')
    if kind == 'empty new project':
        empty_anim = db.get_animations_by_kind('empty')
        old_path = old_path + empty_anim[0][0]  # url
        anim_id = empty_anim[0][2]
        kind = "empty"
    else:
        get_anims = get_animations_by_kind(kind)
        old_path = get_anims[0][1]  # url
        anim_id = get_anims[0][2]
        new_path = session.get('WORKING_PATH')

    with open(old_path, 'r', encoding='utf-8') as in_file:
        # Reading from json file
        json_object = json.load(in_file)

    new_name = kind + '_' + str(int(time.time())) + ".json"

    with open(new_path + new_name, "w") as out_file:
        json.dump(json_object, out_file)
    return new_name, anim_id


def get_frames_from_db():
    # need to change "36"
    frames_array = db.get_all_frames('36')

    "need to change frames_arrayPath"
    # line velow should come out of a functions called get_frames_path
    frames_arrayPath = session.get('WORKING_PATH')
    frames_list = []
    myArray = [frames_arrayPath, frames_list]

    for frame in frames_array:
        # [frame_id],[lottie_url],[selected_animation_id],[selected_animation_kind],[frame_text],[order]
        frames_list.append([frame[0], frame[1], frame[2], frame[3], frame[4], frame[5]])
    return myArray


def change_text(an, text, color, alignment=1):
    anim_text = correct_text(text)

    correct_color = list(colors.to_rgba(color, float) + (1,))
    an.find('.myText').data.data.keyframes[0].start.color = correct_color[0:3]
    an.find('.myText').data.data.keyframes[0].start.text = anim_text
    an.find('.myText').data.data.keyframes[0].start.justify = objects.text.TextJustify(int(alignment))

    return an


def change_list_text(an, text: list, color, alignment=1):
    """
    :param an: animation object
    :param text: content and num of bullet
    :param color: the text color
    :return: an: animation object
    """
    layers = an.layers
    correct_color = list(colors.to_rgba(color, float) + (1,))
    text_layers = [layer for layer in layers if layer.name.startswith(".listText")]         # only layers with text
    num_layers = len(text_layers)
    bullet_deleted = False
    layers_to_delete = []
    while num_layers < len(text):
        an, text_layers = create_new_list_bullet(an, layers, text_layers, alignment=1)      # adds the new bullet to text_layers
        num_layers += 1

    n = len(layers)+5
    for text_item in text:
        for i in range(n):
            try:
                layer = layers[i]
            except IndexError:
                layer = False
            if layer:
                redundant_layer = layer.name[-1]  # Last letter in the layer's name to check which layers to delete

                if layer.name == f'.listText_{text_item[1]}':
                    anim_text = correct_text(text_item[0])
                    layer.data.data.keyframes[0].start.color = correct_color[0:3]
                    layer.data.data.keyframes[0].start.text = anim_text
                    layer.data.data.keyframes[0].start.justify = objects.text.TextJustify(int(alignment))

                # check if redundant_layer can be assigned to type: int
                # checks if redundant_layer is bigger then amount of text boxes == opposite of the while loop
                # deletes the layer
                #
                elif redundant_layer.isdigit():
                    if int(redundant_layer) > len(text):
                        bullet_deleted = True
                        del layers[i]   # do here !layer.remove! in the next few days
    for layer in layers:
        for name in layers_to_delete:
            if name == layer.name:
                del []
    if bullet_deleted is True:
        properties = {1: "anchor_point", 2: "position", 6: "scale", 10: "color", 11: "opacity"}
        layer_to_change = [layer for layer in layers if layer.name != ".hiddenText"]
        for layer in layer_to_change:
            type_transform = layer.find(True, propname='animated').property_index
            for i in range(-1, -3, -1):
                getattr(layer.transform, f"{properties[type_transform]}").keyframes[i].time -= 60
                layer.out_point -= 60
        an.out_point -= 60
    return an


def create_new_list_bullet(an, layers, text_layers, alignment=1):
    """
    :param an: animation
    :param layers: all layers
    :param text_layers: only text layers
    :return: an, text_layers: adds the new layer to both objects
    """
    from lottie import Point
    num_layers = len(text_layers)

    # holds the changable properties of layer.Transform
    # uses type_transform to find the correct property to change
    properties = {1: "anchor_point", 2: "position", 6: "scale", 10: "color", 11: "opacity"}

    for layer in layers:
        if layer.name == '.hiddenText':
            pass
        else:
            # type_transform & frames_to_change can hold only 1 parameter. if we animate more then 1 we need a list
            type_transform = layer.find(True, propname='animated').property_index

            # copies only layers from the first bullet
            if layer.name.endswith("1"):
                frames_to_change = layer.find(True, propname='animated').keyframes

                a = layer.clone()


                # changes the new name to the last name +1 in the end
                a.name = a.name.replace("1", str(num_layers + 1))
                if a.name.startswith(".listText"):
                    text_layers.append(a)

                # changes the y index of the new frame according
                # to the amount of all bullets in the animation
                # a.transform.position.value.y = layer.transform.position.value.y  + layer.transform.position.value.y  * num_layers
                anim_x = a.transform.position.value.x
                anim_y = a.transform.position.value.y + 250 * num_layers

                # we need to change the time of the transformation of the animated layer so we can see the animation
                # the in_point (start frame) of each layer is not enough
                # we need to keep the exit animation on the same time because we want all layers to exit together
                for i in range(0, len(frames_to_change)):
                    """
                    :param i represents the keyframe index -- we need to decide here how many keyframes we add to
                    an animation
                    in_time of the animation is the first 3 keyframes, here we add 60 * num_layers because
                    the last 3 frames are added again to layer.transform (== the animation gets in the same time it
                    always did but gets out later so we see all of it)
                    """
                    if i < 3:
                        getattr(a.transform, f"{properties[type_transform]}").keyframes[i].time += 60 * num_layers
                    else:
                        getattr(a.transform, f"{properties[type_transform]}").keyframes[i].time += 60
                a.out_point += 60
                layer.out_point += 60
                a.transform.position.value = Point(anim_x, anim_y)
                an.add_layer(a)

            if layer.name.endswith(str(num_layers + 1)):
                pass
            else:
                for i in range(-1, -3, -1):
                    getattr(layer.transform, f"{properties[type_transform]}").keyframes[i].time += 60
                    layer.out_point += 60

    an.out_point += 60
    return an, text_layers


def change_color(an, all_colors, opacity=1):

    layers = an.layers
    for layer in layers:
        for name, color in all_colors.items():
            if name is not None:
                correct_color = colors.to_rgba(color, float)
                if name in layer.name:
                    layer.find('Fill 1').color.value.components = list(correct_color[0:3] + (1,))
                    layer.find('Fill 1').opacity.value = float(opacity)


    # Old code need to delete
    # for layer in layers:
    #     if layer.name.contains(".primary"):
    #         layer.find('Fill 1').color.value.components = list(correct_color[0:3] + (1,))
    #         layer.find('Fill 1').opacity.value = float(opacity)
    #     elif layer.name.contains(".baseColor"):
    #         layer.find('Fill 1').color.value.components = list(correct_outline_color[0:3] + (1,))

    return an


def change_list_color(an, color, outline_color, name, opacity):

    correct_color = colors.to_rgba(color, float)
    correct_outline_color = colors.to_rgba(outline_color, float)


    layers = an.layers
    for layer in layers:
        if layer.name.endswith(f"{name}") and layer.name.startswith('.primaryColor'):
            layer.find('Fill 1').color.value.components = list(correct_color[0:3] + (1,))
            layer.find('Fill 1').opacity.value = float(opacity)
        elif layer.name.endswith(f"{name}") and layer.name.startswith('.baseColor'):
            layer.find('Fill 1').color.value.components = list(correct_outline_color[0:3] + (1,))

    return an


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@application.route("/")
@application.route('/projectPage', methods=['POST', 'GET'])
def projectPage():

    current_project = 19
    current_video = 36

    user_id = db.get_user_id('rubider@hotmail.com')[0]
    session['CURRENT_USER'] = user_id
    session['CURRENT_PROJECT'] = current_project
    session['CURRENT_VIDEO'] = current_project

    session['COLLECTION_PATH'] = "static/content/animations/"
    session['UPLOAD_FOLDER'] = "static/content/animations/images"
    session['WORKING_PATH'] = f'static/db/users/{user_id}/{current_project}/videos/{current_video}/frames/'
    application.config['UPLOAD_FOLDER'] = session.get('UPLOAD_FOLDER')
    return render_template(
        'projectPage.html',
        title='מותג',
        # var=anim_properties
    )

@application.route('/onLoad', methods=['POST', 'GET'])
def onLoad():
    if request.method == 'POST':
        page_name = request.form["page_name"]
        if page_name =='' or page_name == 'projectPage':
            collections_props,animations_props, collection_id, collection_length = collectionChange()
            colors = getPalette()
            return jsonify(collections_props=collections_props,animations_props=animations_props,
                           collection_id=collection_id,collection_length=collection_length,
                           selected_collection_id =collection_id , page_name=page_name, colors = colors)


def convert_row_to_list_include_childrens(data):
    collections_props = convert_row_to_list(data)
    new_collections_props = []
    for my_data in collections_props:
        dataToArray = []
        for data in my_data:
            dataToArray.append(data)
        new_collections_props.append(dataToArray)
    return new_collections_props


@application.route('/collectionChange', methods=['POST', 'GET'])
def collectionChange():
    event_kind=""
    selected_collection_id = db.get_project_collections_id(session.get('CURRENT_PROJECT'))
    collection_id = db.get_project_collections_id(session.get('CURRENT_PROJECT'))


    collections_props = convert_row_to_list_include_childrens(db.get_all_collections())
    check_if_collection_isInclude = False
    for col_id in collections_props:
        if col_id[0] == collection_id:
            check_if_collection_isInclude = True

    if check_if_collection_isInclude == False:
        collections_props.append(convert_row_to_list(db.get_collections_by_id(collection_id)))

    if request.method == 'POST':
        event_kind = request.form["event_kind"]
        if event_kind =='switch_event':
            selected_collection_id = request.form["col_id"]
        elif event_kind == 'ChooseCollection':
            selected_collection_id = request.form["col_id"]
            db.update_project_collection(selected_collection_id,session.get('CURRENT_PROJECT'))
            collection_id = selected_collection_id


    animations_props = [session.get('COLLECTION_PATH'),
                        convert_row_to_list_include_childrens(db.get_collection(selected_collection_id))]
    collection_length = len(convert_row_to_list_include_childrens(db.get_collection(collection_id)))

    if event_kind == 'pageLoad':
        return collections_props,animations_props, collection_id, collection_length,
    elif event_kind =='switch_event':
        return jsonify(collections_props=collections_props, animations_props=animations_props,collection_id=collection_id, selected_collection_id=selected_collection_id, collection_length=collection_length)
    elif event_kind =='ChooseCollection':
        return jsonify(collections_props=collections_props,collection_id=collection_id, selected_collection_id=selected_collection_id, collection_length=collection_length)

    return ""


@application.route('/getPalette', methods=['POST', 'GET'])
def getPalette():
    palette_id = db.get_palette_by_projcect(session.get('CURRENT_PROJECT'))[0]
    colors = convert_row_to_list_include_childrens(db.get_colors_by_palette(palette_id))
    return colors


@application.route('/get_all_palettes', methods=['POST', 'GET'])
def get_all_palettes():
    colors =[]

    if request.method == 'POST':
        event_kind = request.form["event_kind"]
        palettes_id = convert_row_to_list_include_childrens(db.get_all_palettes_id())
        for palette in palettes_id:
            colors.append([palette, convert_row_to_list_include_childrens(db.get_colors_by_palette(palette[0]))])
    return jsonify(colors = colors,event_kind=event_kind )


@application.route('/PaletteHandler', methods=['POST', 'GET'])
def PaletteHandler():
    if request.method == 'POST':
        event_kind = request.form["event_kind"]
        colors = []
        if event_kind =='ChoosePaletteFromCollection':
            new_palette_id = request.form["pal_id"]
            db.update_project_palette(new_palette_id,session.get('CURRENT_PROJECT'))
            colors = getPalette()

        if event_kind == 'ChangeColor':
            colorId = request.form["colorId"]
            colorValue =request.form["pal_id"]
            proj_palette = db.get_palette_by_projcect(session.get('CURRENT_PROJECT'))[0]
            check = db.check_palette_generalYN(proj_palette)[0][0]
            if check:
                proj_id = session.get('CURRENT_PROJECT')
                db.create_palette(proj_id,proj_id)
                initial_colors = getPalette();
                new_palette_id = db.get_last_palette_id(proj_id)[0]
                for color in initial_colors:
                     color_v = color[0]
                     if color[2] == colorId:
                         color_v =colorValue
                     db.create_color(color_v,color[1],new_palette_id)

                # check if the palette is custom or from general, if it's custom delete and create new one
                if  db.check_palette_generalYN(proj_palette) == False:
                    db.delete_palette(proj_palette)
                        #im here
                db.update_project_palette(new_palette_id,proj_id)
            else:
                db.update_color_hex(colorId,colorValue)
        return jsonify(colors = colors, event_kind = event_kind)

if __name__ == '__main__':
    application.run()


