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
import requests
from database import db
from model.connection import Connection
from datetime import datetime
import time
from flask_jwt_extended import decode_token
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
                print('request的JWT失效 或 根本沒有jwt')
                return jsonify({
                        "error": True,
                        "message": "拒絕存取"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper



def handlePayment(request,member_id):
    #前端送過來的是json檔
    request_data = request.get_json()
    #print('data:',request_data)
    #如果POST過來根本沒有json檔
    if not request_data:
        response_msg={
                    "error":True,
                    "message":"建立行程失敗,沒有傳送行程資料"}
        return jsonify(response_msg), 400
    pay_by_prime_url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
    #整理要發送tappay的json
    payload = {}
    payload["prime"] = request_data["prime"]
    #測試,key的東西都會在改位置
    payload["partner_key"] = PARTNER_KEY 
    payload["merchant_id"] = "123wayne_CTBC"
    payload["amount"] = request_data["order"]["price"]
    payload["details"] = "taipei one day trip"
    payload["cardholder"] = {
            "phone_number": "+886"+request_data["order"]["contact"]["phone"][1:],
            "name": request_data["order"]["contact"]["name"],
            "email": request_data["order"]["contact"]["email"],
            }
    #把payload轉成json
    payload = json.dumps(payload)
    #發送
    headers = {"x-api-key": PARTNER_KEY,"Content-Type": "application/json"}
    res = requests.post(pay_by_prime_url, data=payload, headers=headers)
    #print(res.status_code)
    if res.status_code == requests.codes.ok:#代表打api成功
        res = json.loads(res.text) 
        print(res)
        #不管交易成功或失敗,都要把訂單建立起來,把預定行程刪掉
        connection = db.get_booking_cnx() #先取得訂單相關操作的自定義connection物件    
        if isinstance(connection,Connection): #如果有順利取得連線
            #首先,如果原本會員已經有預定行程,要先刪除原本的行程
            delete_result = connection.delete_schedule(member_id) 
            if delete_result:   #如果成功刪掉預定行程,就新增訂單
                connection = db.get_order_cnx()
                if res["status"]==0: #代表交易成功
                    status= 0
                    msg = "付款成功"
                else:
                    status = 1   
                    msg = "付款失敗" 
                order_id = str(int(datetime.now().timestamp()))    
                result = connection.insert_new_order(member_id,request_data,status,order_id) #就新增訂單
                if result == "error":
                    response_msg={
                            "error":True,
                            "message":"不好意思,資料庫暫時有問題,維修中"}
                    return jsonify(response_msg), 500 
                elif result == True:  #如果檢查回傳結果是true代表新增訂單成功,但付款可能不成功
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
        elif connection == "error":  #如果沒有順利取得連線           
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
        if isinstance(connection,Connection): #如果有順利取得連線
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
        elif connection == "error": #如果沒有順利取得連線
            response_msg = {
                    "error": True,
                    "message": "Data base failed."}
            return jsonify(response_msg), 500      









@payment.route('/api/orders',methods=['POST']) #這個route要受jwt保護
#@jwt_required_for_orders()
def pay():
    member_id = Utils_obj.get_member_id_from_jwt(request) #使用utils物件的靜態方法取得jwt裡的資訊
    result = handlePayment(request,member_id)
    return result





@payment.route('/api/order/<orderNumber>',methods=['GET']) #這個route要受jwt保護
@jwt_required_for_orders()
def get_order(orderNumber):
    order_result = handle_get_order(orderNumber)
    return order_result
