from flask import *
from flask_jwt_extended import JWTManager
from fetch_data import fecth_blueprint
from authen import auth_blueprint
from booking import booking_blueprint
from payment import payment_blueprint
import config

app=Flask(__name__)
app.config.from_object(config.DevelopmentConfig)
app.register_blueprint(fecth_blueprint)
app.register_blueprint(auth_blueprint)
app.register_blueprint(booking_blueprint)
app.register_blueprint(payment_blueprint)


app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

jwt = JWTManager(app)

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


app.run(host="0.0.0.0",port=3000)