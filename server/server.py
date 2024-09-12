# -*- coding: utf-8 -*-
import paho.mqtt.client as mqtt
import database as base

import time
import json

vision = []
sensor = 0 

def on_connect(client,userdata,flags,rc):
    if rc == 0:
        print("Connected with result code 0 (Success)")
    else:
        print(f"Connection failed with result code {rc}")
    client.subscribe("/request/signin") 
    client.subscribe("/request/main/robot/all") 
    client.subscribe("/request/main/alarm/all") 
    client.subscribe("/request/data")
    client.subscribe("/request/data/location/info")
    client.subscribe("/request/data/alarm/one")
    client.subscribe("/request/update/alarm/one")
    client.subscribe("/request/view/alarm")
    client.subscribe("robot_position")
    client.subscribe("aos_pose_detect_result")
    client.subscribe("sensor")
    client.subscribe("ros_cmd/patrol_started")
    client.subscribe("ros_cmd/patrol_done")

def on_message(client,userdata,msg):
    global client9
    global db
    global sensor

    if msg.topic == "/request/signin":
        result = db.signin(msg.payload)
        client9.publish("/response/signin",result)

    elif msg.topic == "robot_position":
        db.insert_robot(msg.payload)

    elif msg.topic == "aos_pose_detect_result":
        message = msg.payload
        jsonmsg = json.loads(message)

        visionjson = db.select_vision_uptime()
        vision = json.loads(visionjson) # type: ignore

        date = time.strftime('%Y-%m-%d %X')

        if (jsonmsg['patient_no'] is None) or (not jsonmsg['patient_no']) or (jsonmsg['patient_no'] == "unknown"):
            return
        
        if (jsonmsg['robot_id'] is None) or (not jsonmsg['robot_id']) or (jsonmsg['robot_id'] == "unknown"):
            return
        
        roonbed = jsonmsg['patient_no'].split('-')
        
        if (jsonmsg['pose'] is None) or (not jsonmsg['pose']) or (jsonmsg['pose'] == "unknown"):
            jsonmsg['pose'] = "none"
            jsonmsg['falldown'] = "true"
            insertjson = json.dumps(jsonmsg)
            db.insert_vision(insertjson,date)

            insertdata = '{"rid":"'+jsonmsg["robot_id"]+'","xaxis":"'+str(int(roonbed[0]))+'","yaxis":"'+str(int(roonbed[1]))
            insertdata += '","content":"down","value":"1"}'
            db.insert_alarm(insertdata)

            sendMessage = '{"rid":"'+jsonmsg["robot_id"]+'","room":"'+roonbed[0]+'","sickbed":"'+roonbed[1]+'","pose":"0","down":"1","uptime":"'+ date+'"}'

            client9.publish("/response/alarm/vision",sendMessage)

            return
        
        else:

            db.insert_vision(msg.payload,date)

            pose = 0
            down = 0
            check = -1

            for i in range(0,len(vision)):
                if(vision[i]['room'] == int(roonbed[0]) and vision[i]['sickbed'] == int(roonbed[1])):
                    check = i
                    break

            if check == -1:
                pose = 0
            else:
                if(vision[check]['pose'] == jsonmsg['pose']):
                    pose = 1
                else:
                    pose = 0

                if(vision[check]['pose'] == "none"):
                    pose = 0

            if pose == 1:
                insertdata = '{"rid":"'+jsonmsg["robot_id"]+'","xaxis":"'+str(int(roonbed[0]))+'","yaxis":"'+str(int(roonbed[1]))
                insertdata += '","content":"pose","value":"'+jsonmsg['pose']+'"}'
                db.insert_alarm(insertdata)

            if jsonmsg["falldown"] == "true":
                down = 1
                insertdata = '{"rid":"'+jsonmsg["robot_id"]+'","xaxis":"'+str(int(roonbed[0]))+'","yaxis":"'+str(int(roonbed[1]))
                insertdata += '","content":"down","value":"1"}'
                db.insert_alarm(insertdata)

            sendMessage = '{"rid":"'+jsonmsg["robot_id"]+'","room":"'+roonbed[0]+'","sickbed":"'+roonbed[1]+'","pose":"'+str(pose)
            sendMessage += '","down":"'+str(down)+'","uptime":"'+ date+'"}'

            client9.publish("/response/alarm/vision",sendMessage)

    elif msg.topic == "sensor":
        message = msg.payload
        jsonmsg = json.loads(message)
        dust = round(float(jsonmsg["fine dust"]),2)
        water = int(jsonmsg["water discovery"])
        fire = int(jsonmsg["fire detection"])
        # distance = int(jsonmsg["distance"])

        xaxis = str(jsonmsg["x"])
        yaxis = str(jsonmsg["y"])

        if (jsonmsg["robot_id"] is None) or (not jsonmsg["robot_id"]):
            jsonmsg["robot_id"] = "MR04"

        if sensor == 20 or dust>0.03 or water == 1 or fire>300:
            date = time.strftime('%Y-%m-%d %X')
            db.insert_sonser(msg.payload,date)

            dust_val =str(dust)
            fire_val = str(fire)

            client9.publish("/response/alarm/sensor",msg.payload)

            if dust > 0.03:
                insertdata = '{"rid":"'+jsonmsg["robot_id"]+'","xaxis":"'+xaxis+'","yaxis":"'+yaxis
                insertdata += '","content":"dust","value":"'+dust_val+'"}'
                db.insert_alarm(insertdata)

            if water == 1:
                insertdata = '{"rid":"'+jsonmsg["robot_id"]+'","xaxis":"'+xaxis+'","yaxis":"'+yaxis
                insertdata += '","content":"water","value":"1"}'
                db.insert_alarm(insertdata)

            if fire > 300:
                insertdata = '{"rid":"'+jsonmsg["robot_id"]+'","xaxis":"'+xaxis+'","yaxis":"'+yaxis
                insertdata += '","content":"fire","value":"'+fire_val+'"}'
                db.insert_alarm(insertdata)

            # if distance == 1:
            #     insertdata = '{"rid":"'+jsonmsg["robot_id"]+'","xaxis":"'+xaxis+'","yaxis":"'+yaxis
            #     insertdata += '","content":"distance","value":"1"}'
            #     db.insert_alarm(insertdata)
            sensor = 0
        else:
            sensor += 1

    elif msg.topic == "ros_cmd/patrol_started":
        jsondata = json.loads(msg.payload)
        
        rid = jsondata["robot_id"]
        xaxis = "-"
        yaxis = "-"
        content = "start"
        value = ""

        insertdata = '{"rid":"'+rid+'","xaxis":"'+xaxis+'","yaxis":"'+yaxis+'","content":"'+content+'","value":"'+value+'"}'
        db.insert_alarm(insertdata)

    elif msg.topic == "ros_cmd/patrol_done":
        jsondata = json.loads(msg.payload)
        
        rid = jsondata["robot_id"]
        xaxis = "-"
        yaxis = "-"
        content = "return"
        value = ""

        insertdata = '{"rid":"'+rid+'","xaxis":"'+xaxis+'","yaxis":"'+yaxis+'","content":"'+content+'","value":"'+value+'"}'
        db.insert_alarm(insertdata)

    elif msg.topic == "/request/main/robot/all":
        result = db.select_robot()
        client9.publish("/response/main/robot/view",result)

    elif msg.topic == "/request/main/alarm/all":
        payload = json.loads(msg.payload.decode('utf-8'))
        hospital_name = payload.get('hospital_name', '')

        result = db.select_alarm(hospital_name)
        client9.publish("/response/main/alarm/view",result)

    elif msg.topic == "/request/data":
        result = db.select_data(msg.payload)
        jsonval = json.loads(msg.payload)
        if(jsonval["type"] == "location"):
            client9.publish("/response/data/location",result)
        elif(jsonval["type"] == "vision"):
            client9.publish("/response/data/vision",result)
        elif(jsonval["type"] == "iot"):
            client9.publish("/response/data/iot",result)

    elif msg.topic == "/request/data/location/info":
        result = db.select_location_info()
        client9.publish("/response/data/location/info",result)

    elif msg.topic == "/request/data/alarm/one":
        result = db.select_alarm_one(msg.payload)
        client9.publish("/response/data/alarm/one",result)

    elif msg.topic == "/request/update/alarm/one":
        db.update_alarm(msg.payload)

    elif msg.topic == "/request/view/alarm":
        result = db.select_view_alarm()
        client9.publish("/response/view/alarm",result)

if __name__ == "__main__":
    db = base.globalDB()

    db.connecter()

    client9 = mqtt.Client()
    client9.on_connect = on_connect
    client9.on_message = on_message
    

    client9.connect("35.223.130.173",1883,60)
    client9.loop_forever()

    