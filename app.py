from flask import *
from flask_jwt_extended import JWTManager
from flask_jwt_extended import decode_token
from fetch_data import fecth_blueprint
from authen import auth_blueprint
from booking import booking_blueprint
from payment import payment_blueprint
import config
from werkzeug.wrappers import Request, Response
import json

app=Flask(__name__)
app.config.from_object(config.ProductionConfig)
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





# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou/")
def thankyou():
	return render_template("thankyou.html")


if __name__ == "__main__":
	app.run(host="0.0.0.0",port=3000)