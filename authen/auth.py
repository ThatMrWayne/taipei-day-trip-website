import json
from pickle import FALSE
import re
import datetime
from flask import request
from flask import Blueprint
from flask import make_response
from flask import jsonify 
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import verify_jwt_in_request
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from database import db
from model.connection import Connection

auth = Blueprint('authen', __name__,static_folder='static',static_url_path='/auth')


#decorator for /api/user route
def jwt_required_for_user():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            if request.method == 'GET': #如果是GET,代表要取得當前登入使用者資料,要驗證JWT
                try:
                    verify_jwt_in_request()
                except:
                    print('access_token已失效 或 request根本沒有JWT')
                    return jsonify({"data":None}), 200
            return fn(*args, **kwargs)
        return decorator
    return wrapper


#驗證註冊帳密格式function
def verify_signup_info(email,password):
    emailRegex = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')
    passwordRegex = re.compile(r'^(?=\w{8,16}$)(?=(?:[^A-Z]*[A-Z]){3})(?=[^a-z]*[a-z])(?=[^\d]*\d).*')
    if not re.fullmatch(emailRegex, email) or not re.fullmatch(passwordRegex,password):
        return False
    else:
        return True    



def handle_signup(request):
        #前端送過來的是json檔
        request_data = request.get_json()
        #如果POST過來根本沒有json檔
        if not request_data:
            response_msg={
                          "error":True,
                          "message":"註冊失敗"}
            return jsonify(response_msg), 400
        name = request_data.get("name")
        email = request_data.get("email")
        password = request_data.get("password")
        #如果有傳json檔,但裡面根本沒有name,email,pawword
        if not name or not email or not password:
            response_msg={
                          "error":True,
                          "message":"註冊失敗"}
            return jsonify(response_msg), 400
        #後端也要驗證一次信箱密碼正不正確 防止有人不是從瀏覽器註冊
        verify_result = verify_signup_info(email,password)
        if verify_result == False:
            response_msg={
                            "error":True,
                            "message":"信箱或密碼輸入格式錯誤"}  
            return jsonify(response_msg), 400
        #取得連線物件
        connection = db.get_auth_cnx() #取得驗證登入註冊相關操作的自定義connection物件
        if isinstance(connection,Connection): #如果有順利取得連線
            result = connection.check_if_member_exist(email)
            if result == "error": #如果檢查回傳結果是"error",代表資料庫query時發生錯誤
                response_msg={
                            "error":True,
                            "message":"不好意思,資料庫暫時有問題,維修中"}
                return jsonify(response_msg), 500
            elif result == True: #如果檢查回傳結果是true代表已經有一樣的email了
                response_msg={
                            "error":True,
                            "message":"此email已經被註冊,請重新輸入"}
                return jsonify(response_msg), 400
            else: #如果檢查回傳結果是false代表可以註冊
                #先對密碼做hash
                hash_password = generate_password_hash(password)
                #新增會員資料
                connection = db.get_auth_cnx() #要在拿一次因為每次執行完都會把cnx丟回去
                result = connection.insert_new_member(name, email, hash_password)
                if result == "error": #如果回傳結果是"error",代表資料庫insert時發生錯誤
                    response_msg={
                            "error":True,
                            "message":"不好意思,資料庫暫時有問題,維修中"}
                    return jsonify(response_msg), 500
                elif result == True: #如果檢查回傳結果是true代表新增會員到資料庫成功
                    response_msg={ "ok":True }
                    return jsonify(response_msg), 200
        elif connection == "error":  #如果沒有順利取得連線
            response_msg={
                        "error":True,
                        "message":"不好意思,資料庫暫時有問題維修中"}          
            return jsonify(response_msg), 500    
def handle_signin(request):
        request_data = request.get_json()
        if not request_data:
            response_msg={
                          "error":True,
                          "message":"登入失敗"}
            return jsonify(response_msg), 400
        email = request_data.get("email")
        password = request_data.get("password")
        if not email or not password: #如果沒有給email或password,失敗
            response_msg={
                          "error":True,
                          "message":"登入失敗"}
            return jsonify(response_msg), 400
        connection = db.get_auth_cnx()    #取得驗證登入註冊相關操作的自定義connection物件
        if isinstance(connection,Connection): #如果有順利取得連線
            result = connection.confirm_member_information(email) #先確認有沒有這個email帳號 
            if result == "error": #代表查詢失敗
                response_msg={
                            "error":True,
                            "message":"不好意思,資料庫暫時有問題,維修中"}
                return jsonify(response_msg), 500 
            elif result: #表示有此會員
                #接著檢查密碼
                check_result = check_password_hash(result["hash_password"],password)
                if check_result:
                    #產生JWT_token
                    access_token = create_access_token(identity=json.dumps({'email':email,'id':result["member_id"]}),expires_delta=datetime.timedelta(days=5))
                    response_msg = {"ok":True,}
                    res = make_response(json.dumps(response_msg,ensure_ascii=False),200)
                    res.headers["access_token"] = access_token #把jwt塞在response header
                    return res
                else:
                    response_msg={
                            "error":True,
                            "message":"登入失敗，密碼輸入錯誤"}
                    return jsonify(response_msg), 400
            else:  #表示沒有這個會員
                response_msg={
                            "error":True,
                            "message":"無此會員，請輸入正確的信箱"}
                return jsonify(response_msg), 400
        elif connection == "error": #如果沒有順利取得連線
            response_msg={
                        "error":True,
                        "message":"不好意思,資料庫暫時有問題,維修中"}
            res=make_response(response_msg,500)               
            return jsonify(response_msg), 500    
def handle_get_user_data(request):
    connection = db.get_auth_cnx() #取得驗證登入註冊相關操作的自定義connection物件
    if isinstance(connection,Connection): #如果有順利取得連線
        current_user = get_jwt_identity() #取得存在JWT裡的email資訊
        user_email = json.loads(current_user)["email"]
        result = connection.retrieve_member_information(user_email) 
        if result == "error":
            response_msg={
                        "error":True,
                        "message":"不好意思,資料庫暫時有問題,維修中"}
            return jsonify(response_msg), 500 
        elif isinstance(result,dict):
            result["id"] = result["member_id"]
            del result["member_id"]
            return jsonify({"data":result}) ,200
    elif connection == "error":
            response_msg={
                        "error":True,
                        "message":"不好意思,資料庫暫時有問題,維修中"}
            return jsonify(response_msg), 500    





@auth.route('/api/user', methods=["GET","POST","PATCH","DELETE"])
@jwt_required_for_user()
def user():
    if request.method == "POST": #如果是POST,代表要註冊
        signup_result = handle_signup(request)
        return signup_result
    elif request.method == "PATCH": #如果是PATCH,代表要登入 
        signin_result = handle_signin(request)
        return signin_result
    elif request.method == "DELETE": #如果是delete,代表要登出,在前端移除JWT 
        return jsonify({"ok":True}), 200
    elif request.method == "GET": #如果是GET,代表要取得當前登入使用者資料,要驗證JWT
        get_user_data_result = handle_get_user_data(request)
        return get_user_data_result
        