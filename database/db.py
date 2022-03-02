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

        try:
            end_id = (int(page)+1)*12
        except:
            #如果page為none,視為page=0
            end_id = 12
        start_id = (end_id-12)+1        

        cursor= cnx.cursor(dictionary=True)
        try:
            if keyword:
                #先篩選出有關鍵字的景點
                query = ("SELECT * FROM sight WHERE name LIKE CONCAT('%',%(key)s,'%') ORDER BY id")
                cursor.execute(query,{'key':keyword})
                data = cursor.fetchall()
                if data:
                    #根據page取出篩選資料中的12筆資料
                    sight_data = data[start_id-1:start_id-1+12]#可能是空的[]
            else:
                #沒有關鍵字的情況
                query = ("SELECT * FROM sight WHERE id BETWEEN %(start)s AND %(end)s")
                input_data={
                    'start': start_id,
                    'end': end_id
                }
                cursor.execute(query,input_data)
                sight_data = cursor.fetchall() #可能是空的[]

            #確定有無下一頁
            if keyword:
                try:
                    next_item = data[start_id-1+12]
                    nextPage = page+1
                except IndexError:
                    nextPage = None    
            else:
                next_page = {'next':end_id+1}
                cursor.execute("select name from sight where id = %(next)s",next_page)
                if not cursor.fetchall():
                    nextPage=None
                else:
                    nextPage = (end_id//12)

            ##如果有資料才去搜尋圖片url
            if sight_data:
                #在query裡放列表給in用
                ids = [d['id'] for d in sight_data]
                ids='('+','.join([str(i) for i in ids])+')'
                img_query=f"SELECT sight_id, url from image where sight_id in {ids}"
                cursor.execute(img_query)
                img_data = cursor.fetchall()    
                for i in range(len(sight_data)):
                    sight_id = sight_data[i].get('id')
                    sight_data[i]['images']=[row.get('url') for row in img_data if row['sight_id']==sight_id]
                    sight_data[i]['latitude']=float(sight_data[i]['latitude'])
                    sight_data[i]['longitude']=float(sight_data[i]['longitude'])
            result={
                    "nextPage":nextPage,
                    "data":sight_data
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
