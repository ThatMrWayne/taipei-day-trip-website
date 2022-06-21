from flask import Blueprint
from flask import render_template 

main = Blueprint('main',__name__,template_folder="templates")


# Pages
@main.route("/")
def index():
	return render_template("index.html")
@main.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@main.route("/booking")
def booking():
	return render_template("booking.html")
@main.route("/thankyou/")
def thankyou():
	return render_template("thankyou.html")