import json
from flask import Blueprint
from flask import request
from flask import jsonify 
from flask_jwt_extended import verify_jwt_in_request
from functools import wraps
import requests
from database import db
from model.connection import Connection
from datetime import datetime
from utils import Utils_obj
from config import PARTNER_KEY

payment = Blueprint('pay',__name__,static_folder='static',static_url_path='/pay')


#decorator for /api/orders route
def jwt_required_for_orders():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except:
                #request的JWT失效 或 根本沒有jwt
                return jsonify({
                        "error": True,
                        "message": "拒絕存取"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper



def handlePayment(request,member_id):
    request_data = request.get_json()
    if not request_data:
        response_msg={
                    "error":True,
                    "message":"建立行程失敗,沒有傳送行程資料"}
        return jsonify(response_msg), 400
    pay_by_prime_url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
    #organize json data to tappay
    payload = {}
    payload["prime"] = request_data["prime"]
    payload["partner_key"] = PARTNER_KEY 
    payload["merchant_id"] = "123wayne_CTBC"
    payload["amount"] = request_data["order"]["price"]
    payload["details"] = "taipei one day trip"
    payload["cardholder"] = {
            "phone_number": "+886"+request_data["order"]["contact"]["phone"][1:],
            "name": request_data["order"]["contact"]["name"],
            "email": request_data["order"]["contact"]["email"],
            }
    payload = json.dumps(payload)
    headers = {"x-api-key": PARTNER_KEY,"Content-Type": "application/json"}
    res = requests.post(pay_by_prime_url, data=payload, headers=headers)
    if res.status_code == requests.codes.ok:
        res = json.loads(res.text) 
        #no matter deal success or fail, build the oreder
        connection = db.get_booking_cnx() #先取得訂單相關操作的自定義connection物件    
        if isinstance(connection,Connection): 
            #if existing booking schedule, delete old schedule
            delete_result = connection.delete_schedule(member_id) 
            if delete_result:  
                connection = db.get_order_cnx()
                if res["status"]==0: #pay successfully 
                    status= 0
                    msg = "付款成功"
                else:
                    status = 1   
                    msg = "付款失敗" 
                order_id = str(int(datetime.now().timestamp()))    
                result = connection.insert_new_order(member_id,request_data,status,order_id) 
                if result == "error":
                    response_msg={
                            "error":True,
                            "message":"不好意思,資料庫暫時有問題,維修中"}
                    return jsonify(response_msg), 500 
                elif result == True:  #true means adding order successfully, but not payment
                    response_msg={
                                    "data": {
                                        "number": order_id,
                                        "payment": {
                                            "status": status,
                                            "message": msg
                                        }
                                    }
                                }
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
    else:
        response_msg={
                    "error":True,
                    "message":"付款連線失敗"}
        return jsonify(response_msg), 400




def handle_get_order(orderNumber):
    if not orderNumber.isdigit():
        return jsonify({"data":None}), 200
    else:
        connection = db.get_order_cnx() #取得訂單相關操作的自定義connection物件
        if isinstance(connection,Connection): 
            data = connection.get_order_info(orderNumber)
            if data == "error":
                response_msg = {
                    "error": True,
                    "message": "Data base failed."}
                return jsonify(response_msg), 500
            elif data: 
                return jsonify(data), 200
            else:
                return jsonify({"data":None}), 200    
        elif connection == "error": 
            response_msg = {
                    "error": True,
                    "message": "Data base failed."}
            return jsonify(response_msg), 500      









@payment.route('/api/orders',methods=['POST']) 
def pay():
    member_id = Utils_obj.get_member_id_from_jwt(request) 
    result = handlePayment(request,member_id)
    return result





@payment.route('/api/order/<orderNumber>',methods=['GET']) 
@jwt_required_for_orders()
def get_order(orderNumber):
    order_result = handle_get_order(orderNumber)
    return order_result
