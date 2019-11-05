from functools import wraps
from flask import jsonify
from password import hash_password, verify_password


def json_response(func):
    """
    Converts the returned dictionary into a JSON response
    :param func:
    :return:
    """
    @wraps(func)
    def decorated_function(*args, **kwargs):
        return jsonify(func(*args, **kwargs))

    return decorated_function


def get_hashed_api_key(api_key):
    return hash_password(api_key)


def get_hashed_password(plain_text_password):
    return hash_password(plain_text_password)


def is_password_valid(plain_text_password, hashed_password):
    return verify_password(plain_text_password, hashed_password)
