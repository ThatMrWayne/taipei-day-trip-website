import json
from flask import Blueprint
from flask import request
from flask import make_response
from database import db

fetch = Blueprint('fetch',__name__,static_folder='static',static_url_path='/fetch',template_folder='templates')


@fetch.route('/api/attractions',methods=['GET'])
def get_attraction():
    page = request.args.get('page')
    keyword = request.args.get('keyword')
    #如果沒有給page或是給的page是數字形式的話就可以拿資料
    if not page or page.isdigit():              
        data = db.get_attrac_page(page,keyword)
        if type(data) is str:
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
    res.headers['Content-Type']='application/json'
    return res


@fetch.route('/api/attraction/<attractionID>',methods=["GET"])
def get_attraction_id(attractionID):
    #如果給的景點id不是數字形式,回傳錯誤訊息
    if not attractionID.isdigit():
        response_msg = {
            "error": True,
            "message": "景點編號不正確"}
        res = make_response(response_msg, 400)
    else:
        data = db.get_attrac_by_id(attractionID)
        if type(data) is str:
            response_msg = {
                "error": True,
                "message": "Data base failed."}
            res = make_response(response_msg, 500)
        else:
            response_msg = json.dumps(data,ensure_ascii=False)
            res=make_response(response_msg,200) 
        res.headers['Content-Type']='application/json'
    return res       
        


    




