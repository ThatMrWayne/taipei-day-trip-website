from flask import Flask
from flask_jwt_extended import JWTManager
from flask_jwt_extended import decode_token
from werkzeug.wrappers import Request, Response
from api.authen import auth_blueprint
from api.booking import booking_blueprint
from api.fetch_data import fecth_blueprint
from api.payment import payment_blueprint
from api.main import route_blueprint
import config
import json



def create_app():
    app = Flask(__name__)
    app.config.from_object(config.DevelopmentConfig)
    app.register_blueprint(route_blueprint)
    app.register_blueprint(fecth_blueprint)
    app.register_blueprint(auth_blueprint)
    app.register_blueprint(booking_blueprint)
    app.register_blueprint(payment_blueprint)
    app.config["JSON_AS_ASCII"]=False
    app.config["TEMPLATES_AUTO_RELOAD"]=True
    jwt = JWTManager(app)

    class AuthMiddleWare:
        def __init__(self, app):
            self.app = app

        def __call__(self, environ, start_response):
            request = Request(environ)
            result = None
            verify = None
            with app.app_context():
                if request.path in ["/api/booking", "/api/orders"] or (request.path=="/api/user" and request.method=="GET"):
                    verify = True
                    try:
                        token = request.headers.get("AUTHORIZATION").split(" ")[1]
                        t = decode_token(token)
                        result = True
                    except:
                        result = False
            if verify:
                if result:
                    return self.app(environ,start_response) 	  							
                else:
                    if request.path == "/api/user":
                        res = Response(response = json.dumps({"data":None}), status=200, content_type="application/json")
                        return res(environ,start_response)
                    else:
                        res = Response(response = json.dumps({"error":True,"message":"拒絕存取"}), status=403, content_type="application/json")
                        return res(environ, start_response)
            else:
                return self.app(environ,start_response)	

    app.wsgi_app = AuthMiddleWare(app.wsgi_app)

    return app

   