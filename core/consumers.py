from channels.generic.websocket import AsyncWebsocketConsumer
import json


class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "dashboard"
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        speed = text_data_json["speed"]
        direction = text_data_json["direction"]
        heading = text_data_json["heading"]
        depth = text_data_json["depth"]
        air = text_data_json["air"]
        humidity = text_data_json["humidity"]
        time = text_data_json["time"]
        tide_type = text_data_json["tide_type"]
        tide_time = text_data_json["tide_time"]
        heights = text_data_json["heights"]
        times = text_data_json["times"]
        lat = text_data_json["lat"]
        lon = text_data_json["lon"]
        track = text_data_json["track"]
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "data_pusher",
                "speed": speed,
                "direction": direction,
                "heading": heading,
                "depth": depth,
                "air": air,
                "humidity": humidity,
                "time": time,
                "tide_type": tide_type,
                "tide_time": tide_time,
                "heights": heights,
                "times": times,
                "lat": lat,
                "lon": lon,
                "track": track,
            },
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def data_pusher(self, event):
        speed = event["speed"]
        direction = event["direction"]
        heading = event["heading"]
        depth = event["depth"]
        air = event["air"]
        humidity = event["humidity"]
        time = event["time"]
        tide_type = event["tide_type"]
        tide_time = event["tide_time"]
        heights = event["heights"]
        times = event["times"]
        lat = event["lat"]
        lon = event["lon"]
        track = event["track"]
        await self.send(
            json.dumps(
                {
                    "speed": speed,
                    "direction": direction,
                    "heading": heading,
                    "depth": depth,
                    "air": air,
                    "humidity": humidity,
                    "time": time,
                    "tide_type": tide_type,
                    "tide_time": tide_time,
                    "heights": heights,
                    "times": times,
                    "lat": lat,
                    "lon": lon,
                    "track": track,
                }
            )
        )

    pass
