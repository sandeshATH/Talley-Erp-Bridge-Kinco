# TallyBridge

A bridge between Tally ERP and AI systems.

## How it works

TallyBridge runs as a local server on the same machine as Tally (or anywhere on the same network). It fetches data via Tally's XML API and exposes it as clean JSON endpoints that AI, dashboards, or any HTTP client can read. A built-in web dashboard lets you verify connectivity and download data without writing any code.

## Prerequisites

- Node.js 18+
- Tally ERP 9 or TallyPrime
- Tally XML Server must be enabled (see below)

## Enable Tally XML Server

1. Open Tally
2. Press **F12** → **Configuration**
3. **Advanced Configuration**
4. Set **Enable XML Server** → **Yes**
5. Port: **9011**
6. Accept and restart Tally

## Installation

1. Extract the zip or clone the repo
   ```
   git clone <repo-url>
   cd talley-erp-bridge-kinco
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Copy the environment file
   ```
   cp .env.example .env
   ```
4. Edit `.env` with your Tally details (company name, host, etc.)
5. Start the server
   ```
   npm start
   ```
6. Open the dashboard: **http://localhost:3000**

## Modes

### Local Mode (recommended to start)
Run TallyBridge on the **same PC as Tally**.
```
TALLY_HOST=127.0.0.1
```

### LAN Mode
Run TallyBridge on a **different PC** on the same network.
Find the Tally PC's IP: open Command Prompt → `ipconfig` → look for IPv4 Address.
```
TALLY_HOST=192.168.x.x
```
Make sure the Tally PC's firewall allows inbound connections on port 9011.

### Remote Mode (AI access from the internet)
1. Get a free ngrok token at **https://ngrok.com**
2. In `.env` set:
   ```
   ENABLE_NGROK=true
   NGROK_AUTHTOKEN=your-token-here
   ```
3. Run `npm start` — the terminal will print a public URL like `https://xxxx.ngrok-free.app`
4. Give this URL to your AI assistant or any remote client
5. The URL is also shown in the dashboard footer

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Server health check |
| `GET /api/config` | Current configuration (public) |
| `GET /api/customers` | All customers |
| `GET /api/invoices` | Sales invoices |
| `GET /api/stock` | Stock items |
| `GET /api/vouchers` | Sales vouchers (Day Book) |

Add `?format=excel` or `?format=csv` to any data endpoint to download as a file.

If `API_KEY` is set in `.env`, all `/api/*` routes (except `/api/config`) require the header:
```
x-api-key: your-key-here
```

## Export Files

JSON saves and Excel/CSV exports go to `~/TallyBridge-exports/` by default.
Override with `EXPORT_PATH=/your/path` in `.env`.
