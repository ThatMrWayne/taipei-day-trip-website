import json
from flask import Blueprint
from flask import request
from flask import make_response
from database import db
from model.connection import Connection

fetch = Blueprint('fetch',__name__,static_folder='static',static_url_path='/fetch',template_folder='templates')

def get_attr_by_page_keyword(request):
    connection = db.get_sight_cnx() #取得景點相關操作的自定義connection物件
    if isinstance(connection,Connection): #如果有順利取得連線
        page = request.args.get('page')
        keyword = request.args.get('keyword')
        #如果沒有給page或是給的page是數字形式的話就可以拿資料
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
        #如果page給的不是是數字形式,就回傳空的資料
        elif not page.isdigit():
            response_msg={
                        "nextPage":None,
                        "data":[]}
            res=make_response(response_msg,200)                   
    elif connection == "error":  #如果沒有順利取得連線
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
        connection = db.get_sight_cnx() #取得景點相關操作的自定義connection物件
        if isinstance(connection,Connection): #如果有順利取得連線
            data = connection.get_attrac_by_id(attractionID)
            if data == "error":
                response_msg = {
                    "error": True,
                    "message": "Data base failed."}
                res = make_response(response_msg, 500)
            else:
                response_msg = json.dumps(data,ensure_ascii=False)
                res=make_response(response_msg,200) 
        elif connection == "error": #如果沒有順利取得連線
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
    """
    connection = db.get_sight_cnx() #取得景點相關操作的自定義connection物件
    if isinstance(connection,Connection): #如果有順利取得連線
        page = request.args.get('page')
        keyword = request.args.get('keyword')
        #如果沒有給page或是給的page是數字形式的話就可以拿資料
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
        #如果page給的不是是數字形式,就回傳空的資料
        elif not page.isdigit():
            response_msg={
                        "nextPage":None,
                        "data":[]}
            res=make_response(response_msg,200)                   
    elif connection == "error"  #如果沒有順利取得連線
        response_msg={
                    "error":True,
                    "message":"Data base failed."}
        res=make_response(response_msg,500)
    res.headers['Content-Type']='application/json'    
    return res
    """


@fetch.route('/api/attraction/<attractionID>',methods=["GET"])
def get_attraction_id(attractionID):
    attraction_result = get_attr_by_id(attractionID)
    return attraction_result
    """
    #如果給的景點id不是數字形式,回傳錯誤訊息
    if not attractionID.isdigit():
        response_msg = {
            "error": True,
            "message": "景點編號不正確"}
        res = make_response(response_msg, 400)
    else:
        connection = db.get_sight_cnx() #取得景點相關操作的自定義connection物件
        if isinstance(connection,Connection): #如果有順利取得連線
            data = connection.get_attrac_by_id(attractionID)
            if data == "error":
                response_msg = {
                    "error": True,
                    "message": "Data base failed."}
                res = make_response(response_msg, 500)
            else:
                response_msg = json.dumps(data,ensure_ascii=False)
                res=make_response(response_msg,200) 
        elif connection == "error": #如果沒有順利取得連線
            response_msg = {
                    "error": True,
                    "message": "Data base failed."}
            res = make_response(response_msg, 500)        
    res.headers['Content-Type']='application/json'
    return res   
    """    
        


    




