import connection
from psycopg2 import sql


@connection.connection_handler
def get_api_key_for_user(cursor, username):
    cursor.execute("""
                    SELECT api_key
                    FROM users
                    WHERE username = %(username)s
                    """,
                   {'username': username})
    user_api_key = cursor.fetchone()
    return user_api_key


@connection.connection_handler
def get_user_id_by_username(cursor, username):
    cursor.execute("""
                    SELECT id
                    FROM users
                    WHERE username = %(username)s
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
                    WHERE username = %(username)s
                   """,
                   {'username': username})
    user_data = cursor.fetchone()
    if user_data:
        return user_data['password']
