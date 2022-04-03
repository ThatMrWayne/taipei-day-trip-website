import json
from flask import Blueprint
from flask import request
from flask import make_response
from flask import jsonify 
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import verify_jwt_in_request
from functools import wraps
from database import db
from model.connection import Connection

booking = Blueprint('book',__name__,static_folder='static',static_url_path='/book')

def buildNewTrip(request,member_id):
    #前端送過來的是json檔
    request_data = request.get_json()
    print('data:',request_data)
    #如果POST過來根本沒有json檔
    if not request_data:
        response_msg={
                    "error":True,
                    "message":"建立行程失敗,沒有傳送行程資料"}
        return jsonify(response_msg), 400
    attractionId = request_data.get("attractionId")
    date = request_data.get("date")
    price = request_data.get("price")
    time = request_data.get("time")
    #如果有傳json檔,但裡面根本沒有資料
    if not attractionId or not date or not price or not time:
        response_msg={
                    "error":True,
                    "message":"建立行程失敗,沒有傳送行程資料"}
        return jsonify(response_msg), 400   
    #有需要連資料都檢查格式嗎？
    #取得連線物件
    connection = db.get_booking_cnx() #取得行程相關操作的自定義connection物件    
    if isinstance(connection,Connection): #如果有順利取得連線
        #首先,如果原本會員已經有預定行程,要先刪除原本的行程
        delete_result = connection.delete_schedule(member_id) 
        if delete_result:   
            connection = db.get_booking_cnx()
            result = connection.insert_new_schedule(member_id,attractionId,date,time,price)
            if result == "error":
                response_msg={
                        "error":True,
                        "message":"不好意思,資料庫暫時有問題,維修中"}
                return jsonify(response_msg), 500 
            elif result == True:  #如果檢查回傳結果是true代表新增行程成功
                response_msg={ "ok":True }
                return jsonify(response_msg), 200 
        else:
            response_msg={
                    "error":True,
                    "message":"不好意思,資料庫暫時有問題,維修中"}
            return jsonify(response_msg), 500
    elif connection == "error":  #如果沒有順利取得連線           
        response_msg={
                    "error":True,
                    "message":"不好意思,資料庫暫時有問題維修中"}          
        return jsonify(response_msg), 500 


def deleteTrip(member_id):
    connection = db.get_booking_cnx() #取得行程相關操作的自定義connection物件    
    if isinstance(connection,Connection): #如果有順利取得連線
        result = connection.delete_schedule(member_id)
        if result == "error":
            response_msg={
                    "error":True,
                    "message":"不好意思,資料庫暫時有問題,維修中"}
            return jsonify(response_msg), 500 
        elif result == True:  #如果檢查回傳結果是true代表刪除行程成功
            response_msg={ "ok":True }
            return jsonify(response_msg), 200 
    elif connection == "error":  #如果沒有順利取得連線           
        response_msg={
                    "error":True,
                    "message":"不好意思,資料庫暫時有問題維修中"}          
        return jsonify(response_msg), 500 


def getTripInfo(member_id):
    connection = db.get_booking_cnx() #取得行程相關操作的自定義connection物件
    if isinstance(connection,Connection): #如果有順利取得連線
        result = connection.retrieve_trip_information(member_id) 
        if result == "error":
            response_msg={
                        "error":True,
                        "message":"不好意思,資料庫暫時有問題,維修中"}
            return jsonify(response_msg), 500 
        elif isinstance(result,dict):
            result["attraction"] = {
                                "id":result["attractionID"],
                                "name":result["name"],
                                "address":result["address"],
                                "image":result["url"],
                                }
            del result["attractionID"]    
            del result["name"]   
            del result["address"]      
            del result["url"]        
            result["date"] = str(result["date"])
            return jsonify({"data":result}) ,200
        else:
            return jsonify({"data":None}) ,200    
    elif connection == "error":
            response_msg={
                        "error":True,
                        "message":"不好意思,資料庫暫時有問題,維修中"}
            return jsonify(response_msg), 500




#decorator for /api/booking route
def jwt_required_for_booking():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except:
                print('request的JWT失效 或 根本沒有jwt')
                return jsonify({
                        "error": True,
                        "message": "拒絕存取"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper



@booking.route('/api/booking',methods=['GET','POST','DELETE']) #這個route要受jwt保護
@jwt_required_for_booking()
def booking_api():
    if request.method == "GET":
        current_user = get_jwt_identity() #取得存在JWT裡的member_id資訊
        member_id = json.loads(current_user)["id"]
        get_trip_result = getTripInfo(member_id)
        return get_trip_result
    elif request.method == "POST": #如果是post,代表要建立新行程
        current_user = get_jwt_identity() #取得存在JWT裡的member_id資訊
        member_id = json.loads(current_user)["id"]
        build_trip_result = buildNewTrip(request,member_id)
        return build_trip_result
    elif request.method == "DELETE":
        current_user = get_jwt_identity() #取得存在JWT裡的member_id資訊
        member_id = json.loads(current_user)["id"]
        delete_trip_result = deleteTrip(member_id)
        return delete_trip_result

