import json
from flask import Blueprint
from flask import request
from flask import make_response
from database import db
from model.connection import Connection

fetch = Blueprint('fetch',__name__,static_folder='static',static_url_path='/fetch')

def get_attr_by_page_keyword(request):
    connection = db.get_sight_cnx() 
    if isinstance(connection,Connection): 
        page = request.args.get('page')
        keyword = request.args.get('keyword')
        if not page or page.isdigit():              
            data = connection.get_attrac_page(page,keyword)
            if data == "error":
                response_msg={
                        "error":True,
                        "message":"Data base failed."}
                res=make_response(response_msg,500)
            else:    
                response_msg = json.dumps(data,ensure_ascii=False)
                res=make_response(response_msg,200)
        elif not page.isdigit():
            response_msg={
                        "nextPage":None,
                        "data":[]}
            res=make_response(response_msg,200)                   
    elif connection == "error":  
        response_msg={
                    "error":True,
                    "message":"Data base failed."}
        res=make_response(response_msg,500)
    res.headers['Content-Type']='application/json'    
    return res
def get_attr_by_id(attractionID):
    if not attractionID.isdigit():
        response_msg = {
            "error": True,
            "message": "景點編號不正確"}
        res = make_response(response_msg, 400)
    else:
        connection = db.get_sight_cnx() 
        if isinstance(connection,Connection): 
            data = connection.get_attrac_by_id(attractionID)
            if data == "error":
                response_msg = {
                    "error": True,
                    "message": "Data base failed."}
                res = make_response(response_msg, 500)
            else:
                response_msg = json.dumps(data,ensure_ascii=False)
                res=make_response(response_msg,200) 
        elif connection == "error": 
            response_msg = {
                    "error": True,
                    "message": "Data base failed."}
            res = make_response(response_msg, 500)        
    res.headers['Content-Type']='application/json'
    return res       
    




@fetch.route('/api/attractions',methods=['GET'])
def get_attraction():
    attraction_result = get_attr_by_page_keyword(request)
    return attraction_result


@fetch.route('/api/attraction/<attractionID>',methods=["GET"])
def get_attraction_id(attractionID):
    attraction_result = get_attr_by_id(attractionID)
    return attraction_result   
        


    




