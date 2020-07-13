import pyodbc
import os
import shutil


def create_conn():
    connStr = (
        r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};"
        r"DBQ=static\db\db.accdb;"
    )
    conn = pyodbc.connect(connStr)
    cursor = conn.cursor()
    return (conn, cursor)


def get_row(query: str):
    conn, cursor = create_conn()
    cursor.execute(query)
    data = len(cursor.fetchall())
    cursor.close()
    return data


def update_query(query: str):
    conn, cursor = create_conn()
    cursor.execute(query)
    conn.commit()
    cursor.close()

def select_one_query(query: str):
    conn, cursor = create_conn()
    cursor.execute(query)
    query_data = cursor.fetchone()
    cursor.close()
    return query_data


def select_many_query(query: str, some: str):
    conn, cursor = create_conn()
    cursor.execute(query)
    query_data = cursor.fetchmany(some)
    cursor.close()
    return query_data


def select_all_query(query: str):
    conn, cursor = create_conn()
    cursor.execute(query)
    query_data = cursor.fetchall()
    cursor.close()
    return query_data


def get_all_animations():
    query = f"SELECT [animation_url],[animation_name] FROM animations"
    return select_all_query(query)


def create_new_user(person_name: str, email: str, password: str, image: str = None):
    from shutil import copyfile
    image = 'placeholderCardCover.png'
    person_name = person_name.strip()
    email = email.strip()
    password = password.strip()
    query = f"INSERT INTO users ([person_name] ,[email] ,[password] ,[image]) VALUES('{person_name}','{email}','{password}','{image}');"
    update_query(query)
    get_id = get_user_id(email)[0]

    create_directory("", get_id)
    shutil.copy(f"static/images/{image}", f"static/db/users/{get_id}")
    create_new_project(get_id, "")
    project_id = get_last_project_id(get_id)[0]
    return project_id


def get_user_id(email: str):
    email = email.strip()
    query = f"SELECT user_id FROM users WHERE email= '{email}';"
    return select_one_query(query)


def check_log_in(email: str, password: str):
    email = email.strip()
    password = password.strip()
    exist_user = False
    match = False
    query = f"SELECT * FROM users WHERE email='{email}';"
    if get_row(query) == 1:
        exist_user = True
        query = f"SELECT * FROM users WHERE email='{email}' AND password='{password}';"
        if get_row(query) == 1:
            match = True
    return (exist_user, match)


def create_new_project(user_id: int, project_name: str, image: str = None):
    if image:
        image = f"'{image}'"
    else:
        image = 'placeholderCardCover.png'
    if project_name == "" or project_name == " ":
        query = f"INSERT INTO projects([user_id] ,[image]) VALUES({user_id},'{image}');"
    else:
        query = f"INSERT INTO projects([user_id],[project_name],[image]) VALUES({user_id},'{project_name}', {image});"
    update_query(query)
    get_id = get_last_project_id(user_id)[0]
    create_directory(user_id, get_id)
    path = str(get_id) + "/videos"
    create_directory(user_id, path)
    path = str(get_id) + "/docs"
    create_directory(user_id, path)
    shutil.copy(f"static/images/{image}", f"static/db/users/{user_id}/{get_id}")


def get_last_project_id(user_id: int):
    query = f"SELECT TOP 1 project_id FROM projects WHERE user_id={user_id} ORDER BY project_id DESC;"
    return select_one_query(query)


def get_project_info(user_id: str):
    if isinstance(user_id, str):
        user_id = int(user_id.strip())
    query = f"SELECT [project_id],[project_name],[status],[last_update],[image] FROM projects WHERE user_id={user_id};"
    return select_all_query(query)


def get_project_owner(project_id: str):
    project_id = int(project_id.strip())
    query = f"SELECT user_id FROM projects WHERE project_id={project_id};"
    return select_one_query(query)


def update_project_name(project_id: str, new_name: str):
    project_id = int(project_id.strip())
    query = f"UPDATE projects SET project_name='{new_name}' WHERE project_id={project_id}  ;"
    update_query(query)


def update_project_image(project_id: str, new_img: str):
    project_id = int(project_id.strip())
    query = f"UPDATE projects SET image='{new_img}' WHERE project_id={project_id}  ;"
    update_query(query)


def update_project_last_update(project_id: str):
    project_id = int(project_id.strip())
    query = f"UPDATE projects SET last_update= Date() WHERE project_id={project_id}  ;"
    update_query(query)


def update_project_status(project_id: str, status: str):
    status = status.strip()
    project_id = int(project_id.strip())
    query = f"UPDATE projects SET status='{status}' WHERE project_id={project_id}  ;"
    update_query(query)


def create_color(my_hex: str, kind: str, palette_id: str):
    my_hex = my_hex.strip()
    kind = kind.strip()
    if isinstance(palette_id, str):
        palette_id = int(palette_id)
    query = f"INSERT INTO colors ([hex],[kind],[palette_id]) VALUES('{my_hex}','{kind}', {palette_id});"
    update_query(query)


def create_palette(project_id: str, palette_name: str):
    if isinstance(project_id, str):
        project_id = int(project_id)
    query = f"INSERT INTO palettes ([palette_name]) VALUES('{palette_name}');"
    update_query(query)


def get_palette(palette_id: str):
    palette_id = int(palette_id.strip())
    query = f"SELECT * FROM palettes WHERE palette_id={palette_id};"
    return select_one_query(query)


def get_palette_id_by_project(project_id: str):
    if isinstance(project_id, str):
        project_id = int(project_id)
    query = f"SELECT [palette_id] FROM projects WHERE project_id={project_id};"
    return select_one_query(query)


def get_colors_by_palette(palette_id: str):
    if isinstance(palette_id, str):
        palette_id = int(palette_id)
    query = f"SELECT hex,kind,color_id FROM colors WHERE palette_id={palette_id};"
    return select_all_query(query)


def get_animations_by_kind(kind: str):
    kind = kind.strip()
    query = f"SELECT [animation_url],[animation_name],[animation_id] FROM animations WHERE animation_kind='{kind}';"
    return select_all_query(query)


def get_animations_by_template(template_id: str):
    template_id = int(template_id.strip())
    query = f"SELECT animation_url,animation_name,animation_kind FROM animations WHERE template_id={template_id};"
    return select_all_query(query)


def new_doc(project_id: int, doc_url: str, doc_name: str):
    query = f"INSERT INTO docs([project_id], [doc_url], [doc_name]) VALUES({project_id}, '{doc_url}', '{doc_name}');"
    update_query(query)


def create_new_video(project_id):
    if isinstance(project_id, str):
        project_id = int(project_id)
    image = 'placeholderCardCover.png'
    query = f"INSERT INTO videos([project_id]) VALUES({project_id});"
    update_query(query)
    get_id = get_last_video_id(str(project_id))[0]
    project_owner = get_project_owner(str(project_id))[0]
    path = str(project_owner) + "/" + str(project_id) + "/videos/"
    create_directory(path, get_id)
    path = path + str(get_id)
    newPath = shutil.copy("static/images/"+image, "static/db/users/" + path)
    create_directory(path, "frames")
    create_directory(path, "filmed") # meybe delete!


def get_last_video_id(project_id: str):
    project_id = int(project_id)
    query = f"SELECT TOP 1 video_id FROM videos WHERE project_id={project_id} ORDER BY video_id DESC;"
    return select_one_query(query)


def update_video_name(video_id: str, new_name: str):
    video_id = int(video_id)
    new_name = new_name.strip()
    query = f"UPDATE videos SET video_name='{new_name}' WHERE video_id={video_id};"
    print('e')
    update_query(query)


def update_video_status(video_id: str, new_status: str, last_rec=""):
    if isinstance(video_id, str):
        video_id = int(video_id)
    new_status = new_status.strip()
    if last_rec is None:
        query = f"UPDATE videos SET video_status='{new_status}' WHERE video_id={video_id};"
    else:
        query = f"UPDATE videos SET video_status='{new_status}',last_rec='{last_rec}' WHERE video_id={video_id};"

    update_query(query)


def create_new_frame(video_id: str, url: str, num_frames: int):
    if isinstance(video_id, str):
        video_id = int(video_id)
    if isinstance(num_frames, str):
        num_frames = int(num_frames)
    order = num_frames + 1
    query = f"INSERT INTO frames([video_id],[lottie_url],[frame_order]) VALUES({video_id},'{url}','{order}');"
    update_query(query)


def get_all_frames(video_id: str):
    if isinstance(video_id, str):
        video_id = int(video_id)
    query = f"SELECT [frame_id],[lottie_url],[selected_animation_id],[selected_animation_kind],[frame_text],[frame_order],[clicks] FROM frames WHERE video_id={video_id} ORDER BY frame_order ASC;"
    return select_all_query(query)


def delete_frame(frame_id: int, video_id: int):
    if isinstance(video_id, str):
        video_id = int(video_id)
    query = f"SELECT [frame_id] FROM frames WHERE frame_id >({frame_id}) AND video_id = {video_id};"
    query_update_order = f"UPDATE frames SET frame_order = (frame_order-1) WHERE frame_id IN({query});"
    update_query(query_update_order)
    query = f"DELETE FROM frames WHERE frame_id =({frame_id});"
    update_query(query)


def get_frame_by_id(id: str):
    id = int(id)
    query = f"SELECT * FROM frames WHERE frame_id={id};"
    return select_one_query(query)


def get_text_props(selected_animation_id):
    if type(selected_animation_id) is str:
        selected_animation_id = int(selected_animation_id)
    query = f"SELECT [num_chars] FROM animations WHERE animation_id={selected_animation_id};"
    return select_one_query(query)

def get_frame_kind_by_id(id: str):
    id = int(id)
    query = f"SELECT [selected_animation_kind] FROM frames WHERE frame_id={id};"
    return select_one_query(query)


def update_frame_props(frame_id: str, lottie_url: str, selected_kind: str, selected_anim: str, clicks=None, notes=None):

    if selected_kind == 'empty':
        num_clicks = 1
    elif selected_kind == 'list':
        if clicks is not None:
            num_clicks = clicks
        else:
            num_clicks = 3
    else:
        num_clicks = 2
    frame_id = int(frame_id)
    selected_anim = int(selected_anim)
    if notes is None:
        notes = ""
    query = f"UPDATE frames SET lottie_url='{lottie_url}',selected_animation_kind='{selected_kind}',selected_animation_id='{selected_anim}', frame_text= '{notes}',clicks={num_clicks} WHERE frame_id={frame_id};"
    update_query(query)


def get_animations_by_project_and_kind(project_id: str, kind: str):
    project_id = int(project_id)
    query = f"SELECT [theme_id] FROM projects WHERE project_id={project_id};"
    themed_id = int(select_one_query(query)[0])
    query = f"SELECT [animation_id] FROM a_t_relation WHERE theme_id={themed_id};"
    new_query = f"SELECT [animation_name],[animation_url],[animation_id] FROM animations WHERE animation_id IN({query}) AND animation_kind='{kind}';"
    return select_all_query(new_query)


def get_all_animation_by_kind(kind: str, project_id: int):
    if isinstance(project_id, str):
        project_id = int(project_id)
    theme_id = get_project_collections_id(project_id)
    theme_query = f"SELECT [theme_id] FROM themes WHERE generalYN=true OR theme_id= {theme_id};"
    query_animation_id = f"SELECT [animation_id] FROM a_t_relation WHERE theme_id IN( {theme_query})"
    new_query = f"SELECT [animation_name],[animation_url],[animation_id] FROM animations WHERE animation_kind ='{kind}' AND animation_id IN({query_animation_id} );"
    return select_all_query(new_query)


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


def get_all_collections():
    query = f"SELECT * FROM themes WHERE generalYN=true;"
    return select_all_query(query)


def get_collection(themed_id):
    if isinstance(themed_id, str):
        themed_id = int(themed_id)
    query = f"SELECT [animation_id] FROM a_t_relation WHERE theme_id={themed_id};"
    new_query = f"SELECT [animation_id],[animation_name],[animation_url] FROM animations WHERE NOT animation_kind ='empty' AND animation_id IN({query} );"
    return select_all_query(new_query)


def get_project_collections_id(project_id: str):
    if isinstance(project_id, str):
        project_id = int(project_id)
    theme_query = f"SELECT [theme_id] FROM projects WHERE project_id={project_id};"
    return select_one_query(theme_query)[0]


def get_collections_by_id(id):
    if isinstance(id, str):
        id = int(id)
    query = f"SELECT * FROM themes WHERE theme_id={id};"
    return select_one_query(query)


def update_project_collection(new_theme: str, project_id: str):
    if isinstance(new_theme, str):
        new_theme = int(new_theme)
    if isinstance(project_id, str):
        project_id = int(project_id)
    query = f"UPDATE projects SET theme_id='{new_theme}' WHERE project_id={project_id};"
    update_query(query)


def get_all_palettes_id():
    query = f"SELECT [palette_id] FROM palettes WHERE generalYN=true;"
    return select_all_query(query)


def check_palette_generalYN(id):
    if isinstance(id, str):
        id = int(id)
    query = f"SELECT [generalYN] FROM palettes WHERE palette_id={id};"
    return select_one_query(query)


def update_project_palette(new_palette: str, project_id: str):
    new_palette = int(new_palette)
    project_id = int(project_id)
    query = f"UPDATE projects SET palette_id='{new_palette}' WHERE project_id={project_id};"
    update_query(query)


def update_color_hex(color_id: str, new_color: str):
    color_id = int(color_id)
    query = f"UPDATE colors SET hex='{new_color}' WHERE color_id={color_id};"
    update_query(query)


def get_last_palette_id(name: str):
    query = f"SELECT TOP 1 palette_id FROM palettes WHERE palette_name='{name}' ORDER BY palette_id DESC;"
    return select_one_query(query)


def delete_palette(palette_id: int):
    query = f"DELETE FROM colors WHERE palette_id =({palette_id});"
    update_query(query)
    query = f"DELETE FROM palettes WHERE palette_id =({palette_id});"
    update_query(query)


def update_frame_order(frame_id: str, order: str):
    frame_id = int(frame_id)
    order = int(order)
    query = f"UPDATE frames SET frame_order='{order}' WHERE frame_id={frame_id};"
    update_query(query)


def get_videos_by_project(project_id):
    if isinstance(project_id, str):
        project_id = int(project_id)
    query = f"SELECT [video_id],[video_name],[image],[video_status] FROM videos WHERE project_id={project_id};"
    return select_all_query(query)


def delete_video(video_id: int):
    if isinstance(video_id, str):
        video_id = int(video_id)
    query = f"DELETE FROM videos WHERE video_id =({video_id});"
    update_query(query)


def get_video_name(video_id: int):
    if isinstance(video_id, str):
        video_id = int(video_id)
    query = f"SELECT [video_name] FROM videos WHERE video_id={video_id};"
    return select_one_query(query)


def get_video_image(video_id: int):
    if isinstance(video_id, str):
        video_id = int(video_id)
    query = f"SELECT [image] FROM videos WHERE video_id={video_id};"
    return select_one_query(query)


def update_video_image(video_id: str, new_image: str):
    if isinstance(video_id, str):
        video_id = int(video_id)
    new_name = new_image.strip()
    query = f"UPDATE videos SET image='{new_image}' WHERE video_id={video_id};"
    update_query(query)


def check_change_on_collectionYN(project_id):
    if isinstance(project_id, str):
        project_id = int(project_id)
    query = f"SELECT [change_in_collection] FROM projects WHERE project_id={project_id};"
    return select_one_query(query)


def update_change_on_collectionYN(project_id:int, new_state: bool):
    if isinstance(project_id, str):
        project_id = int(project_id)
    if isinstance(new_state, str):
        new_state = bool(new_state)
    query = f"UPDATE projects SET change_in_collection={new_state}   WHERE project_id={project_id};"
    update_query(query)


def get_project_theme(project_id: int):
    if isinstance(project_id, str):
        project_id = int(project_id)
    query = f"SELECT [theme_id] FROM projects WHERE project_id={project_id};"
    return int(select_one_query(query)[0])


def update_initial_theme(project_id:int, initial_theme: int):
    if isinstance(project_id, str):
        project_id = int(project_id)
    if isinstance(initial_theme, str):
        initial_theme = int(initial_theme)
    query = f"UPDATE projects SET initial_theme={initial_theme} WHERE project_id={project_id};"
    update_query(query)


def get_project_initial_theme(project_id: int):
    if isinstance(project_id, str):
        project_id = int(project_id)
    query = f"SELECT [initial_theme] FROM projects WHERE project_id={project_id};"
    return int(select_one_query(query)[0])


def get_project_name(project_id: int):
    if isinstance(project_id, str):
        project_id = int(project_id)
    query = f"SELECT [project_name] FROM projects WHERE project_id={project_id};"
    return select_one_query(query)


def create_new_theme(project_id: str):
    # create new theme
    if isinstance(project_id, str):
        project_id = int(project_id)
    project_name = get_project_name(project_id)[0]
    query = f"INSERT INTO themes ([theme_name]) VALUES('{project_id}');"
    update_query(query)

    # update new theme name
    new_id = get_last_theme_id(project_id)[0]
    if isinstance(new_id, str):
        new_id = int(new_id)
    query = f"UPDATE themes SET theme_name='{project_name}' WHERE theme_id={new_id};"
    update_query(query)

    # update project theme
    update_project_collection(new_id,project_id)

    return new_id


def get_last_theme_id(name: str):
    if isinstance(name, int):
        name = str(name)
    query = f"SELECT TOP 1 theme_id FROM themes WHERE theme_name='{name}' ORDER BY theme_id DESC;"
    return select_one_query(query)


def get_animations_by_theme(theme_id):
    if isinstance(theme_id, str):
        theme_id = int(theme_id)
    query = f"SELECT [animation_id] FROM a_t_relation WHERE theme_id={theme_id};"
    new_query = f"SELECT [animation_kind],[animation_url],[animation_id],[num_chars] FROM animations WHERE animation_id IN({query});"
    return select_all_query(new_query)


def create_new_anim(animation_name,animation_kind,animation_url, theme_id, num_chars):
    # create new anim
    query = f"INSERT INTO animations ([animation_name],[animation_kind],[animation_url],[num_chars]) VALUES('{animation_name}','{animation_kind}','{animation_url}','{num_chars}');"
    update_query(query)

    # get the animation id #
    query = f"SELECT TOP 1 animation_id FROM animations WHERE animation_name='{animation_name}' AND  animation_url='{animation_url}'ORDER BY animation_id DESC;"
    animation_id = int(select_one_query(query)[0])

    # create connection in a_t_relation
    create_new_a_t_relation(animation_id, theme_id)


def create_new_a_t_relation(animation_id: int, theme_id: int):
    # create connection in a_t_relation
    if isinstance(theme_id, str):
        theme_id = int(theme_id)
    if isinstance(animation_id, str):
        animation_id = int(animation_id)
    query = f"INSERT INTO a_t_relation ([theme_id],[animation_id]) VALUES({theme_id},{animation_id});"
    update_query(query)


def check_theme_generalYN(id):
    if isinstance(id, str):
        id = int(id)
    query = f"SELECT [generalYN] FROM themes WHERE theme_id={id};"
    return select_one_query(query)


def delete_theme(theme_id: int):
    if isinstance(theme_id, str):
        theme_id = int(theme_id)
    query = f"DELETE FROM themes WHERE theme_id =({theme_id});"
    update_query(query)


def delete_animation(animation_id: int):
    if isinstance(animation_id, str):
        animation_id = int(animation_id)
    query = f"DELETE FROM animations WHERE animation_id =({animation_id});"
    update_query(query)


def get_user_img_name(user_id: str):
    if isinstance(user_id, str):
        user_id = int(user_id)
    query = f"SELECT [person_name],[image] FROM users WHERE user_id= {user_id};"
    return select_one_query(query)
