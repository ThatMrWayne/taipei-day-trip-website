import mysql.connector
from mysql.connector import errorcode
from mysql.connector import pooling
from config import MYSQL_PASSWORD
from config import MYSQL_USER
from model import Sight_connection 
from model import Auth_connection
from model import Booking_connection
from model import Order_connection

TABLES = {}
TABLES['members'] = (
    "CREATE TABLE IF NOT EXISTS `members` ("
    "  `member_id` bigint NOT NULL AUTO_INCREMENT ,"
    "  `name` varchar(255) NOT NULL,"
    "  `email` varchar(255) NOT NULL,"
    "  `hash_password` varchar(255) NOT NULL,"
    "  `signup_date` DATETIME DEFAULT CURRENT_TIMESTAMP,"
    "  PRIMARY KEY (`member_id`),"
    "  UNIQUE KEY(`email`)"
    ")")

TABLES['schedule'] = (
    "CREATE TABLE IF NOT EXISTS `schedule` ("
    "  `schedule_id` bigint NOT NULL AUTO_INCREMENT ,"
    "  `member_id` bigint,"
    "  `attractionId` bigint,"
    "  `date` DATE NOT NULL,"
    "  `time` varchar(20) NOT NULL,"
    "  `price` int NOT NULL,"
    "  PRIMARY KEY (`schedule_id`),"
    "  INDEX(`member_id`),"
    "  FOREIGN KEY(member_id) REFERENCES members(member_id) ON DELETE CASCADE ON UPDATE CASCADE,"
    "  FOREIGN KEY(attractionId) REFERENCES sight(id) ON DELETE CASCADE ON UPDATE CASCADE"
    ")")    

TABLES['orders'] = (
    "CREATE TABLE IF NOT EXISTS `orders` ("
    "  `order_id` varchar(50) NOT NULL,"
    "  `member_id` bigint,"
    "  `attractionId` bigint,"
    "  `date` DATE NOT NULL,"
    "  `time` varchar(20) NOT NULL,"
    "  `price` int NOT NULL,"
    "  `contact_name` varchar(20),"
    "  `contact_email` varchar(50),"
    "  `contact_number` varchar(15),"
    "  `status` varchar(20),"
    "  PRIMARY KEY (`order_id`),"
    "  FOREIGN KEY(member_id) REFERENCES members(member_id) ON DELETE CASCADE ON UPDATE CASCADE,"
    "  FOREIGN KEY(attractionId) REFERENCES sight(id) ON DELETE CASCADE ON UPDATE CASCADE"
    ")")  




class DataBase():
    def __init__(self):
        try:
            config = {
                'user': MYSQL_USER,
                'password': MYSQL_PASSWORD,
                'host': '127.0.0.1',
                'database': 'website',
                'raise_on_warnings': True,
                'time_zone': "+00:00", 
                }
            # create connection
            self.cnxpool = pooling.MySQLConnectionPool(pool_name="tinipool", pool_size=5, **config)
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
                print("Something is wrong with your user name or password")
            elif err.errno == errorcode.ER_BAD_DB_ERROR:
                print("Database does not exist")
            else:
                print(err.msg)
            exit(1)
 


    def get_sight_cnx(self):
        try:
            cnx = self.cnxpool.get_connection()
            return Sight_connection(cnx)
        except mysql.connector.Error as err: 
            print(err)
            return "error"

    def get_auth_cnx(self):
        try:
            cnx = self.cnxpool.get_connection()
            return Auth_connection(cnx)
        except mysql.connector.Error as err: 
            print(err)
            return "error"      

    def get_booking_cnx(self):
        try:
            cnx = self.cnxpool.get_connection()
            return Booking_connection(cnx)
        except mysql.connector.Error as err: 
            print(err)
            return "error"   


    def get_order_cnx(self):
        try:
            cnx = self.cnxpool.get_connection()
            return Order_connection(cnx)
        except mysql.connector.Error as err: 
            print(err)
            return "error"                      

             
db = DataBase()      
   
