import connection
from psycopg2 import sql


@connection.connection_handler
def update_board_title(cursor, board_id, board_title):
    cursor.execute(
        """
        UPDATE boards
        SET title = %(board_title)s
        WHERE id = %(board_id)s;
        """,
        {'board_id': board_id,
         'board_title': board_title}
    )
