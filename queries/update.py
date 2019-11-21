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


@connection.connection_handler
def update_card_data_for_column(cursor, column_id, card_id, card_order):
    cursor.execute("""
                    UPDATE cards
                    SET status_id = %(column_id)s, "order" = %(card_order)s
                    WHERE id = %(card_id)s;
                    """,
                   {'column_id': column_id, 'card_id': card_id, 'card_order': card_order})


@connection.connection_handler
def update_card_order(cursor, card_id, updated_order):
    cursor.execute("""
                    UPDATE cards
                    SET "order" = %(updated_order)s
                    """, {'updated_order': updated_order})
