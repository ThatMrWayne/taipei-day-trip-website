import json
from flask import Blueprint
from flask import request
from flask import make_response
from database import db
from model.connection import Connection

booking = Blueprint('book',__name__,static_folder='static',static_url_path='/book')