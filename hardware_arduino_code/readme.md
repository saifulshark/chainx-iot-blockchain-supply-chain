# ESP32 IoT Access & Monitoring Module

This folder contains the ESP32 firmware for the IoT hardware component of the supply-chain blockchain project. The device is responsible for RFID-based access control, environmental sensing, GPS tracking, and server-side alerting.

This module is part of the larger system that tracks product movement, monitors physical conditions, and verifies supply-chain events with blockchain-backed data.

--
## Overview

The ESP32 device performs the following tasks:

- Reads RFID cards using the MFRC522 module
- Validates card UID against an authorized list
- Opens a servo-based lock for authorized access
- Triggers a buzzer for unauthorized access
- Measures temperature and humidity using DHT11
- Tracks GPS location through a GPS module
- Hosts a local web dashboard for live monitoring
- Sends alerts to the backend server when unauthorized access or high temperature is detected

This module acts as the physical-layer data collection unit for the smart supply-chain system.

--

## Hardware Components

- ESP32 Development Board
- MFRC522 RFID Reader
- Servo Motor
- DHT11 Sensor
- GPS Module
- Buzzer
- WiFi Router / Access Point
- RFID Tags / Cards

--

## Pin Configuration

| Component | Pin |
|---|---|
| RFID SS | GPIO 5 |
| RFID RST | GPIO 22 |
| Servo Signal | GPIO 13 |
| Buzzer | GPIO 25 |
| DHT11 Data | GPIO 4 |
| GPS RX | GPIO 16 |
| GPS TX | GPIO 17 |

--

## Features

### 1. RFID Access Control
The system reads RFID card IDs and compares them with a predefined authorized list.

If the UID matches an authorized ID:
- access is granted
- servo rotates to unlock
- user is marked as authorized

If the UID does not match:
- buzzer is triggered
- alert is sent to backend
- access is denied

### 2. Temperature Monitoring
The ESP32 reads temperature and humidity from the DHT11 sensor.

If temperature exceeds 35°C:
- a temperature alert is sent to the backend system

### 3. GPS Tracking
The GPS module continuously reads latitude and longitude and sends the values to the web dashboard.

### 4. Local Dashboard
The ESP32 hosts a lightweight HTML dashboard served over WiFi. The dashboard displays:

- last RFID card scanned
- access status
- temperature
- humidity
- GPS coordinates
- list of scanned cards

### 5. Backend Alerts
The firmware sends alerts to a connected backend service using HTTP requests.

--
## How this Hardware-Embedded System Works

RFID Card
   │
   ▼
ESP32 reads UID
   │
   ├── If authorized:
   │       ▼
   │   Servo unlocks
   │   Access granted
   │
   └── If unauthorized:
           ▼
       Buzzer sounds
       Alert sent to backend
       Access denied

Temperature Sensor (DHT11)
   │
   ▼
ESP32 reads temperature and humidity
   │
   └── If temperature > 35°C:
           ▼
       Alert sent to backend

GPS Module
   │
   ▼
ESP32 reads latitude and longitude
   │
   ▼
Live GPS data shown on local dashboard

ESP32 Web Dashboard
   │
   ▼
Displays:
- last scanned card
- access status
- temperature
- humidity
- GPS location
- scanned IDs

Backend Server
   │
   ▼
Stores alerts and monitoring data
   │
   ▼
Supply-chain / blockchain system

## Files in This Folder

- `firmeware.ino` — main ESP32 firmware
- `testing/` — testing logs / test-related files

--

## Authorized RFID IDs

The firmware stores a list of authorized RFID UIDs in the source code:

```cpp
String authorizedUIDs[NUM_AUTH] = {
  "72FFF0CF",
  "E4166D05",
  "F62CEECF"
};
```

These IDs must be replaced with the actual RFID cards used in the project.

---

## Backend URL

The firmware sends requests to a Python backend:

```cpp
String pythonServerURL = "http://192.168.228.111:5000";
```

Update this URL to match your backend server IP and port.

--

## Required Libraries

Install the following libraries in Arduino IDE:

- WiFi
- SPI
- MFRC522
- ESP32Servo
- HTTPClient
- DHT sensor library
- TinyGPS++

--

## Upload Instructions

1. Open Arduino IDE.
2. Select the correct ESP32 board.
3. Install all required libraries.
4. Open `firmeware.ino`.
5. Update the WiFi credentials:

```cpp
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
```

6. Update the backend URL if needed.
7. Compile the program.
8. Upload it to the ESP32 board.

--

## Example Workflow

1. ESP32 connects to WiFi.
2. RFID scanner reads a card.
3. UID is validated.
4. Access is approved or rejected.
5. Temperature and humidity are read.
6. GPS coordinates are updated.
7. Data is displayed on the local dashboard.
8. Alerts are transmitted to the backend server.

--

## Web Dashboard Access

After the device connects to WiFi, open the ESP32 IP address in a browser:

```text
http://<ESP32_IP>
```

You can also query the data endpoint:

```text
http://<ESP32_IP>/data
```

--

## Notes

- WiFi credentials are currently hardcoded and should be replaced in real deployment.
- GPS may take time to acquire a valid fix depending on the location.
- The system is intended for capstone demonstration and local testing.
- For production deployment, sensitive values like WiFi credentials and authorized IDs should be managed securely.

--

## Project Relevance

This hardware module is the physical sensing and verification layer of the supply-chain blockchain project. It supports:

- shipment verification
- access control
- sensor monitoring
- location tracking
- real-time anomaly detection

--

## License

This project is intended for academic and demonstration purposes as part of the capstone project.

--

## Contributor

Capstone Project Team