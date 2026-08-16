# Telegram Alert Server

This folder contains the Flask-based notification service used by the supply-chain IoT system. It receives alerts from the ESP32 hardware module and forwards those alerts to a Telegram chat using the Telegram Bot API.

The service is responsible for sending security and temperature alerts to the project administrator in real time.

---

## Purpose

The Telegram alert server acts as a communication bridge between the hardware layer and the user.

When the ESP32 detects:
- unauthorized RFID access
- abnormal temperature
- or other security events

it sends an HTTP request to this Flask server, and the server forwards the alert to Telegram.

---

## Features

- Receives alert requests from ESP32
- Sends unauthorized access alerts with captured image
- Sends temperature warning messages
- Uses Telegram Bot API for instant notifications
- Lightweight Flask service for fast deployment
- Supports simple local testing and integration with IoT devices

---

## Endpoints

### 1. Unauthorized Access Alert
```text
GET /alert
```

This endpoint triggers a photo capture and sends the image to Telegram with a caption such as:

```text
Unauthorized RFID detected!
```

### 2. Temperature Alert
```text
GET /temp_alert?value=35.5
```

This sends a Telegram message like:

```text
Alert! Temperature is above 30°C. Current: 35.5°C
```

---

## Workflow

```text
ESP32 device
    │
    ▼
HTTP request to Flask server
    │
    ▼
Flask server validates bot credentials
    │
    ▼
Telegram Bot API sends message/photo
    │
    ▼
User receives alert on Telegram
```

---

## Required Environment Variables

Create a `.env` file or set environment variables before running the server:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

Example:

```bash
export TELEGRAM_BOT_TOKEN=123456:ABCDEF
export TELEGRAM_CHAT_ID=987654321
```

---

## Installation

### 1. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install Flask requests opencv-python
```

> If OpenCV is not needed in your environment, it can be installed conditionally or omitted during local testing.

---

## Run the Server

```bash
python server.py
```

The app will run on:

```text
http://0.0.0.0:5000
```

---

## Example Requests

### Unauthorized alert
```bash
curl http://localhost:5000/alert
```

### Temperature alert
```bash
curl "http://localhost:5000/temp_alert?value=36.2"
```

---

## Notes

- The bot token and chat ID must be valid for Telegram notifications to work.
- The camera must be available for image capture if the alert route is used.
- The project is intended for testing and demonstration in the capstone environment.
- In real-world deployment, credentials should be managed using environment variables and secure config.

---

## Project Role

This server is the communication layer between the IoT hardware and the user. It helps provide real-time monitoring and alerts for:

- security violations
- temperature anomalies
- rapid response to physical events

---

## License

This project is intended for academic and demonstration purposes as part of the capstone project.

---

## Contributor

Capstone Project Team

