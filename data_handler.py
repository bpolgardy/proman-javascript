import persistence
import connection
from queries import select, insert
import util


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    statuses = persistence.get_statuses()
    return next((status['title'] for status in statuses if status['id'] == str(status_id)), 'Unknown')


def get_boards():
    """
    Gather all boards
    :return:
    """
    return persistence.get_boards(force=True)


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


@connection.connection_handler
def execute_query(cursor, query, params=None):
    cursor.execute(query, params)

    if query.strip().startswith('SELECT'):
        return cursor.fetchall()
