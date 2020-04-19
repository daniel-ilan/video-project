import pyodbc


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



def create_new_user(person_name: str, person_last_name: str, email: str, password: str, image: str = None):
    image = f"'{image}'" if image else 'null'
    person_name = email.strip()
    person_last_name = password.strip()
    email = email.strip()
    password = password.strip()
    query = f"INSERT INTO users ([person_name] ,[person_last_name],[email] ,[password] ,[image]) VALUES('{person_name}','{person_last_name}','{email}','{password}',{image});"
    update_query(query)

def get_user(email: str, password: str):
    email = email.strip()
    password = password.strip()
    exsistUser = False
    match = False
    query = f"SELECT COUNT (*) FROM users WHERE email= '{email}';"
    if get_row(query) == 1:
        exsistUser = True
        query = f"SELECT * FROM users WHERE email= '{email}' AND password='{password}';"
        if get_row(query) == 1:
            match = True
    return (exsistUser, match)


def create_new_project(user_id: int, project_name: str, image: str = None):
    image = f"'{image}'" if image else 'null'
    query = f"INSERT INTO projects([user_id] ,[project_name],[image]) VALUES({user_id},'{project_name}', {image});"
    update_query(query)


def get_project_info(user_id: str):
    user_id = int(user_id.strip())
    query = f"SELECT * FROM projects WHERE user_id={user_id};"
    return select_all_query(query)


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


def create_color(hex:str, kind: str, palte_id: str):
    hex = hex.strip()
    kind = kind.strip()
    palte_id = int(palte_id.strip())
    query = f"INSERT INTO colors ([hex],[kind],[palte_id]) VALUES('{hex}','{kind}', {palte_id});"
    update_query(query)


def create_palte(project_id: str, palte_name: str):
    project_id = int(project_id.strip())
    query = f"INSERT INTO paltes ([project_id],[palte_name]) VALUES({project_id},'{palte_name}');"
    update_query(query)


def get_palte(palte_id: str):
    palte_id = int(palte_id.strip())
    query = f"SELECT * FROM paltes WHERE palte_id={palte_id};"
    return select_one_query(query)


def get_colors_by_plate(palte_id: str):
    palte_id = int(palte_id.strip())
    query = f"SELECT hex,kind FROM colors WHERE palte_id={palte_id};"
    return select_all_query(query)


def get_animations_by_kind(kind: str):
    kind = kind.strip()
    query = f"SELECT [animation_url],[animation_name] FROM animations WHERE animation_kind='{kind}';"
    return select_all_query(query)


def get_animations_by_template(template_id: str):
    template_id = int(template_id.strip())
    query = f"SELECT animation_url,animation_name,animation_kind FROM animations WHERE template_id={template_id};"
    return select_all_query(query)


def new_doc(project_id: int, doc_url: str, doc_name:str):
    query = f"INSERT INTO docs([project_id], [doc_url], [doc_name]) VALUES({project_id}, '{doc_url}', '{doc_name}');"
    update_query(query)
