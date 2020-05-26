import pyodbc
import os



def create_conn():
    connStr = (
        r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};"
        r"DBQ=static\db\db.accdb;"
    )
    conn = pyodbc.connect(connStr)
    cursor = conn.cursor()
    return (conn, cursor)


def get_row(query:str):
    conn, cursor= create_conn()
    cursor.execute(query)
    data = len(cursor.fetchall())
    cursor.close()
    return data


def update_query(query:str):
    conn, cursor= create_conn()
    cursor.execute(query)
    conn.commit()
    cursor.close()


def select_one_query(query:str):
    conn, cursor= create_conn()
    cursor.execute(query)
    query_data = cursor.fetchone()
    cursor.close()
    return query_data


def select_many_query(query:str, some:str):
    conn, cursor= create_conn()
    cursor.execute(query)
    query_data = cursor.fetchmany(some)
    cursor.close()
    return query_data


def select_all_query(query:str):
    conn, cursor= create_conn()
    cursor.execute(query)
    query_data = cursor.fetchall()
    cursor.close()
    return query_data


def get_all_animations():
    query = f"SELECT [animation_url],[animation_name] FROM animations"
    return select_all_query(query)


def create_new_user(person_name: str, email: str, password: str, image: str = None):
    image = f"'{image}'" if image else 'null'
    person_name = person_name.strip()
    email = email.strip()
    password = password.strip()
    query = f"INSERT INTO users ([person_name] ,[email] ,[password] ,[image]) VALUES('{person_name}','{email}','{password}',{image});"
    update_query(query)
    get_id = get_user_id(email)[0]
    create_directory("", get_id)


def get_user_id(email: str):
    email = email.strip()
    query = f"SELECT user_id FROM users WHERE email= '{email}';"
    return select_one_query(query)


def check_log_in(email: str, password: str):
    email = email.strip()
    password = password.strip()
    exist_user = False
    match = False
    query = f"SELECT COUNT (*) FROM users WHERE email= '{email}';"
    if get_row(query) == 1:
        exist_user = True
        query = f"SELECT * FROM users WHERE email= '{email}' AND password='{password}';"
        if get_row(query) == 1:
            match = True
    return (exist_user, match)


def create_new_project(user_id: int, project_name: str, image: str = None):
    image = f"'{image}'" if image else 'null'
    if project_name == "" or project_name == " ":
        query = f"INSERT INTO projects([user_id] ,[image]) VALUES({user_id}, {image});"
    else:
        query = f"INSERT INTO projects([user_id] ,[project_name],[image]) VALUES({user_id},'{project_name}', {image});"
    update_query(query)
    get_id = get_last_project_id(user_id)[0]
    create_directory(user_id, get_id)
    path = str(get_id) + "/videos"
    create_directory(user_id, path)
    path = str(get_id) + "/docs"
    create_directory(user_id, path)


def get_last_project_id(user_id: int):
    query = f"SELECT TOP 1 project_id FROM projects WHERE user_id={user_id} ORDER BY project_id DESC;"
    return select_one_query(query)


def get_project_info(user_id: str):
    user_id = int(user_id.strip())
    query = f"SELECT * FROM projects WHERE user_id={user_id};"
    return select_all_query(query)


def get_project_owner(project_id: str):
    project_id = int(project_id.strip())
    query = f"SELECT user_id FROM projects WHERE project_id={project_id};"
    return select_one_query(query)


def update_project_name(project_id: str, new_name:str):
    project_id = int(project_id.strip())
    query = f"UPDATE projects SET project_name='{new_name}' WHERE project_id={project_id}  ;"
    update_query(query)


def update_project_image(project_id: str, new_img:str):
    project_id = int(project_id.strip())
    query = f"UPDATE projects SET image='{new_img}' WHERE project_id={project_id}  ;"
    update_query(query)


def update_project_last_update(project_id: str):
    project_id = int(project_id.strip())
    query = f"UPDATE projects SET last_update= Date() WHERE project_id={project_id}  ;"
    update_query(query)


def update_project_status(project_id: str, status:str):
    status = status.strip()
    project_id = int(project_id.strip())
    query = f"UPDATE projects SET status='{status}' WHERE project_id={project_id}  ;"
    update_query(query)


def create_color(my_hex: str, kind: str, palette_id: str):
    my_hex = my_hex.strip()
    kind = kind.strip()
    palette_id = int(palette_id.strip())
    query = f"INSERT INTO colors ([hex],[kind],[palette_id]) VALUES('{my_hex}','{kind}', {palette_id});"
    update_query(query)


def create_palette(project_id: str, palette_name: str):
    project_id = int(project_id.strip())
    query = f"INSERT INTO palettes ([project_id],[palette_name]) VALUES({project_id},'{palette_name}');"
    update_query(query)


def get_palette(palette_id: str):
    palette_id = int(palette_id.strip())
    query = f"SELECT * FROM palettes WHERE palette_id={palette_id};"
    return select_one_query(query)


def get_colors_by_palette(palette_id: str):
    palette_id = int(palette_id.strip())
    query = f"SELECT hex,kind FROM colors WHERE palette_id={palette_id};"
    return select_all_query(query)


def get_animations_by_kind(kind: str):
    kind = kind.strip()
    query = f"SELECT [animation_url],[animation_name],[animation_id] FROM animations WHERE animation_kind='{kind}';"
    return select_all_query(query)


def get_animations_by_template(template_id: str):
    template_id = int(template_id.strip())
    query = f"SELECT animation_url,animation_name,animation_kind FROM animations WHERE template_id={template_id};"
    return select_all_query(query)


def new_doc(project_id: int, doc_url: str, doc_name:str):
    query = f"INSERT INTO docs([project_id], [doc_url], [doc_name]) VALUES({project_id}, '{doc_url}', '{doc_name}');"
    update_query(query)


def create_new_video(project_id: int, video_name: str, image: str = None):
    image = f"'{image}'" if image else 'null'
    if video_name == "" or video_name == " ":
        query = f"INSERT INTO videos([project_id],[image]) VALUES({project_id},{image});"
    else:
        query = f"INSERT INTO videos([project_id] ,[video_name],[image]) VALUES({project_id},'{video_name}', {image});"
    update_query(query)
    get_id = get_last_video_id(str(project_id))[0]
    project_owner = get_project_owner(str(project_id))[0]
    path = str(project_owner) + "/" + str(project_id) + "/videos/"
    create_directory(path, get_id)
    path = path + "/" + str(get_id)
    create_directory(path, "frames")


def get_last_video_id(project_id: str):
    project_id = int(project_id)
    query = f"SELECT TOP 1 video_id FROM videos WHERE project_id={project_id} ORDER BY video_id DESC;"
    return select_one_query(query)


def update_video_name(video_id: str, new_name: str):
    video_id = int(video_id)
    new_name = new_name.strip()
    query = f"UPDATE videos SET video_name='{new_name}' WHERE video_id={video_id};"
    update_query(query)


def update_video_status(video_id: str, new_status: str):
    video_id = int(video_id)
    new_status = new_status.strip()
    query = f"UPDATE videos SET video_status='{new_status}' WHERE video_id={video_id};"
    update_query(query)


def create_new_frame(video_id: str, url: str):
    video_id = int(video_id)

    query = f"INSERT INTO frames([video_id],[lottie_url]) VALUES({video_id},'{url}');"
    update_query(query)


def get_all_frames(video_id: str):
    video_id = int(video_id)
    query = f"SELECT [frame_id],[lottie_url],[selected_animation_id],[selected_animation_kind] FROM frames WHERE video_id={video_id} ORDER BY frame_id ASC;"
    return select_all_query(query)


def delete_frame(frame_id: int):
    query = f"DELETE FROM frames WHERE frame_id =({frame_id});"
    update_query(query)


def get_frame_by_id(id: str):
    id = int(id)
    query = f"SELECT * FROM frames WHERE frame_id={id};"
    return select_one_query(query)


def get_frame_kind_by_id(id: str):
    id = int(id)
    query = f"SELECT [selected_animation_kind] FROM frames WHERE frame_id={id};"
    return select_one_query(query)


def update_frame_props(frame_id: str, lottie_url: str, selected_kind: str, selected_anim: str):
    frame_id = int(frame_id)
    selected_anim = int(selected_anim)
    query = f"UPDATE frames SET lottie_url='{lottie_url}',selected_animation_kind='{selected_kind}',selected_animation_id='{selected_anim}' WHERE frame_id={frame_id};"
    update_query(query)


def get_animations_by_project_and_kind(project_id: str, kind: str):
    project_id = int(project_id)
    query = f"SELECT [theme_id] FROM projects WHERE project_id={project_id};"
    themed_id = int(select_one_query(query)[0])
    query = f"SELECT [animation_id] FROM a_t_relation WHERE theme_id={themed_id};"
    new_query = f"SELECT [animation_name],[animation_url],[animation_id] FROM animations WHERE animation_id IN({query}) AND animation_kind='{kind}';"
    return select_all_query(new_query)



def get_all_animation_by_kind( kind: str):
    query = f"SELECT [animation_name],[animation_url],[animation_id] FROM animations WHERE animation_kind='{kind}';"
    return select_all_query(query)


def get_animations_url_by_id(id: str):
    id = int(id)
    query = f"SELECT [animation_url] FROM animations WHERE animation_id={id};"
    return select_one_query(query)


def get_genral_anim_props_by_id(id: str):
    id = int(id)
    query = f"SELECT [animation_name], [animation_url], [animation_id] FROM animations WHERE animation_id={id};"
    return select_one_query(query)


def create_directory(my_path: str, name: str):
    name = str(name)
    my_path = str(my_path)
    if my_path != "":
        path = os.path.join(os.getcwd(), "static/db/users", my_path, name)
    else:
        path = os.path.join("static/db/users/", name)

    if not os.path.exists(path):
        os.mkdir(path)
