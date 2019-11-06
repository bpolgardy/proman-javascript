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

        error = 'Invalid password and/or username!'
    return render_template('user_authentication/login.html', error=error)


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
    else:
        return render_template('index.html')


@app.route('/logout')
def route_logout():
    session.pop('username', None)
    session.pop('user_id', None)
    flash("You've logged out successfully")
    return redirect(session['url'])


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
