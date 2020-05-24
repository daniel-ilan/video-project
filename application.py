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
COLLECTION_PATH =  "static/content/animations/"


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
            # image_dict = {'image': "name"}
             anim_props['image'] = "true"

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

            frame_name = copy_animations("empty new project" ,frame_path)
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
    path = get_frames_from_db()[0]
    if request.method == 'POST':
        event_kind = request.form["event_kind"]
        if(event_kind == "onLoad"):
            frames_props = get_frames_from_db()
            anim_props = get_anim_props(path + str(frames_props[1][0][1]))
            current_frame = frames_props[1][0]
            kind = current_frame[3]

        elif event_kind == "delete_frame":
            frame_id = request.form["frame_id"]
            current_frame = delete_frame(frame_id)
            frames_props = get_frames_from_db()
            anim_props = get_anim_props(path + str(current_frame[3]))
            kind = current_frame[4]

        elif event_kind == "new_frame":
            add_frame()
            frames_props = get_frames_from_db()
            last_frame = len(frames_props[1]) - 1
            anim_props = get_anim_props(path + str(frames_props[1][last_frame][1]))
            current_frame = frames_props[1][last_frame]
            kind = current_frame[3]


        elif event_kind == "frame_click":
            frames_props = get_frames_from_db()
            frame_id = request.form["frame_id"][request.form["frame_id"].find('_') + 1:]
            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))
            anim_props = get_anim_props(path + current_frame[3])
            frames_props= None
            kind = current_frame[4]

        elif event_kind == "change_kind_click":
            frames_props = get_frames_from_db()

            selected_kind = request.form["selected_kind"]
            frame_id = request.form["frame_id"][request.form["frame_id"].find('_') + 1:]
            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))

            # create a copy of new lottie by the kind
            new_lottie = copy_animations(selected_kind,"")

            # remove old file from dit
            remove_path = WORKING_PATH + str(db.get_frame_by_id(frame_id)[3])
            os.remove(remove_path)

            # change data in db
            db.update_frame_props(current_frame[0],new_lottie[0],selected_kind,new_lottie[1])

            anim_props = get_anim_props(path + new_lottie[0])
            frames_props= None
            kind = selected_kind
            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))

        elif event_kind == "submitChange":
            frame_id = request.form["frame_id"][request.form["frame_id"].find('_') + 1:]
            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))
            kind = current_frame[4]
            if kind == "image":
                form_data = request.files
            else:
                form_data = json.loads(request.form["form_data"])

            anim_props = update_anim_props(str(db.get_frame_by_id(frame_id)[3]),form_data,current_frame,"submitChange")

            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))
            frames_props= get_frames_from_db()

        elif event_kind == "change_mini_lottie":
            #origimal anim
            frame_id = request.form["frame_id"][request.form["frame_id"].find('_') + 1:]
            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))
            kind = current_frame[4]
            anim_props_original = get_anim_props(path + current_frame[3])

            new_anim_id = request.form["selected_kind"][request.form["selected_kind"].find('_') + 1:]
            data_to_db = [frame_id,kind,new_anim_id,str(db.get_frame_by_id(frame_id)[3])]
            anim_props = update_anim_props(db.get_animations_url_by_id(new_anim_id)[0],anim_props_original,data_to_db, "change_mini_lottie")

            current_frame = convert_row_to_list(db.get_frame_by_id(frame_id))
            frames_props= get_frames_from_db()

        lit_anim = get_animations_by_kind(kind)
        return jsonify(anim_props=anim_props, frames=frames_props, event_kind=event_kind, current_frame =current_frame, animation_by_kind =lit_anim, kind = kind)


def update_anim_props(file_name, data,frame_prop, kind_of_update_event):
    if kind_of_update_event == "submitChange":
        path = WORKING_PATH + file_name
        name_for_new_name = frame_prop[4]
    else:
        path = COLLECTION_PATH + file_name
        name_for_new_name = frame_prop[1]

    an = readable(path)
    text = {}
    color = {}
    image = False

    if kind_of_update_event =="submitChange":
        for item in data:
            if item[0] == "primary":
                color.update({"primary": item[1]})
            elif item[0] == "secondary":
                color.update({"secondary": item[1]})
            elif item[0] == "textalignment":
                text.update({"textalignment": item[1]})
            elif item[0] == "textcontent":
                text.update({"textcontent": item[1]})
            elif item[0] == "textcolor":
                text.update({"textcolor": item[1]})
            elif item[0] == "f":
                image = True
    else:
        for item in data:
            if item == "primary":
                color.update({"primary": data[item]['color']})
            elif item == "secondary":
                color.update({"secondary": data[item]['color']})
            elif item == "text":
                text.update({"textcontent": data[item]['content']})
                text.update({"textcolor": data[item]['color']})
                text.update({"textalignment": data[item]['alignment']})

    if len(text) > 0:
        an = change_text(an, text["textcontent"], text["textcolor"], text["textalignment"])
    if len(color) > 0:
        an = change_color(an, color["primary"], color["secondary"], 100)

    if image == True:
        an = save_image(data, an)

    #create new name & file
    new_name = name_for_new_name +"_" + str(int(time.time())) + ".json"
    new_path = WORKING_PATH + new_name
    exporters.export_lottie(an, new_path)

    if kind_of_update_event =="submitChange":
        os.remove(path)
        # update frame props on db
        db.update_frame_props(frame_prop[0],new_name,frame_prop[4],frame_prop[5])
    else:
        os.remove(WORKING_PATH+frame_prop[3])
        # update frame props on db
        db.update_frame_props(frame_prop[0],new_name,frame_prop[1],frame_prop[2])
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
    # 0 -frame_id, 1- video_id, 2- conectionReplace, 3- lottie_url, 4- selected_animation_kind, 5-selected_animation_id
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


def copy_animations(kind ,new_path, old_path='static/content/animations/'):
    if kind == 'empty new project':
        empty_anim = db.get_animations_by_kind('empty')
        old_path = old_path + empty_anim[0][0]  # url
        anim_id = empty_anim[0][2]
        kind = "empty"
    else:
        get_anims = db.get_animations_by_kind(kind)
        old_path = old_path + get_anims[0][0]  # url
        anim_id = get_anims[0][2]
        new_path = WORKING_PATH

    with open(old_path, 'r', encoding='utf-8') as in_file:
        # Reading from json file
        json_object = json.load(in_file)

    new_name = kind + '_' + str(int(time.time())) + ".json"

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
        # [frame_id],[lottie_url],[selected_animation_id],[selected_animation_kind]
        frames_list.append([frame[0], frame[1], frame[2],frame[3]])
    return myArray



def change_text(an, text, color, alignment=1):
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


def change_color(an, color, outline_color, opacity):
    correct_color = colors.to_rgba(color, float)
    correct_outline_color = colors.to_rgba(outline_color, float)
    an.find('.primaryColor').find('Fill 1').color.value.components = list(correct_color[0:3] + (1,))
    an.find('.baseColor').find('Fill 1').color.value.components = list(correct_outline_color[0:3] + (1,))
    an.find('.primaryColor').find('Fill 1').opacity.value = float(opacity)
    return an



def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS



if __name__ == '__main__':
    application.run()
