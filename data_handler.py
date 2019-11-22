import persistence
import connection
from queries import select, insert, update
import util


def get_api_key(username):
    logged_in_user_api_key = select.get_api_key_for_user(username)
    return logged_in_user_api_key


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    statuses = persistence.get_statuses()
    return next((status['title'] for status in statuses if status['id'] == str(status_id)), 'Unknown')


def get_boards(api_key, id=None):
    """
    Gather all boards
    :return:
    """
    boards_query = "SELECT * FROM boards "
    if api_key:
        boards_query += """
            WHERE 
            (SELECT users.api_key FROM users WHERE users.id = boards.user_id)
            ='""" + util.escape_single_quotes(api_key) + "'"
    if id and api_key:
        boards_query += "AND boards.id = " + util.escape_single_quotes(id)
    elif id:
        boards_query += "WHERE boards.id = " + util.escape_single_quotes(id)
    return execute_query(boards_query)


def get_cards_for_board(board_id):
    persistence.clear_cache()
    all_cards = persistence.get_cards()
    matching_cards = []
    for card in all_cards:
        if card['board_id'] == str(board_id):
            card['status_id'] = get_card_status(card['status_id'])  # Set textual status for the card
            matching_cards.append(card)
    return matching_cards


def get_user_id_for(username):
    user_id = select.get_user_id_by_username(username)
    return user_id


def get_hashed_password_for(username):
    hashed_password = select.hashed_password_for(username)
    if hashed_password:
        return hashed_password


def is_username_unique(username):
    user_id = select.get_user_id_by_username(username)
    if not user_id:
        return True


def insert_user(user_data_orig):
    user_data = dict(user_data_orig)
    user_data['api_key'] = util.get_hashed_api_key(user_data['username'] + user_data['password'])
    user_data['password'] = util.get_hashed_password(user_data['password'])
    insert.new_user(user_data)


def validate_user_credentials(username, password):
    hashed_password = get_hashed_password_for(username)
    if hashed_password:
        password_valid = util.is_password_valid(password, hashed_password)
        if password_valid:
            return True
    return False


def record_user(user_data):
    username_is_unique = is_username_unique(user_data['username'])
    if username_is_unique:
        insert_user(user_data)
        return True


def update_board_title(board_id, new_title):
    new_title = new_title['title']
    update.update_board_title(board_id, new_title)


def get_data_by_id(table_name, row_id):
    row_data = select.get_data_by_id(table_name, row_id)
    return row_data


def save_new_board(board_data):
    query = """
            INSERT INTO boards (id, title, user_id)
            VALUES (DEFAULT, %(title)s, %(user_id)s)
            RETURNING id, title, user_id;
            """
    params = board_data

    return execute_query(query, params=params)


def save_new_card(card_data):
    query = '''
            INSERT INTO cards (id, board_id, title, status_id, "order", user_id, archive)
            VALUES (DEFAULT, %(board_id)s, %(title)s, %(status_id)s, %(order)s, %(user_id)s, DEFAULT)
            RETURNING id, board_id, title, status_id, "order", user_id, archive;
            '''
    params = card_data
    last_order = get_last_order_by_board_and_column(params['board_id'], params['status_id'])
    params['order'] = last_order + 1 if last_order else 1

    return execute_query(query, params=params)


@connection.connection_handler
def execute_query(cursor, query, params=None):
    cursor.execute(query, params)

    if query.strip().startswith('SELECT') \
            or (query.strip().startswith('INSERT') and 'RETURNING' in query)\
            or (query.strip().startswith('UPDATE') and 'RETURNING' in query):
        return cursor.fetchall()


def delete_board(id):
    query = """
    DELETE from boards WHERE id = {id}
    """.format(id=util.escape_single_quotes(id))
    execute_query(query)


def get_cards_by_board_id(board_id, archive=False):
    query = """
            SELECT * FROM cards
            WHERE board_id=%(id)s
                AND archive=%(archive)s;
            """
    params = {'id': board_id,
              'archive': archive}

    return execute_query(query, params=params)


def get_last_order_by_board_and_column(board_id, status_id):
    query = """
            SELECT MAX("order") AS last_order
            FROM cards
            WHERE board_id=%(board_id)s AND status_id=%(status_id)s
            """
    params = {'board_id': board_id,
              'status_id': status_id}

    result = execute_query(query, params=params)[0]
    last_order = result['last_order'] if result else 0

    return last_order


def update_card_title(card_id, title):
    query = """
            UPDATE cards
            SET title = %(title)s
            WHERE id = %(card_id)s
            RETURNING title;
            """

    params = {'card_id': card_id,
              'title': title}

    return execute_query(query, params=params)[0]


def update_card_archive_status(card_id, archive, status_id=None):
    if status_id:
        query = """
                UPDATE cards
                SET archive = %(archive)s, "order" = %(order)s
                WHERE id = %(card_id)s
                RETURNING id, board_id, title, status_id;
                """
        board_id = get_board_id_by_card_id(card_id)

        params = {'card_id': card_id,
                  'archive': archive,
                  'order': get_last_order_by_board_and_column(board_id, status_id) + 1}

    else:
        query = """
                UPDATE cards
                SET archive = %(archive)s
                WHERE id = %(card_id)s
                RETURNING id, board_id, title, status_id;
                """
        params = {'card_id': card_id,
                  'archive': archive}

    return execute_query(query, params=params)[0]


def get_board_id_by_card_id(card_id):

    query = '''
            SELECT board_id
            FROM cards
            WHERE id = %(card_id)s;
            '''
    params = {'card_id': card_id}

    return execute_query(query, params=params)[0]['board_id']


def update_cards(card_data_for_update):
    for counter in range(len(card_data_for_update['order'])):
        card_order = counter + 1
        card_id = card_data_for_update['order'][counter]
        update.update_card_data_for_column(int(card_data_for_update['columnId']),
                                           card_id,
                                           card_order)


def update_drag_starting_point_column(card_id):
    column_of_card_id = select.get_column_of_card_id(card_id)
    card_list_for_column = select.get_card_list_for_column(column_of_card_id)

    if card_list_for_column:
        for card_order, card in enumerate(card_list_for_column):
            update.update_card_order(card['id'], card_order)

    return column_of_card_id
