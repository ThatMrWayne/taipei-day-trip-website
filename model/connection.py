from collections import _OrderedDictItemsView
import mysql.connector


#base class
class Connection:
    def __init__(self,cnx):
        self.cnx = cnx


class Sight_connection(Connection):

    def get_attrac_page(self,page,keyword=None):
        msg,sight_data,nextPage = None,None,None
        #如果沒有給Page 視為0
        if not page:
            page = 0       

        cursor= self.cnx.cursor(dictionary=True)
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
            self.cnx.close()   
            if msg:
                return "error"
            else:
                return result

    def get_attrac_by_id(self,attractionid):
        msg,result = None,None

        cursor = self.cnx.cursor(dictionary=True)
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
            self.cnx.close()   
            if msg:
                return "error"
            else:
                return result                     


class Auth_connection(Connection):
    def check_if_member_exist(self,email):
        result,msg=None,None
        cursor = self.cnx.cursor(dictionary=True)
        query = "SELECT * FROM members WHERE email=%(email)s"
        try:
            cursor.execute(query, {'email': email})
            result = cursor.fetchone()
        except mysql.connector.Error as err:
            print(err)
            msg = err.msg
        finally:
            cursor.close()
            self.cnx.close()
            if msg:
                return "error"
            elif result:
                return True
            else:
                return False

    def insert_new_member(self,name,email,hash_password):
        result, msg = None, None
        cursor = self.cnx.cursor(dictionary=True)
        query = "INSERT INTO members VALUES (DEFAULT,%(name)s,%(email)s,%(password)s,DEFAULT)"
        input_data = {'name': name, 'email': email, 'password': hash_password}
        try:
            cursor.execute(query, input_data)
            self.cnx.commit()
            result = True
        except mysql.connector.Error as err:
            print(err)
            msg = err.msg
        finally:
            cursor.close()
            self.cnx.close()
            if msg:  #新增會員失敗  
                return "error"
            elif result:
                return True #新增會員成功


    def confirm_member_information(self,email):
        result, msg = None, None
        cursor = self.cnx.cursor(dictionary=True)
        query = "SELECT member_id, email, hash_password FROM members WHERE email=%(email)s"
        input_data = {'email': email}
        try:
            cursor.execute(query, input_data)
            result = cursor.fetchone()          
        except mysql.connector.Error as err:
            print(err)
            msg = err.msg
        finally:
            cursor.close()
            self.cnx.close()
            if msg:  #查詢失敗
                return "error"
            elif result:
                return result #有此會員
            else:
                return False #根本沒有這個會員      

    def retrieve_member_information(self,email):
        result, msg = None, None
        cursor = self.cnx.cursor(dictionary=True)
        query = "SELECT member_id, name, email FROM members WHERE email=%(email)s"
        input_data = {'email': email}
        try:
            cursor.execute(query, input_data)
            result = cursor.fetchone()          
        except mysql.connector.Error as err:
            print(err)
            msg = err.msg
        finally:
            cursor.close()
            self.cnx.close()
            if msg:  #查詢失敗
                return "error"
            elif result:
                return result #查詢成功
 

        

class Booking_connection(Connection):
    def insert_new_schedule(self,member_id,attractionId,date,time,price):
        result, msg = None, None
        cursor = self.cnx.cursor(dictionary=True)
        query = "INSERT INTO schedule VALUES (DEFAULT,%(member_id)s,%(attractionId)s,%(date)s,%(time)s,%(price)s)"
        input_data = {'member_id': member_id, 'attractionId': attractionId, 'date': date, 'time':time, 'price':price}
        try:
            cursor.execute(query, input_data)
            self.cnx.commit()
            result = True
        except mysql.connector.Error as err:
            print(err)
            msg = err.msg
        finally:
            cursor.close()
            self.cnx.close()
            if msg:  #新增行程失敗 
                return "error"
            elif result:
                return True #新增行程成功

    def delete_schedule(self,member_id):
        result, msg = None, None
        cursor = self.cnx.cursor(dictionary=True)
        query = "DELETE FROM schedule WHERE member_id = %(member_id)s"
        input_data = {'member_id': member_id}
        try:
            cursor.execute(query, input_data)
            self.cnx.commit()
            result = True
        except mysql.connector.Error as err:
            print(err)
            msg = err.msg
        finally:
            cursor.close()
            self.cnx.close()
            if msg:  #刪除行程失敗 
                return "error"
            elif result:
                return True #刪除行程成功            

    def retrieve_trip_information(self,member_id):
        result, msg = None, None
        cursor = self.cnx.cursor(dictionary=True)
        query = ("select s1.date,s1.time,s1.price,s1.attractionID,s2.name,s2.address,s3.url"  
                " from (select date,time,price,attractionID from schedule where member_id = %(member_id)s ) as s1" 
                " inner join sight as s2 on s1.attractionID = s2.id"  
                " inner join image as s3 on s1.attractionID = s3.sight_id" 
                " LIMIT 0,1")
        input_data = {'member_id': member_id}
        try:
            cursor.execute(query, input_data)
            result = cursor.fetchone()          
        except mysql.connector.Error as err:
            print(err)
            msg = err.msg
        finally:
            cursor.close()
            self.cnx.close()
            if msg:  #查詢失敗
                return "error"
            elif result:
                return result #查詢成功
            else:
                return None    

                

class Order_connection(Connection):
    def insert_new_order(self,member_id,request_data,status,order_id):
        result, msg = None, None
        cursor = self.cnx.cursor(dictionary=True)
        query = ("INSERT INTO orders VALUES (%(order_id)s,%(member_id)s,%(attractionId)s,%(date)s,%(time)s,%(price)s,"
                "%(contact_name)s,%(contact_email)s,%(contact_number)s,%(status)s)")
        input_data = {
                    'order_id':order_id,   
                    'member_id': member_id, 
                    'attractionId': request_data["order"]["trip"]["attraction"]["id"], 
                    'date': request_data["order"]["trip"]["date"],
                    'time':request_data["order"]["trip"]["time"],
                    'price':request_data["order"]["price"],
                    'contact_name':request_data["order"]["contact"]["name"],
                    'contact_email':request_data["order"]["contact"]["email"],
                    'contact_number':request_data["order"]["contact"]["phone"],
                    'status':status}
        try:
            cursor.execute(query, input_data)
            self.cnx.commit()
            result = True
        except mysql.connector.Error as err:
            print(err)
            msg = err.msg
        finally:
            cursor.close()
            self.cnx.close()
            if msg:  #新增訂單失敗 
                return "error"
            elif result:
                return True #新增訂單成功


    def get_order_info(self,order_id):
        result, msg = None, None
        cursor = self.cnx.cursor(dictionary=True)
        query = ("select s1.order_id, s1.date,s1.time,s1.price,s1.contact_name,s1.contact_email,s1.contact_number,s1.status,s1.attractionId,s2.address,s2.name,s3.url"  
                " from (select order_id,date,time,price,contact_name,contact_email,contact_number,status,attractionId from orders where order_id = %(order_id)s ) as s1" 
                " inner join sight as s2 on s1.attractionID = s2.id"  
                " inner join image as s3 on s1.attractionID = s3.sight_id" 
                " LIMIT 0,1")
        input_data = {'order_id': order_id}
        try:
            cursor.execute(query, input_data)
            result = cursor.fetchone()          
        except mysql.connector.Error as err:
            print(err)
            msg = err.msg
        finally:
            cursor.close()
            self.cnx.close()
            if msg:  #查詢失敗
                return "error"
            elif result:
                order_data={}
                order_data["data"]={}
                order_data["data"]["number"]=str(result["order_id"])
                order_data["data"]["price"]=result["price"]
                order_data["data"]["trip"]={
                    "attraction":{
                        "id":result["attractionId"],
                        "name":result["name"],
                        "address":result['address'],
                        "image":result["url"]
                    },
                    "date":result["date"],
                    "time":result["time"]
                }
                order_data["data"]["contact"]={
                    "name":result["contact_name"],
                    "email":result["contact_email"],
                    "phone":result["contact_number"]
                }
                order_data["data"]["status"]=result["status"]
                return order_data #查詢成功
            else:
                return None    
