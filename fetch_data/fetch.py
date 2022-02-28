import json
from flask import Blueprint
from flask import request
from flask import make_response
from database import db

fetch = Blueprint('fetch',__name__,static_folder='static',static_url_path='/fetch',template_folder='templates')


@fetch.route('/api/attractions',methods=['GET'])
def get_attarction():
    page = request.args.get('page')
    keyword = request.args.get('keyword')
    if not page or not page.isdigit():
        response_msg={
                      "error":True,
                      "message":"Ethier query string 'page' is missed or invalid input is passed."}
        res=make_response(response_msg,500)
    elif page.isdigit():
        data = db.get_attrac_page(page,keyword)
        if type(data) is str:
            response_msg={
                      "error":True,
                      "message":"Data base failed."}
            res=make_response(response_msg,500)
        else:    
            response_msg = json.dumps(data,ensure_ascii=False)
            res=make_response(response_msg,200)              
    res.headers['Content-Type']='application/json'
    return res   
    




