import json
import re
import datetime
from flask import request
from flask import Blueprint
from flask import make_response
from flask import jsonify 
from flask_jwt_extended import create_access_token
from flask_jwt_extended import verify_jwt_in_request
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from database import db
from model.connection import Connection
from utils import Utils_obj

auth = Blueprint('authen', __name__,static_folder='static',static_url_path='/auth')


#decorator for /api/user route
def jwt_required_for_user():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            if request.method == 'GET': 
                try:
                    verify_jwt_in_request()
                except:
                    #access_token已失效 或 request根本沒有JWT
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
        request_data = request.get_json()
        if not request_data:
            response_msg={
                          "error":True,
                          "message":"註冊失敗"}
            return jsonify(response_msg), 400
        name = request_data.get("name")
        email = request_data.get("email")
        password = request_data.get("password")
        if not name or not email or not password:
            response_msg={
                          "error":True,
                          "message":"註冊失敗"}
            return jsonify(response_msg), 400
        verify_result = verify_signup_info(email,password)
        if verify_result == False:
            response_msg={
                            "error":True,
                            "message":"信箱或密碼輸入格式錯誤"}  
            return jsonify(response_msg), 400
        connection = db.get_auth_cnx() #取得驗證登入註冊相關操作的自定義connection物件
        if isinstance(connection,Connection): 
            result = connection.check_if_member_exist(email)
            if result == "error": 
                response_msg={
                            "error":True,
                            "message":"不好意思,資料庫暫時有問題,維修中"}
                return jsonify(response_msg), 500
            elif result == True: 
                response_msg={
                            "error":True,
                            "message":"此email已經被註冊,請重新輸入"}
                return jsonify(response_msg), 400
            else: 
                #hash the password
                hash_password = generate_password_hash(password)
                #add new member information
                connection = db.get_auth_cnx() 
                result = connection.insert_new_member(name, email, hash_password)
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
def handle_signin(request):
        request_data = request.get_json()
        if not request_data:
            response_msg={
                          "error":True,
                          "message":"登入失敗"}
            return jsonify(response_msg), 400
        email = request_data.get("email")
        password = request_data.get("password")
        if not email or not password: 
            response_msg={
                          "error":True,
                          "message":"登入失敗"}
            return jsonify(response_msg), 400
        connection = db.get_auth_cnx()    #取得驗證登入註冊相關操作的自定義connection物件
        if isinstance(connection,Connection): 
            result = connection.confirm_member_information(email) #confirm if there is this email 
            if result == "error": 
                response_msg={
                            "error":True,
                            "message":"不好意思,資料庫暫時有問題,維修中"}
                return jsonify(response_msg), 500 
            elif result: #means there is this member
                #check password
                check_result = check_password_hash(result["hash_password"],password)
                if check_result:
                    #JWT_token
                    access_token = create_access_token(identity=json.dumps({'email':email,'id':result["member_id"]}),expires_delta=datetime.timedelta(days=5))
                    response_msg = {"ok":True,}
                    res = make_response(json.dumps(response_msg,ensure_ascii=False),200)
                    res.headers["access_token"] = access_token #jwt in response header
                    return res
                else:
                    response_msg={
                            "error":True,
                            "message":"登入失敗，密碼輸入錯誤"}
                    return jsonify(response_msg), 400
            else:  
                response_msg={
                            "error":True,
                            "message":"無此會員，請輸入正確的信箱"}
                return jsonify(response_msg), 400
        elif connection == "error": 
            response_msg={
                        "error":True,
                        "message":"不好意思,資料庫暫時有問題,維修中"}
            res=make_response(response_msg,500)               
            return jsonify(response_msg), 500    
def handle_get_user_data(request):
    connection = db.get_auth_cnx() #取得驗證登入註冊相關操作的自定義connection物件
    if isinstance(connection,Connection): 
        user_email = Utils_obj.get_email_from_jwt(request) 
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
def user():
    if request.method == "POST": 
        signup_result = handle_signup(request)
        return signup_result
    elif request.method == "PATCH":
        signin_result = handle_signin(request)
        return signin_result
    elif request.method == "DELETE": 
        return jsonify({"ok":True}), 200
    elif request.method == "GET": 
        get_user_data_result = handle_get_user_data(request)
        return get_user_data_result
        