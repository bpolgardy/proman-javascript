import persistence
import connection
from queries import select, insert
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
            INSERT INTO cards (id, board_id, title, status_id, "order", user_id)
            VALUES (DEFAULT, %(board_id)s, %(title)s, %(status_id)s, %(order)s, %(user_id)s)
            RETURNING id, board_id, title, status_id, "order", user_id;
            '''
    params = card_data

    return execute_query(query, params=params)


@connection.connection_handler
def execute_query(cursor, query, params=None):
    cursor.execute(query, params)

    if query.strip().startswith('SELECT') \
            or (query.strip().startswith('INSERT') and 'RETURNING' in query):
        return cursor.fetchall()

