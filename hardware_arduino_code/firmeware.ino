[7/9/2026 1:59 AM] Tanjm Khan: #include <WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <HTTPClient.h>
#include "DHT.h"
#include <TinyGPS++.h>
#include <HardwareSerial.h>

// ======================= WiFi =======================
const char* ssid = "Tanjim";
const char* password = "12345678";

// ======================= RC522 =======================
#define SS_PIN 5
#define RST_PIN 22
MFRC522 rfid(SS_PIN, RST_PIN);

// ======================= Servo =======================
static const int servoPin = 13;
Servo servo1;

// ======================= Buzzer =====================
#define BUZZER_PIN 25

// ======================= DHT11 =====================
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ======================= GPS =======================
#define RXD2 16
#define TXD2 17
#define GPS_BAUD 9600
HardwareSerial gpsSerial(2);  // UART2
TinyGPSPlus gps;

// ======================= Web server =======================
WiFiServer server(80);

// ======================= RFID Auth =======================
const int NUM_AUTH = 3;
String authorizedUIDs[NUM_AUTH] = {
  "72FFF0CF",
  "E4166D05",
  "F62CEECF"
};
#define MAX_CARDS 50
String uidList[MAX_CARDS];
int uidCount = 0;

// ======================= Python Server =====================
String pythonServerURL = "http://192.168.228.111:5000";

// ======================= Live state (persist across loops) =======================
String lastCardUID = "None";
String accessStatus = "No card scanned yet";
float lastTemp = 0.0;
float lastHum  = 0.0;
String gpsLatStr = "Waiting for fix";
String gpsLngStr = "Waiting for fix";
String gpsDateStr = "";

// ======================= Helper fns (decl) =======================
bool isAuthorized(String uid);
void sendUnauthorizedAlert();
void sendTemperatureAlert(float temp);
void handlePage(WiFiClient &client);
void handleData(WiFiClient &client);
void handleNotFound(WiFiClient &client);

void setup() {
  Serial.begin(115200);

  // ====== RFID setup ======
  SPI.begin();
  rfid.PCD_Init();

  // ====== Servo setup (ESP32-safe) ======
  servo1.setPeriodHertz(50);            // 50 Hz servo signal
  servo1.attach(servoPin, 1000, 2000);  // µs range
  servo1.write(0);

  // ====== Buzzer setup ======
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // ====== DHT setup ======
  dht.begin();

  // ====== GPS setup ======
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);
  Serial.println("GPS Serial Initialized. Waiting for data...");

  // ====== WiFi setup ======
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  server.begin();
}

void loop() {
  // ====== DHT readings (store to globals) ======
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (!isnan(h) && !isnan(t)) {
    lastHum = h;
    lastTemp = t;
  } else {
    Serial.println("Failed to read from DHT sensor!");
  }

  if (lastTemp > 35.0) {
    Serial.println("Temperature above 35°C! Sending alert...");
    sendTemperatureAlert(lastTemp);
    delay(5000); // Avoid multiple alerts
  }

  // ====== RFID reading ======
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String readUID = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
      if (rfid.uid.uidByte[i] < 0x10) readUID += "0";
      readUID += String(rfid.uid.uidByte[i], HEX);
    }
    readUID.toUpperCase();
    Serial.println("Card UID: " + readUID);

    bool authorized = isAuthorized(readUID);
    accessStatus = authorized ? "ACCESS GRANTED" : "ACCESS DENIED";
    lastCardUID = readUID;

    if (authorized) {
      servo1.write(90);
      digitalWrite(BUZZER_PIN, LOW);
      delay(1000);
      servo1.write(0);
    } else {
      digitalWrite(BUZZER_PIN, HIGH);
      sendUnauthorizedAlert();
      delay(2000);
      digitalWrite(BUZZER_PIN, LOW);
    }
[7/9/2026 1:59 AM] Tanjm Khan: // Add to UID list if new
    bool exists = false;
    for (int i = 0; i < uidCount; i++) {
      if (uidList[i] == readUID) { exists = true; break; }
    }
    if (!exists && uidCount < MAX_CARDS) uidList[uidCount++] = readUID;

    rfid.PICC_HaltA();
  }

  // ====== GPS reading (store to globals) ======
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }
  if (gps.location.isValid()) {
    gpsLatStr = String(gps.location.lat(), 6);
    gpsLngStr = String(gps.location.lng(), 6);
  } else {
    gpsLatStr = "Waiting for fix";
    gpsLngStr = "Waiting for fix";
  }
  if (gps.date.isValid()) {
    gpsDateStr = String(gps.date.day()) + "/" + String(gps.date.month()) + "/" + String(gps.date.year());
  }

  // ====== Web server ======
  WiFiClient client = server.available();
  if (client) {
    // Read the first request line safely
    String requestLine = client.readStringUntil('\n');
    requestLine.trim(); // remove \r

    // Optional: drain the rest of the headers quickly (we don't need them)
    unsigned long t0 = millis();
    while (client.available() && (millis() - t0 < 10)) { client.read(); }

    // Parse path from "GET /path HTTP/1.1"
    String path = "/";
    if (requestLine.startsWith("GET ")) {
      int sp1 = requestLine.indexOf(' ');
      int sp2 = requestLine.indexOf(' ', sp1 + 1);
      if (sp1 != -1 && sp2 != -1) {
        path = requestLine.substring(sp1 + 1, sp2);
      }
    }

    if (path.startsWith("/data")) {
      handleData(client);
    } else if (path == "/"  path.startsWith("/index.htm")) {
      handlePage(client);
    } else if (path == "/favicon.ico") {
      handleNotFound(client);
    } else {
      // Any other path serves the main page as a fallback
      handlePage(client);
    }

    delay(1);
    client.stop();
  }
}

// ======================= HTTP Handlers =======================
void handlePage(WiFiClient &client) {
  String html = "<!DOCTYPE html><html lang='en'><head>"
    "<meta charset='utf-8'>"
    "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
    "<title>ESP32 Access Control + GPS</title>"
    "<style>"
    " :root{--bg:#0b1220;--card:#111a2b;--muted:#93a4c4;--text:#e6eefc;--accent:#4da3ff;--ok:#22c55e;--warn:#f59e0b;--bad:#ef4444;--chip:#1a2740}"
    " *{box-sizing:border-box}body{margin:0;font-family:Inter,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:linear-gradient(180deg,#0b1220,#0b1220 60%,#0e1628);color:var(--text)}"
    " .wrap{max-width:980px;margin:24px auto;padding:0 16px}"
    " .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}"
    " .title{font-size:22px;font-weight:700;letter-spacing:.3px}"
    " .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px}"
    " .card{grid-column:span 12;background:var(--card);border:1px solid #1b2740;border-radius:16px;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.25)}"
    " @media(min-width:720px){.span6{grid-column:span 6}.span4{grid-column:span 4}.span8{grid-column:span 8}}"
    " .card h2{margin:0 0 10px;font-size:16px;color:#cfe1ff;font-weight:600}"
    " .row{display:flex;flex-wrap:wrap;gap:10px;margin:6px 0}"
    " .kv{background:var(--chip);border:1px solid #213253;border-radius:12px;padding:10px 12px;display:flex;gap:8px;align-items:center}"
    " .kv span{opacity:.85}"
    " .badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:6px 10px;border-radius:999px;border:1px solid #1e2f50;background:#152341}"
    " .success{border-color:#144d2a;background:#0e2618;color:var(--ok)}"
    " .warn{border-color:#6b5113;background:#231c0a;color:var(--warn)}"
    " .error{border-color:#5d1820;background:#241014;color:var(--bad)}"
    " .list{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:8px;max-height:280px;overflow:auto}"
    " .li{display:flex;justify-content:space-between;gap:10px;align-items:center;background:var(--chip);border:1px solid #223456;padding:10px 12px;border-radius:12px}"
    " .uid{font-family:ui-monospace,SFMono-Regular,Menlo,monospa
[7/9/2026 1:59 AM] Tanjm Khan: ce;font-size:13px;color:#dbe9ff}"
    " .actions{display:flex;gap:8px;align-items:center}"
    " .btn{appearance:none;border:1px solid #28436e;background:#15284a;color:#dbe9ff;border-radius:10px;padding:8px 12px;font-weight:600;font-size:13px;cursor:pointer}"
    " .btn:hover{filter:brightness(1.05)}"
    " .meta{color:var(--muted);font-size:13px;margin-top:4px}"
    " a{color:var(--accent);text-decoration:none}"
    "</style>"
    "</head><body>"
    "<div class='wrap'>"
    "  <div class='header'>"
    "    <div class='title'>ESP32 RFID Access Control + GPS</div>"
    "    <button class='btn' onclick='location.reload()'>Reload</button>"
    "  </div>"

    "  <div class='grid'>"
    "    <div class='card span8'>"
    "      <h2>Session</h2>"
    "      <div class='row'>"
    "        <div class='kv'><strong>Last Card:</strong> <span id='lastCard'>...</span></div>"
    "        <div class='kv'><strong>Status:</strong> <span id='status'>...</span></div>"
    "      </div>"
    "      <div class='meta'>Live updates every 1s.</div>"
    "    </div>"

    "    <div class='card span4'>"
    "      <h2>Environment</h2>"
    "      <div class='row'>"
    "        <span class='badge' id='tempBadge'>🌡 -- °C</span>"
    "        <span class='badge' id='humBadge'>💧 -- %</span>"
    "      </div>"
    "    </div>"

    "    <div class='card span6'>"
    "      <h2>GPS</h2>"
    "      <div class='row'>"
    "        <div class='kv'><strong>Lat:</strong> <span id='lat'>...</span></div>"
    "        <div class='kv'><strong>Lng:</strong> <span id='lng'>...</span></div>"
    "      </div>"
    "      <div class='meta'>Date: <span id='gpsDate'>...</span></div>"
    "      <div class='meta'>"
    "        <a id='mapsLink' target='_blank' rel='noopener'>Open in Maps ↗️</a>"
    "      </div>"
    "    </div>"

    "    <div class='card span6'>"
    "      <h2>All Scanned Cards</h2>"
    "      <ul id='uid-list' class='list'></ul>"
    "    </div>"
    "  </div>"

    "</div>"

    "<script>"
    "function setBadge(el, cls){ el.className='badge '+cls; }"
    "function updateUI(d){"
    "  const lastCard = document.getElementById('lastCard');"
    "  const statusEl = document.getElementById('status');"
    "  const tempBadge = document.getElementById('tempBadge');"
    "  const humBadge = document.getElementById('humBadge');"
    "  const lat = document.getElementById('lat');"
    "  const lng = document.getElementById('lng');"
    "  const gpsDate = document.getElementById('gpsDate');"
    "  const list = document.getElementById('uid-list');"
    "  const mapsLink = document.getElementById('mapsLink');"

    "  lastCard.textContent = d.lastCardUID  'None';"
    "  statusEl.textContent = d.accessStatus  'No card scanned yet';"
    "  const txt = statusEl.textContent.toUpperCase();"
    "  let stCls = '';"
    "  if (txt.indexOf('GRANTED')>-1) stCls='success';"
    "  else if (txt.indexOf('DENIED')>-1) stCls='error';"
    "  setBadge(statusEl, stCls);"

    "  tempBadge.textContent = '🌡 ' + d.temperature.toFixed(1) + ' °C';"
    "  if (d.temperature >= 35) setBadge(tempBadge, 'warn'); else setBadge(tempBadge, 'success');"
    "  humBadge.textContent = '💧 ' + d.humidity.toFixed(1) + ' %';"

    "  lat.textContent = d.gpsLat;"
    "  lng.textContent = d.gpsLng;"
    "  gpsDate.textContent = d.gpsDate  'Waiting';"
    "  if (d.gpsLat.indexOf('Waiting')==-1 && d.gpsLng.indexOf('Waiting')==-1){"
    "    mapsLink.href = 'https://www.google.com/maps?q=' + encodeURIComponent(d.gpsLat+','+d.gpsLng);"
    "    mapsLink.style.pointerEvents='auto'; mapsLink.style.opacity='1';"
    "  } else {"
    "    mapsLink.removeAttribute('href'); mapsLink.style.pointerEvents='none'; mapsLink.style.opacity='.6';"
    "  }"
[7/9/2026 1:59 AM] Tanjm Khan: "  list.innerHTML='';"
    "  (d.uids||[]).forEach(function(item){"
    "    const li = document.createElement('li'); li.className='li';"
    "    const left = document.createElement('span'); left.className='uid'; left.textContent=item.uid;"
    "    const right = document.createElement('span'); right.className='actions';"
    "    const b = document.createElement('span'); b.className='badge '+(item.auth? 'success':'error'); b.textContent=item.auth?'AUTHORIZED':'DENIED';"
    "    right.appendChild(b); li.appendChild(left); li.appendChild(right); list.appendChild(li);"
    "  });"
    "}"

    "async function poll(){"
    "  try{"
    "    const r = await fetch('/data?x=' + Date.now());"  // cache buster
    "    const d = await r.json();"
    "    updateUI(d);"
    "  }catch(e){ console.log(e); }"
    "}"
    "poll(); setInterval(poll, 1000);"
    "</script>"

    "</body></html>";

  client.print(
    "HTTP/1.1 200 OK\r\n"
    "Content-Type: text/html\r\n"
    "Connection: close\r\n\r\n"
  );
  client.print(html);
}

void handleData(WiFiClient &client) {
  String json = "{";
  json += "\"lastCardUID\":\"" + String(lastCardUID) + "\",";
  json += "\"accessStatus\":\"" + String(accessStatus) + "\",";
  json += "\"temperature\":" + String(lastTemp, 2) + ",";
  json += "\"humidity\":" + String(lastHum, 2) + ",";
  json += "\"gpsLat\":\"" + gpsLatStr + "\",";
  json += "\"gpsLng\":\"" + gpsLngStr + "\",";
  json += "\"gpsDate\":\"" + (gpsDateStr.length() ? gpsDateStr : String("Waiting")) + "\",";
  json += "\"uids\":[";
  for (int i = 0; i < uidCount; i++) {
    if (i) json += ",";
    json += "{\"uid\":\"" + uidList[i] + "\",\"auth\":" + String(isAuthorized(uidList[i]) ? "true" : "false") + "}";
  }
  json += "]}";

  client.print(
    "HTTP/1.1 200 OK\r\n"
    "Content-Type: application/json\r\n"
    "Cache-Control: no-store, no-cache, must-revalidate, max-age=0\r\n"
    "Pragma: no-cache\r\n"
    "Connection: close\r\n"
    "Content-Length: " + String(json.length()) + "\r\n\r\n"
  );
  client.print(json);
}

void handleNotFound(WiFiClient &client) {
  client.print(
    "HTTP/1.1 404 Not Found\r\n"
    "Content-Type: text/plain\r\n"
    "Connection: close\r\n\r\n"
  );
  client.print("404 Not Found");
}

// ======================= Helper functions =======================
bool isAuthorized(String uid) {
  for (int i = 0; i < NUM_AUTH; i++) {
    if (uid == authorizedUIDs[i]) return true;
  }
  return false;
}

void sendUnauthorizedAlert() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(pythonServerURL + "/alert");
    int httpResponseCode = http.GET();
    if (httpResponseCode > 0) Serial.println("Unauthorized alert sent!");
    else Serial.println("Error sending alert: " + String(httpResponseCode));
    http.end();
  } else {
    Serial.println("WiFi not connected, cannot send alert");
  }
}

void sendTemperatureAlert(float temp) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String tempURL = pythonServerURL + "/temp_alert?value=" + String(temp);
    http.begin(tempURL);
    int httpResponseCode = http.GET();
    if (httpResponseCode > 0) Serial.println("Temperature alert sent!");
    else Serial.println("Error sending temperature alert: " + String(httpResponseCode));
    http.end();
  } else {
    Serial.println("WiFi not connected, cannot send temperature alert");
  }
}