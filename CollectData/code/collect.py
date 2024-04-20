import paho.mqtt.client as mqtt
import requests
import logging
import json
# MQTT broker details
broker = "mqtt.docker.local"
port = 1883
topic = "garden/data/#"

# API database details
api_url_get = "http://sqlite.docker.local:8700/get"
api_url_add = "http://sqlite.docker.local:8700/post"

# Configure logging
logging.basicConfig(filename='./logs/mqtt_client.log', level=logging.INFO)
logger = logging.getLogger(__name__)

def on_connect(client, userdata, flags, rc):
    logger.info("Connected with result code "+str(rc))
    client.subscribe(topic)

def on_disconnect(client, userdata, rc):
    logger.info("Disconnected with result code "+str(rc))
    if rc != 0:
        logger.info("Trying to reconnect...")
        client.connect(broker, port)

def on_message(client, userdata, msg):
    
    logger.info(msg.topic+" "+str(msg.payload))
    # Assuming the payload is a JSON object
    data = msg.payload.decode()
    data = json.loads(data)
    try:
        if data["state"] == "on":
            data["state"] = 1
        elif data["state"] == "off":
            data["state"] = 0
        # data messeage reads as {"state": 1, ID : 1, .....}
        logger.info(data)
        print(data)
        response = requests.post(api_url_add, json=data)
        print(response)
        logger.info(response)
        if response.status_code == 200:
            logger.info("Data added to API database successfully")
        else:
            logger.error("Failed to add data to API database")
    except Exception as e:
        logger.error(e)
        print(e)

client = mqtt.Client()
client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_message = on_message

client.connect(broker, port)
print("connected and looping")
logger.info("connected and looping")
client.loop_forever()