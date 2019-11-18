import json

from util import json_response
from flask import \
    Flask, \
    render_template, \
    request, \
    redirect, \
    url_for, \
    session, \
    flash

import data_handler

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    session['url'] = url_for('index')
    return render_template('index.html')


@app.route("/get-boards")
@json_response
def get_boards():
    """
    All the boards
    """
    api_key = request.args.get("api_key")
    return data_handler.get_boards(api_key)


@app.route("/get-boards/<id>")
@json_response
def get_board(id):
    """
    Single board by id
    """
    api_key = request.args.get("api_key")
    return data_handler.get_boards(api_key, id)


@app.route("/get-cards/<int:board_id>")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return data_handler.get_cards_for_board(board_id)


@app.route('/login', methods=['GET', 'POST'])
def route_login():
    error = None
    if request.method == 'POST':
        user_credentials = request.form.to_dict()
        if log_in_user(user_credentials):
            flash("Login successful")
            return redirect(session['url'])

        error = 'Invalid password and/or username!'
    return render_template('index.html', error=error)


@app.route('/update-board/<boardid>', methods=['GET', 'POST'])
@json_response
def update(boardid):
    table_name = 'boards'

    new_board_title = request.get_json(force=True)
    data_handler.update_board_title(boardid, new_board_title)
    get_data_by_id = data_handler.get_data_by_id(table_name, boardid)
    return get_data_by_id


def record_user(user_data):
    username_is_unique = data_handler.is_username_unique(user_data['username'])
    if username_is_unique:
        data_handler.insert_user(user_data)
        return True


def log_in_user(user_credentials):
    user_credentials_valid = data_handler.validate_user_credentials(user_credentials['username'],
                                                                    user_credentials['password'])
    if user_credentials_valid:
        session['username'] = user_credentials['username']
        session['user_id'] = data_handler.get_user_id_for(user_credentials['username'])
        session['api_key'] = data_handler.get_api_key(session['username'])
        return True
    else:
        return False


@app.route('/register', methods=['GET', 'POST'])
def route_register():
    if request.method == "POST":
        user_data = request.form.to_dict()
        if record_user(user_data):
            log_in_user(user_data)
            flash("Login successful")
            return redirect('/')
    return render_template('index.html')


@app.route("/api_key")
def send_api_key():
    if session:
        return str(session["api_key"])
    return "Authentication required"


@app.route("/delete-board/<id>", methods=["POST", "GET"])
@json_response
def delete_board(id):
    if session["username"]:
        data_handler.delete_board(id)
    return request.get_json(force=True)


@app.route('/logout')
def route_logout():
    session.pop('username', None)
    session.pop('user_id', None)
    flash("You've logged out successfully")
    return redirect(session['url'])


@app.route('/create-board', methods=['POST'])
@json_response
def create_board():
    if request.method == 'POST' and session["username"]:
        board_data = request.get_json(force=True)
        board_data['user_id'] = session['user_id']
        return data_handler.save_new_board(board_data)[0]
    else:
        return "Authentication required"


@app.route('/create-card', methods=['POST'])
@json_response
def create_card():
    if request.method == 'POST':
        card_data = request.get_json(force=True)
        card_data['user_id'] = session['user_id']
        return data_handler.save_new_card(card_data)[0]


@app.route('/boards/<int:board_id>/cards')
@json_response
def get_cards(board_id):
    return data_handler.get_cards_by_board_id(board_id)


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
