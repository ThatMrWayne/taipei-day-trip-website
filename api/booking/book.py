import json
from flask import Blueprint
from flask import request
from flask import jsonify 
from flask_jwt_extended import verify_jwt_in_request
from flask_jwt_extended import decode_token
from functools import wraps
from database import db
from model.connection import Connection
from utils import Utils_obj

booking = Blueprint('book',__name__,static_folder='static',static_url_path='/book')

def buildNewTrip(request,member_id):
    request_data = request.get_json()
    print('data:',request_data)
    if not request_data:
        response_msg={
                    "error":True,
                    "message":"建立行程失敗,沒有傳送行程資料"}
        return jsonify(response_msg), 400
    attractionId = request_data.get("attractionId")
    date = request_data.get("date")
    price = request_data.get("price")
    time = request_data.get("time")
    if not attractionId or not date or not price or not time:
        response_msg={
                    "error":True,
                    "message":"建立行程失敗,沒有傳送行程資料"}
        return jsonify(response_msg), 400   
    connection = db.get_booking_cnx() #取得行程相關操作的自定義connection物件    
    if isinstance(connection,Connection): 
        #if there is already booked schedule,delete it first
        delete_result = connection.delete_schedule(member_id) 
        if delete_result:   
            connection = db.get_booking_cnx()
            result = connection.insert_new_schedule(member_id,attractionId,date,time,price)
            if result == "error":
                response_msg={
                        "error":True,
                        "message":"不好意思,資料庫暫時有問題,維修中"}
                return jsonify(response_msg), 500 
            elif result == True:  
                response_msg={ "ok":True }
                return jsonify(response_msg), 200 
        else:
            response_msg={
                    "error":True,
                    "message":"不好意思,資料庫暫時有問題,維修中"}
            return jsonify(response_msg), 500
    elif connection == "error":         
        response_msg={
                    "error":True,
                    "message":"不好意思,資料庫暫時有問題維修中"}          
        return jsonify(response_msg), 500 


def deleteTrip(member_id):
    connection = db.get_booking_cnx() #取得行程相關操作的自定義connection物件    
    if isinstance(connection,Connection): 
        result = connection.delete_schedule(member_id)
        if result == "error":
            response_msg={
                    "error":True,
                    "message":"不好意思,資料庫暫時有問題,維修中"}
            return jsonify(response_msg), 500 
        elif result == True: 
            response_msg={ "ok":True }
            return jsonify(response_msg), 200 
    elif connection == "error":            
        response_msg={
                    "error":True,
                    "message":"不好意思,資料庫暫時有問題維修中"}          
        return jsonify(response_msg), 500 


def getTripInfo(member_id):
    connection = db.get_booking_cnx() #取得行程相關操作的自定義connection物件
    if isinstance(connection,Connection): 
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
                #invalid JWT or no jwt
                return jsonify({
                        "error": True,
                        "message": "拒絕存取"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper


def get_identity(request):
    jwt_token = request.headers.get("AUTHORIZATION").split(" ")[1]
    t = decode_token(jwt_token)
    user_id = json.loads(t["sub"])["id"]
    return user_id





@booking.route('/api/booking',methods=['GET','POST','DELETE']) 
def booking_api():
    member_id = Utils_obj.get_member_id_from_jwt(request) 
    if request.method == "GET":
        get_trip_result = getTripInfo(member_id)
        return get_trip_result
    elif request.method == "POST": 
        build_trip_result = buildNewTrip(request,member_id)
        return build_trip_result
    elif request.method == "DELETE":
        delete_trip_result = deleteTrip(member_id)
        return delete_trip_result

