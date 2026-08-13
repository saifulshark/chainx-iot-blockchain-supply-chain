# import cv2
# import requests
# from flask import Flask, request

# app = Flask(name)

# BOT_TOKEN = "7608076027:AAGdYOc5hT13n0dMwGDm6p_7s8K25b3RSXQ"
# CHAT_ID = "6441453912"

# def take_photo(filename="intruder.jpg"):
#     cap = cv2.VideoCapture(0)
#     ret, frame = cap.read()
#     if ret:
#         cv2.imwrite(filename, frame)
#     cap.release()

# def send_photo(filename="intruder.jpg", caption="Unauthorized RFID detected!"):
#     url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto"
#     files = {'photo': open(filename, 'rb')}
#     data = {'chat_id': CHAT_ID, 'caption': caption}
#     requests.post(url, files=files, data=data)

# @app.route("/alert", methods=["GET"])
# def alert():
#     take_photo()
#     send_photo()
#     return "Alert sent!", 200

# # 🔴 Temperature alert route
# @app.route("/temp_alert", methods=["GET"])
# def temp_alert():
#     temp = request.args.get("value", "0")
#     message = f⚠️ Alert! Temperature is above 30°C. Current: {temp}°C"
#     url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
#     data = {'chat_id': CHAT_ID, 'text': message}
#     requests.post(url, data=data)
#     return "Temperature alert sent!", 200

# if name == "main":
#     app.run(host="0.0.0.0", port=5000)
import os
import requests
from flask import Flask, request

try:
    import cv2
except ImportError:  # pragma: no cover - optional for measurement scripts
    cv2 = None

app = Flask(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")


def take_photo(filename="intruder.jpg"):
    if cv2 is None:
        raise RuntimeError("OpenCV is not installed")

    cap = cv2.VideoCapture(0)
    try:
        ret, frame = cap.read()
        if ret:
            cv2.imwrite(filename, frame)
    finally:
        cap.release()


def send_photo(filename="intruder.jpg", caption="Unauthorized RFID detected!"):
    if not BOT_TOKEN or not CHAT_ID:
        raise RuntimeError("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set")

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto"
    with open(filename, "rb") as photo_file:
        files = {"photo": photo_file}
        data = {"chat_id": CHAT_ID, "caption": caption}
        requests.post(url, files=files, data=data, timeout=30)


@app.route("/alert", methods=["GET"])
def alert():
    take_photo()
    send_photo()
    return "Alert sent!", 200


@app.route("/temp_alert", methods=["GET"])
def temp_alert():
    temp = request.args.get("value", "0")
    message = f"Alert! Temperature is above 30°C. Current: {temp}°C"
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    data = {"chat_id": CHAT_ID, "text": message}
    requests.post(url, data=data, timeout=30)
    return "Temperature alert sent!", 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)