import connection
from psycopg2 import sql


@connection.connection_handler
def get_data_by_id(cursor, table_name, row_id):
    cursor.execute(
        sql.SQL("""
                    SELECT *
                    FROM {table_name}
                    WHERE id = {row_id}
                    """,)
        .format(table_name=sql.Identifier(table_name),
                row_id=sql.SQL(row_id))
                )
    data_by_id = cursor.fetchone()
    return data_by_id


@connection.connection_handler
def get_api_key_for_user(cursor, username):
    cursor.execute("""
                    SELECT api_key
                    FROM users
                    WHERE name = %(username)s
                    """,
                   {'username': username})
    user_api_key = cursor.fetchone()
    return user_api_key["api_key"]


@connection.connection_handler
def get_user_id_by_username(cursor, username):
    cursor.execute("""
                    SELECT id
                    FROM users
                    WHERE name = %(username)s
                   """,
                   {'username': username})
    user_data = cursor.fetchone()
    if user_data:
        return user_data['id']


@connection.connection_handler
def latest_id(cursor, table):
    cursor.execute(sql.SQL("SELECT id FROM {} ORDER BY id DESC LIMIT 1;").format(
        sql.Identifier(table)
    ))
    entry_data = cursor.fetchone()
    return entry_data['id']


@connection.connection_handler
def hashed_password_for(cursor, username):
    cursor.execute("""
                    SELECT password
                    FROM users
                    WHERE name = %(username)s
                   """,
                   {'username': username})
    user_data = cursor.fetchone()
    if user_data:
        return user_data['password']
