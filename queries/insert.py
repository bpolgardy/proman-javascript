import connection


@connection.connection_handler
def new_user(cursor, user_data):
    cursor.execute(
        """
        INSERT INTO users (username, password, api_key)
        VALUES (%(username)s, %(password)s,%(api_key)s )
        """,
        user_data
    )
