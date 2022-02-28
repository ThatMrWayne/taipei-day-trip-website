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
        msg = None
        try:
            cnx = self.cnxpool.get_connection()
        except mysql.connector.Error as err:
            print(err)
            return(err.msg)
        start = int(page)*12
        cursor = cnx.cursor(dictionary=True)
        try:
            if keyword:
                query = ("SELECT * FROM sight order by id LIMIT %(start)s,12" 
                        " AND (title LIKE %(keyword)s)")
                input_data={
                    'start':start,
                    'keyword':'%'+keyword+'%',
                }
                cursor.execute(query,input_data)
            else:
                query = ("SELECT * FROM sight order by id LIMIT %(start)s,12")
                input_data={
                    'start':start,
                }
                cursor.execute(query,input_data)
            sight_data = cursor.fetchall() #可能是空的[]
            #確定有無下一頁
            next_page = {'next':start+12}
            cursor.execute("select name from sight order by id LIMIT %(next)s,1",next_page)
            if not cursor.fetchall():
                nextPage=None
            else:
                nextPage = (next_page['next']//12)
            #處理image
            if sight_data:
                ids = tuple([d['id'] for d in sight_data])
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
             











db = DataBase()           
