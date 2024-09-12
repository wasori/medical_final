# -*- coding: utf-8 -*-

import pymysql
import json

class globalDB:
    connecter = "" # type: ignore
    cursors = "" 

    def connecter(self):
        self.connecter = pymysql.connect(host="1.220.178.46", port=3306, user="atsol", passwd="1234", db="minam", charset="utf8")
        self.cursors = self.connecter.cursor()
        print("DB connected successfully")
        

    def signin(self,values):
        
        quarry = ""
        receive = ""
        result = {}

        jsonvalue = json.loads(values)

        quarry = "SELECT id, hos_name FROM admin_info_tb WHERE id=%s AND pw=%s"
        
        if self.cursors =="":
            print("DB not connect")
            return 
        else:
            self.cursors.execute(quarry, (jsonvalue["id"], jsonvalue["pw"])) # type: ignore
            receive = self.cursors.fetchall() # type: ignore

        if receive: # type: ignore
            result = {"success": 1, "hos_name": receive[0][1]}
        else:
            result = {"success": 0}

        return json.dumps(result)
    
    def select_robot(self):

        quarry = ""
        receive = ""
        items = []

        quarry = "SELECT * FROM robot_data_tb WHERE (rid, uptime) in (SELECT rid, max(uptime) FROM robot_data_tb GROUP BY rid) ORDER BY rid ASC"

        if self.cursors =="":
            print("DB not connect")
            return 
        else:
            self.cursors.execute(quarry) # type: ignore
            receive = self.cursors.fetchall() # type: ignore
            for row in receive:
                items.append({'rid':row[1],'xaxis':row[2],'yaxis':row[3],'yaw':row[4],'uptime':row[5]})

        jsondata = json.dumps(items,default=str)
        return jsondata
    
    def select_alarm_one(self, values):
        quarry = ""
        receive = ""
        items = []

        quarry = "SELECT * FROM alarm_data_tb where num=%s"

        if self.cursors =="":
            print("DB not connect")
            return 
        else:
            self.cursors.execute(quarry, values) # type: ignore
            receive = self.cursors.fetchall() # type: ignore
            for row in receive:
                items.append({'num':row[0],'rid':row[1],'xaxis':row[2],'yaxis':row[3],'content':row[4],'value':row[5],'check':row[6],'uptime':row[7],'comment':row[8]})
    
        jsondata = json.dumps(items,default=str)
        return jsondata
    
    def select_alarm(self, hospital_name):
        try:
            quarry = ""
            receive = ""
            items = []
    
            quarry = f"SELECT * FROM alarm_data_tb WHERE hos_name = '{hospital_name}' ORDER BY num DESC limit 14;"

            if self.cursors =="":
                print("DB not connect")
                return 
            else:
                self.cursors.execute(quarry) # type: ignore
                receive = self.cursors.fetchall() # type: ignore 
                for row in receive:
                    items.append({'num':row[0],'rid':row[1],'xaxis':row[2],'yaxis':row[3],'content':row[4],'value':row[5],'check':row[6],'uptime':row[7]})

            jsondata = json.dumps(items,default=str)
            return jsondata
        except Exception as e:
            print(f"Error : {e}")
    
    def select_view_alarm(self):

        quarry = ""
        receive = ""
        items = []

        quarry = "SELECT * FROM alarm_data_tb where (content,uptime) in (select content, max(uptime) uptime"
        quarry += " from alarm_data_tb group by content)"

        if self.cursors =="":
            print("DB not connect")
            return 
        else:
            self.cursors.execute(quarry) # type: ignore
            receive = self.cursors.fetchall() # type: ignore
            for row in receive:
                items.append({'num':row[0],'rid':row[1],'xaxis':row[2],'yaxis':row[3],'content':row[4],'value':row[5],'comment':row[6],'check':row[7],'uptime':row[8]})

        jsondata = json.dumps(items,default=str)
        return jsondata
    
    def select_data(self,values):

        jsonvalue = json.loads(values)

        typeval = jsonvalue["type"]
        day = jsonvalue["date"]

        quarry = ""
        receive = ""
        items = []

        if(typeval == "location"):
            quarry = "SELECT * FROM robot_data_tb WHERE DATE(uptime) = DATE('"+day+"') ORDER BY uptime DESC limit 20"
        elif(typeval == "vision"):
            quarry = "SELECT * FROM alarm_data_tb WHERE (content='pose' OR content='down') AND date(uptime) =  DATE('"+day+"') ORDER BY uptime DESC limit 20" 
        elif(typeval == "iot"):
            quarry = "SELECT * FROM sensor_data_tb WHERE DATE(uptime) = DATE('"+day+"') ORDER BY uptime DESC limit 20"
        
        if self.cursors =="":
            print("DB not connect")
            return 
        else:
            self.cursors.execute(quarry) # type: ignore
            receive = self.cursors.fetchall() # type: ignore
            if(typeval == "location"):
                for row in receive:
                    items.append({'rid':row[1],'xaxis':row[2],'yaxis':row[3],'uptime':row[4]})

            elif(typeval == "vision"):
                for row in receive:
                    items.append({'rid':row[1],'room':row[2],'sickbed':row[3],'content':row[4],'uptime':row[7]})

            elif(typeval == "iot"):
                for row in receive:
                    items.append({'rid':row[1],'xaxis':row[2],'yaxis':row[3],'dust':row[4],'water':row[5],'fire':row[6],'uptime':row[7]})
            
        jsondata = json.dumps(items,default=str)
        return jsondata
    
    def select_location_info(self):
        items = []
        quarry = "SELECT * FROM location_info_tb"

        if self.cursors =="":
            print("DB not connect")
            return 
        else:
            self.cursors.execute(quarry) # type: ignore
            receive = self.cursors.fetchall() # type: ignore

            for row in receive:
                items.append({'room':row[3],'sickbed':row[4],'xaxis':row[1],'yaxis':row[2]})

        jsondata = json.dumps(items,default=str)
        return jsondata
    
    def select_vision_uptime(self):
        items = []

        quarry = "SELECT * FROM vision_data_tb v WHERE v.uptime in (SELECT MAX(uptime) uptime FROM vision_data_tb "
        quarry += "GROUP BY room, sickbed) ORDER BY room ASC, sickbed ASC"

        if self.cursors =="":
            print("DB not connect")
            return 
        else:
            self.cursors.execute(quarry) # type: ignore
            receive = self.cursors.fetchall() # type: ignore

            for row in receive:
                items.append({'rid':row[1],'room':row[2],'sickbed':row[3],'pose':row[4],'down':row[5],'uptime':row[6]})

        jsondata = json.dumps(items,default=str)
        return jsondata

    def insert_robot(self,values):
        json_value = json.loads(values)

        quarry = ""
        quarry = "insert into robot_data_tb(rid,xaxis,yaxis) values(%s,%s,%s)"

        rid = json_value["robot_id"]
        
        if rid == "" or rid == "/":
            rid = "MR04"

        xaxis = json_value["x"]
        yaxis = json_value["y"]
        # yaw = json_value["yaw"]
        # yaw = 90

        arr = (rid,xaxis,yaxis)

        if self.cursors =="":
            print("DB not connect")
            self.connecter.rollback() # type: ignore
            return 
        
        else:
            self.cursors.execute(quarry, arr) # type: ignore
            self.connecter.commit() # type: ignore

    def insert_vision(self,values,date):
        json_value = json.loads(values)

        quarry = ""
        quarry = "insert into vision_data_tb(rid,room,sickbed,pose,down,uptime) values(%s,%s,%s,%s,%s,%s)"

        downval = 0
    
        rid = json_value["robot_id"]
        patient = json_value["patient_no"]
        pose = json_value["pose"]
        down = json_value["falldown"]

        roombed = patient.split('-')

        if down == "true":
            downval = 1

        arr = (rid,roombed[0],roombed[1],pose,downval,date)

        if self.cursors =="":
            print("DB not connect")
            self.connecter.rollback() # type: ignore
            return 
        else:
            self.cursors.execute(quarry,arr) # type: ignore
            self.connecter.commit() # type: ignore

    def insert_sonser(self,values,date):

        json_value = json.loads(values)

        quarry = ""
        quarry = "insert into sensor_data_tb(rid,xaxis,yaxis,dust,water,fire,uptime) values(%s,%s,%s,%s,%s,%s,%s)";
    
        rid = json_value["robot_id"]
        dust = round(float(json_value["fine dust"]),2)
        water = json_value["water discovery"]
        fire = json_value["fire detection"]
        # distance = json_value["distance"]
        xaxis = json_value["x"]
        yaxis = json_value["y"]

        arr = (rid,xaxis,yaxis,dust,water,fire,date)

        if self.cursors =="":
            print("DB not connect")
            self.connecter.rollback() # type: ignore
            return 
        else:
            self.cursors.execute(quarry,arr) # type: ignore
            self.connecter.commit() # type: ignore
    

    def insert_alarm(self,values):
        json_value = json.loads(values)

        quarry = ""
        quarry = "insert into alarm_data_tb(rid,xaxis,yaxis,content"

        rid = json_value["rid"]
        xaxis = json_value["xaxis"]
        yaxis= json_value["yaxis"]
        content = json_value["content"]
        value = json_value["value"]

        arr = ""

        if json_value["value"] != "":
            quarry+=",value) values(%s,%s,%s,%s,%s)"
            arr = (rid,xaxis,yaxis,content,value)
        else:
            quarry+=") values(%s,%s,%s,%s)"
            arr = (rid,xaxis,yaxis,content)

        if self.cursors =="":
            print("DB not connect")
            self.connecter.rollback() # type: ignore
            return 
        else:
            self.cursors.execute(quarry,arr) # type: ignore
            self.connecter.commit() # type: ignore

    def update_alarm(self, values):
        jsonvalue = json.loads(values)

        quarry = ""

        quarry = "UPDATE alarm_data_tb SET comment=%s,oncheck=%s WHERE num=%s"

        num = jsonvalue["num"]
        comment = jsonvalue["comment"]

        arr = (comment,1,num)

        if self.cursors =="":
            print("DB not connect")
            self.connecter.rollback() # type: ignore
            return 
        
        else:
            self.cursors.execute(quarry, arr) # type: ignore
            self.connecter.commit() # type: ignore
    
    def disconnecter(self):
        self.connecter.close() # type: ignore
        print("DB disconnect")
