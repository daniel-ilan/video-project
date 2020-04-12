"""
Routes and views for the flask application.
"""

import os
from datetime import datetime
from flask import render_template, request, Flask
from flaskext.mysql import MySQL
from matplotlib import colors
from tgs import Color
from tgs import objects
from tgs.parsers.tgs import parse_tgs
from tgs import exporters
import time

application = Flask(__name__)
application.config['MYSQL_DATABASE_USER'] = 'admin'
application.config['MYSQL_DATABASE_PASSWORD'] = 'Password1'
application.config['MYSQL_DATABASE_DB'] = 'edvideo'
mysql = MySQL()
mysql.init_app(application)


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
    color = anim.find('.primaryColor').find('Fill 1').color.value.components
    out_color = anim.find('.baseColor').find('Fill 1').color.value.components
    anim_props = {'text': {'color': list(text_color[0:3] + [1]),
                           'content': text_content},
                  'shapes': {'background': color,
                             'outline': out_color}}
    return anim_props


changing_path = "static/content/temp1_anim1.json"
an = readable(changing_path)
anim_properties = get_anim_props(an)

myLoAr = ["../static/content/temp1_anim1.json", "../static/content/temp1_anim2.json"]
lottiePlayersArray = [["temp1_anim1.json", "שקיפות"], ["temp1_anim2.json", "בהדרגה מימין"],
                      ["temp1_anim3.json", "מצד ימין"], ["temp1_anim4.json", "שלום"], ["temp2_anim1.json", "שקיפות"],
                      ["temp2_anim2.json", "בהדרגה מימין"], ["temp2_anim3.json", "מצד ימין"],
                      ["temp2_anim4.json", "שלום"]]
lottiePlayersArrayPath = "../static/content/"


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
        if request.form['existUserEmail'] != '' and request.form['existUserPass'] !='':
            #get user info
            dataFromDB = get_user(str(request.form['existUserEmail']), str(request.form['existUserPass']))
            print(dataFromDB)
            person_name = dataFromDB[1]
            person_last_name = dataFromDB[2]
            email = dataFromDB[3]
            password = dataFromDB[4]
        else:
            #new user
            person_name = request.form['person_name']
            person_last_name = request.form['person_last_name']
            email = request.form['email']
            password = request.form['password']
            image = None  #request.form['image']
            create_new_user(person_name, person_last_name, email, password, image)
    else:
         person_name=""
         person_last_name=""
         email=""
         password=""
    """Renders the about page."""
    return render_template(
        'about.html',
        title='About',
        year=datetime.now().year,
        message='Your application description page.',
        person_name= person_name,
        person_last_name=person_last_name,
        email=email,
        password=password
    )


@application.route("/")
@application.route('/newProject', methods=['POST', 'GET'])
def newProject():
    if request.method == 'POST':
        if request.form['submit_button'] == 'submit_id':
            # get user info
            userID = request.form['userID']
            update_project_last_update("1")
            data = get_project_info(userID)
            print(data)
        else:
            # new user
            userID = int(request.form['project_owner'])
            project_name = request.form['project_name']
            project_image = None  # request.form['project_image']
            create_new_project(userID, project_name, project_image)

    """Renders the contact page."""
    return render_template(
        'newProject.html',
        title='newProject',
        year=datetime.now().year,
        message='Your contact page.',
        username = "xxxx"
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
        an.find('.myText').data.data.keyframes[0].start.text = text
        anim_properties['text']['content'] = text

    correct_color = colors.to_rgba(color, float)
    an.find('.myText').data.data.keyframes[0].start.color[0:3] = list(correct_color[0:3] + (1,))

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


# @application.route("/")
@application.route('/editTemplate', methods=['POST', 'GET'])
def editTemplate():
    global changing_path
    """
    gets an ajax request and changes the json file attached to the lottie-player
    todo: this is not secure now and needs to be written correctly
    :return: nothing. It just changes the file associated with the main animation lottie-player
    """    """Renders the about page."""
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
        lottiePlayersArrayPath=lottiePlayersArrayPath
    )

def update_query(query:str):
    cursor = mysql.get_db().cursor()
    con = mysql.get_db()
    cursor.execute(query)
    con.commit()
    cursor.close()

def select_one_query(query:str):
    cursor = mysql.get_db().cursor()
    cursor.execute(query)
    query_data = cursor.fetchone()
    cursor.close()
    return query_data

def select_many_query(query:str, some:str):
    cursor = mysql.get_db().cursor()
    cursor.execute(query)
    query_data = cursor.fetchmany(some)
    cursor.close()
    return query_data

def select_all_query(query:str):
    cursor = mysql.get_db().cursor()
    cursor.execute(query)
    query_data = cursor.fetchall()
    cursor.close()
    return query_data

def create_new_user(person_name: str, person_last_name: str, email: str, password: str, image: str = None):
    image = f"'{image}'" if image else 'null'
    person_name = email.strip()
    person_last_name = password.strip()
    email = email.strip()
    password = password.strip()
    query = f"INSERT INTO users (person_name ,person_last_name,email ,password ,image,total_storage ,in_use_storage) VALUES('{person_name}','{person_last_name}','{email}','{password}',{image},DEFAULT,DEFAULT);"
    update_query(query)

def get_user(email: str, password: str):
    email = email.strip()
    password = password.strip()
    query = f"SELECT * FROM users WHERE email= '{email}' AND password='{password}';"
    return select_one_query(query)


def create_new_project(user_id: int, project_name: str, image: str = None):
    image = f"'{image}'" if image else 'null'
    query = f"INSERT INTO projects(user_id ,project_name,image) VALUES({user_id},'{project_name}', {image});"
    update_query(query)


def get_project_info(user_id: str):
    user_id = user_id.strip()
    query = f"SELECT * FROM projects WHERE user_id='{user_id}';"
    return select_all_query(query)


def update_project_name(project_id: str, new_name:str):
    project_id = project_id.strip()
    query = f"UPDATE projects SET project_name='{new_name}' WHERE project_id='{project_id}'  ;"
    update_query(query)


def update_project_image(project_id: str, new_img:str):
    project_id = project_id.strip()
    query = f"UPDATE projects SET image='{new_img}' WHERE project_id='{project_id}'  ;"
    update_query(query)


def update_project_last_update(project_id: str):
    project_id = project_id.strip()
    query = f"UPDATE projects SET last_update= (CURRENT_DATE) WHERE project_id='{project_id}'  ;"
    update_query(query)


def update_project_status(project_id: str, status:str):
    status = status.strip()
    project_id = project_id.strip()
    query = f"UPDATE projects SET status='{status}' WHERE project_id='{project_id}'  ;"
    update_query(query)


def new_doc(project_id: int, doc_url: str, doc_name:str):
    cursor = mysql.get_db().cursor()
    con = mysql.get_db()
    query = f"INSERT INTO docs(project_id, doc_url, doc_name) VALUES({project_id}, '{doc_url}', '{doc_name}');"
    update_query(query)


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
