import json 
import mysql.connector
from mysql.connector import errorcode
from mysql.connector import pooling
import os
from dotenv import load_dotenv

load_dotenv()
#由data/.env檔匯入mysql資料庫使用者與密碼
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
MYSQL_USER = os.getenv('MYSQL_USER')


try:
    config = {
        'user': MYSQL_USER,
        'password': MYSQL_PASSWORD,
        'host': '127.0.0.1',
        'database': 'website',
        'raise_on_warnings': True,
    }
 # create connection
    cnx = mysql.connector.connect(**config)
except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Something is wrong with your user name or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    else:
        print(err)
    exit(1)

#讀取json檔
with open("./taipei-attractions.json",'r') as fp:
    data=json.load(fp)
    
cursor=cnx.cursor(dictionary=True)
query_1 = ("INSERT INTO sight " 
          "VALUES (%(id)s,%(name)s,%(category)s,%(description)s,%(address)s,"
          "%(transport)s,%(mrt)s,%(latitude)s,%(longitude)s)")
query_2 = ("INSERT INTO image "
         "VALUES (DEFAULT,%(sight_id)s,%(img_url)s)")


try:
    for s in data['result']['results']:
        input_data_1 = {
            "id":s['_id'],
            "name":s['stitle'],
            "category":s['CAT2'],
            "description":s['xbody'],
            "address":s['address'],
            "transport":s['info'],
            "mrt":s['MRT'],
            "latitude":s['latitude'],
            "longitude":s['longitude']
        }      
        input_data_2={
            "sight_id":s['_id'],
            "img_url":None,
        }
        #儲存該景點所有圖片網址在list裡
        image_url=[]
        for url in s['file'].split('https'):
            url_lwr = url.lower()
            if url_lwr.endswith('jpg') or url_lwr.endswith('png'): #過濾出jpg,png檔
                image_url.append('https'+url)
        #插入景點主要資訊        
        cursor.execute(query_1,input_data_1)
        cnx.commit()
        print('insert ok')
        #插入景點圖片網址
        for url in image_url:
            input_data_2['img_url']=url
            cursor.execute(query_2,input_data_2)
        cnx.commit()
        print('insert image url ok')
except mysql.connector.Error as err:
    print(err)     
finally:    
    cursor.close()
    cnx.close()           

