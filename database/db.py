import mysql.connector
from mysql.connector import errorcode
from mysql.connector import pooling
from config import MYSQL_PASSWORD
from config import MYSQL_USER

class DataBase():
    def __init__(self):
        try:
            config = {
                'user': MYSQL_USER,
                'password': MYSQL_PASSWORD,
                'host': '127.0.0.1',
                'database': 'website',
                'raise_on_warnings': True,
                }
            # create connection
            self.cnxpool = pooling.MySQLConnectionPool(pool_name="tinipool", pool_size=5, **config)
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
                print("Something is wrong with your user name or password")
            elif err.errno == errorcode.ER_BAD_DB_ERROR:
                print("Database does not exist")
            else:
                print(err)
            exit(1)

    def get_attrac_page(self,page,keyword=None):
        msg,sight_data,nextPage = None,None,None
        #取得連線
        try:
            cnx = self.cnxpool.get_connection()
        except mysql.connector.Error as err:
            print(err)
            return(err.msg)

        #如果沒有給Page 視為0
        if not page:
            page = 0       

        cursor= cnx.cursor(dictionary=True)
        try:
            if keyword:
                keyword_query = ("SELECT s1.* , s2.url AS images from "
                "(SELECT * FROM sight WHERE name LIKE CONCAT('%',%(key)s,'%') ORDER BY id LIMIT %(st)s,13) AS s1 "
                "INNER JOIN image AS s2 ON s1.id = s2.sight_id")
                cursor.execute(keyword_query,{'key':keyword,'st':int(page)*12})
                sight_data = cursor.fetchall() #可能是空的[]
            else:
                normal_query = ("SELECT s1.* , s2.url AS images from "
                "(SELECT * FROM sight ORDER BY id LIMIT %(st)s,13) AS s1 "
                "INNER JOIN image AS s2 ON s1.id = s2.sight_id")
                cursor.execute(normal_query,{'st':int(page)*12})
                sight_data = cursor.fetchall() #可能是空的[]    

            if sight_data:
                final = []
                current_sight = sight_data[0]
                current_sight['images'] = [sight_data[0]['images']]
                current_id = sight_data[0]['id']
                for data in sight_data[1:]:
                    if data['id']==current_id:
                        current_sight['images'].append(data['images'])
                    else:
                        final.append(current_sight)
                        current_sight=data
                        current_sight['images'] = [current_sight['images']]
                        current_id = current_sight['id']
                final.append(current_sight)
            else:
                final=[]

            #查看有沒有下一頁
            try:
                next_item = final[12]
                nextPage = int(page)+1
            except:
                nextPage = None      

            result={
                    "nextPage":nextPage,
                    "data":final[:12] #回傳前12筆就好
                    }  
        except mysql.connector.Error as err:
            print(err)
            msg = err.msg      
        finally:
            cursor.close()
            cnx.close()   
            if msg:
                return msg
            else:
                return result

    def get_attrac_by_id(self,attractionid):
        msg,result = None,None
        # 取得連線
        try:
            cnx = self.cnxpool.get_connection()
        except mysql.connector.Error as err:
            print(err)
            return (err.msg)

        cursor = cnx.cursor(dictionary=True)
        try:
            query = "SELECT * FROM sight WHERE id = %(attracId)s"
            cursor.execute(query,{"attracId":int(attractionid)})
            sight_data = cursor.fetchall()
            #如果有資料才去搜尋圖片url
            if sight_data:
                sightid = sight_data[0]['id']
                cursor.execute("SELECT url FROM image WHERE sight_id = %(sightid)s ",{"sightid":sightid})
                img_data = [i['url'] for i in cursor.fetchall()]
                sight_data[0]['image']=img_data
                sight_data[0]['latitude']=float(sight_data[0]['latitude'])
                sight_data[0]['longitude']=float(sight_data[0]['longitude'])
                result={'data':sight_data[0]}
            else:
                result={'data':[]}        
        except mysql.connector.Error as err:
            print(err)
            msg = err.msg
        finally:
            cursor.close()
            cnx.close()   
            if msg:
                return msg
            else:
                return result            


             
db = DataBase()           
