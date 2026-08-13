# Measurement Run Log

## Environment
- Windows workspace
- Hardhat projects: `product-tracking/contracts` and `supply-chain-final`
- Backend API: `product-tracking/backend`
- Telegram script: `telegram_Flask_server`

## Commands Run
```powershell
Set-Location 'H:\supply-chain-iot-blockchain\product-tracking\contracts'; npm install --save-dev hardhat-gas-reporter
Set-Location 'H:\supply-chain-iot-blockchain\supply-chain-final'; npm install --save-dev hardhat-gas-reporter
Set-Location 'H:\supply-chain-iot-blockchain\product-tracking\contracts'; npx hardhat test testing\measurement.spec.js
Set-Location 'H:\supply-chain-iot-blockchain\supply-chain-final'; npx hardhat test testing\measurement.spec.js
Set-Location 'H:\supply-chain-iot-blockchain\product-tracking\backend'; node .\testing\hashing_latency_measurement.js
Set-Location 'H:\supply-chain-iot-blockchain\product-tracking\backend'; $env:DISABLE_DB='true'; $env:PORT='5001'; node .\server.js
Set-Location 'H:\supply-chain-iot-blockchain\product-tracking\backend'; $env:BACKEND_BASE_URL='http://127.0.0.1:5001'; node .\testing\network_latency_proxy_measurement.js
Set-Location 'H:\supply-chain-iot-blockchain\telegram_Flask_server'; python -m pip install flask requests
Set-Location 'H:\supply-chain-iot-blockchain\telegram_Flask_server'; $env:TELEGRAM_BOT_TOKEN='7608076027:AAgYDYOc5hT13n0dMwGDm6p_7s8K25b3RSXQ'; $env:TELEGRAM_CHAT_ID='6441453912'; python .\testing\telegram_latency.py
```

## Anomalies
- Port `5000` was already in use, so the backend proxy measurement ran on `5001` with the same backend code path.
- The Python environment initially lacked Flask, so `flask` and `requests` were installed before the Telegram latency run.
- The `DISABLE_DB=true` flag was used for the backend proxy run to keep the measurement focused on the Express endpoint rather than MongoDB connectivity.
- The first backend launch still tried GPS auto-collection because `ESP32_URL` was configured; the server was then updated to skip GPS collection in measurement mode.