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
                #先篩選出有關鍵字的景點
                #一次直接取13筆,之後可以用有沒有第13筆判斷是不是有下一頁
                query = ("SELECT * FROM sight WHERE name LIKE CONCAT('%',%(key)s,'%') ORDER BY id LIMIT %(st)s,13")
                cursor.execute(query,{'key':keyword,'st':int(page)*12})
                sight_data = cursor.fetchall() #可能是空的[]
            else:
                #沒有關鍵字的情況
                #一次直接取13筆,之後可以用有沒有第13筆判斷是不是有下一頁
                query = ("SELECT * FROM sight order by id LIMIT %(st)s,13")
                cursor.execute(query,{'st':int(page)*12})
                sight_data = cursor.fetchall() #可能是空的[]

            #確定有沒有第13筆,有無下一頁
            try:
                next_item = sight_data[12]
                nextPage = int(page)+1
            except IndexError:
                nextPage = None

            ##如果有資料才去搜尋圖片url
            if sight_data:
                #在query裡放列表給in用
                #取得所有景點資料的id
                ids = [single_sight_data['id'] for single_sight_data in sight_data]
                #(1,2,3,4,5,6,7,8,9,10,11,12)
                ids='('+','.join([str(i) for i in ids])+')'
                img_query = f"SELECT sight_id, url from image where sight_id in {ids}"
                cursor.execute(img_query)
                img_data = cursor.fetchall()
                #如果資料有13筆,取前12筆就好
                if len(sight_data)==13:     
                    for i in range(len(sight_data)-1):
                        sight_id = sight_data[i].get('id')
                        sight_data[i]['images']=[row.get('url') for row in img_data if row['sight_id']==sight_id]
                        sight_data[i]['latitude']=float(sight_data[i]['latitude'])
                        sight_data[i]['longitude']=float(sight_data[i]['longitude'])
                else:
                #如果沒有13筆,就是每筆都要
                    for data in sight_data:
                        sight_id = data.get('id')
                        data['images']=[row.get('url') for row in img_data if row['sight_id']==sight_id]
                        data['latitude']=float(data['latitude'])
                        data['longitude']=float(data['longitude'])        
            result={
                    "nextPage":nextPage,
                    "data":sight_data[:12] #回傳前12筆就好
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
