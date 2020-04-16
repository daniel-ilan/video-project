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