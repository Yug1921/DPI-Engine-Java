# DPI Engine Java

A multi-threaded **Deep Packet Inspection (DPI)** engine written in Java, paired with a full-stack web interface that lets you upload a PCAP file, apply filtering rules, and get a rich traffic analysis report with optional AI-powered insights.

---

## Table of Contents

- [What Problem Does This Solve?](#what-problem-does-this-solve)
- [Features](#features)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Compile the Java engine](#2-compile-the-java-engine)
  - [3. Start the backend](#3-start-the-backend)
  - [4. Start the frontend](#4-start-the-frontend)
- [Example Walk-Through](#example-walk-through)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Deployment on Render](#deployment-on-render)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## What Problem Does This Solve?

Network traffic analysis normally requires heavyweight tools like Wireshark or commercial DPI appliances. This project gives you a **lightweight, self-hosted alternative**:

- Network engineers and security researchers can drop a `.pcap` capture file into the web UI and immediately see which applications and domains are in the traffic, without installing anything locally.
- IT administrators can apply block rules (by app, IP, or domain) and download a filtered PCAP that strips out unwanted traffic.
- Students learning about networking can see real DPI output — protocol detection, flow tracking, TLS SNI extraction — through a clean browser interface.

---

## Features

| Feature | Description |
|---|---|
| **Protocol detection** | Identifies HTTP, HTTPS, DNS, TLS, QUIC and more |
| **App classification** | Detects 20+ apps: YouTube, Netflix, WhatsApp, TikTok, Discord, GitHub, Cloudflare, etc. |
| **TLS SNI extraction** | Reads the Server Name Indication field to classify encrypted traffic without decryption |
| **Flow tracking** | Groups packets into bidirectional 5-tuple flows (src IP, dst IP, src port, dst port, protocol) |
| **Block rules** | Filter packets by application, source IP, or domain |
| **Multi-threaded engine** | Reader thread + load-balanced flow-processor threads for fast processing |
| **Filtered PCAP output** | Downloads a new PCAP containing only the packets that passed your rules |
| **AI insights** | Summarises the run with Groq (Llama) or Gemini; falls back to a local heuristic summary when no key is set |
| **Charts & tables** | Bar charts, flow tables, domain tables, and stats cards in the React dashboard |

---

## How It Works

```
Browser (React)
    │  upload .pcap + rules
    ▼
Express API (Node.js)
    │  save file, spawn Java process
    ▼
Java DPI Engine
    │  read PCAP → detect flows → classify apps → apply rules → write filtered PCAP
    │  print report to stdout
    ▼
Express API
    │  parse stdout, call AI provider (optional)
    ▼
Browser
    display charts, domain table, AI insights, download link
```

### Inside the Java engine

1. **PcapReader** reads raw bytes from the `.pcap` file frame by frame.
2. **ReaderWorker** dispatches each packet to one of two load-balanced queues.
3. **FlowProcessorWorker** threads pull from the queues, build `Flow` objects keyed on a `FiveTuple`, and call `AppClassifier` to detect the app type from TLS SNI, DNS hostnames, or port numbers.
4. **RuleEngine** checks every packet against the active block rules. Blocked packets are dropped from the output.
5. **PcapWriter** writes all non-blocked packets to the output file.
6. The engine prints a structured report to stdout which the Node.js backend parses.

---

## Architecture

```
DPI-Engine-Java/
├── src/                        Java DPI engine source
│   ├── Main.java               Entry point, CLI argument parsing
│   └── dpi/
│       ├── classifier/         AppClassifier — SNI → AppType mapping
│       ├── engine/             DPIEngine — orchestrates threads
│       ├── models/             AppType, Flow, FiveTuple
│       ├── packet/             Raw packet model
│       ├── parser/             Packet parsing (Ethernet, IP, TCP/UDP, DNS, TLS)
│       ├── pcap/               PcapReader + PcapWriter
│       ├── rules/              RuleEngine — block by app / IP / domain
│       ├── threading/          ReaderWorker, FlowProcessorWorker, PacketTask
│       └── tls/                TLS record / SNI extraction
├── dpi-web/
│   ├── backend/                Express API
│   │   └── src/
│   │       ├── app.js
│   │       ├── config/         Environment constants
│   │       ├── controllers/    Request handlers
│   │       ├── routes/         API routes
│   │       ├── services/       dpiRunner, aiInsights, reportParser, cleanup
│   │       └── utils/          Path helpers
│   └── frontend/               React + Vite + Tailwind CSS
│       └── src/
│           ├── pages/          DashboardPage, AnalysisPage, ReportsPage
│           ├── components/     UploadPanel, StatsCards, ChartsPanel,
│           │                   DomainsTable, AiInsightsPanel, Sidebar
│           └── services/       API client (axios)
└── out/                        Compiled Java classes (generated by javac)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| DPI Engine | Java 17+, multi-threaded (no external libraries) |
| Backend API | Node.js, Express |
| AI Insights | Groq API (Llama 3) / Google Gemini API (optional) |
| Frontend | React 19, Vite, Tailwind CSS v3, Recharts, Axios |
| Deployment | Render (backend as Web Service, frontend as Static Site) |

---

## Getting Started

### Prerequisites

- **Java JDK 17+** — `java` and `javac` must be on your PATH
- **Node.js 20+** with npm
- A `.pcap` network capture file (e.g. from Wireshark)

### 1. Clone the repository

```bash
git clone https://github.com/Yug1921/DPI-Engine-Java.git
cd DPI-Engine-Java
```

### 2. Compile the Java engine

**Linux / macOS / Git Bash:**

```bash
find src -name "*.java" | xargs javac -d dpi-web/out
```

**Windows PowerShell:**

```powershell
$sources = Get-ChildItem .\src -Recurse -Filter *.java | ForEach-Object { $_.FullName }
javac -d .\dpi-web\out $sources
```

The compiled `.class` files will be placed in `dpi-web/out/`.

### 3. Start the backend

```bash
cd dpi-web/backend
npm install
npm run dev
```

The API listens on **http://localhost:5000** by default.

> Copy `.env.example` to `.env` and fill in any API keys you want to use (see [Environment Variables](#environment-variables)).

### 4. Start the frontend

Open a second terminal:

```bash
cd dpi-web/frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Example Walk-Through

Suppose you captured some home network traffic and saved it as `home.pcap`. Here is what happens when you use DPI Engine Java:

1. **Upload** — drag `home.pcap` onto the upload panel and click **Analyse**.
2. **Processing** — the backend spawns:
   ```
   java -cp dpi-web/out Main uploads/home.pcap generated/filtered_abc123.pcap --max-packets 5000
   ```
3. **Result** — the Java engine prints something like:
   ```
   ╔══════════════════════════════════════════════════════════════╗
   ║                   APPLICATION BREAKDOWN                      ║
   ╠══════════════════════════════════════════════════════════════╣
   ║ YouTube            412   38.2% ###########                   ║
   ║ Google             288   26.7% ########                      ║
   ║ Netflix            190   17.6% #####                         ║
   ║ WhatsApp            98    9.1% ##                            ║
   ║ HTTPS               89    8.3% ##                            ║
   ╚══════════════════════════════════════════════════════════════╝
   ```
4. **Dashboard** — the React UI shows bar charts, a domain table listing every TLS SNI detected, stats cards, and an AI-generated executive summary.
5. **Block & re-run** — select **YouTube** and **Netflix** in the block panel and click **Analyse** again. The filtered PCAP will contain only the remaining traffic, and the stats will update accordingly.
6. **Download** — click **Download filtered PCAP** to save the result.

---

## Environment Variables

Create `dpi-web/backend/.env`:

```env
# Required
PORT=5000
JAVA_OUT_DIR=../../out          # path to compiled Java classes relative to backend/
JAVA_MAIN_CLASS=Main

# Optional – AI insights
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.1-8b-instant

GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.0-flash

# Optional – limits
WEB_MAX_PACKETS=5000            # cap packets per analysis run (0 = unlimited)
DEMO_MODE=false                 # set true to return mock data without running Java
```

> **AI insights are fully optional.** If neither key is set, the app generates a local heuristic summary automatically.

---

## Deployment on Render

Both the backend and the frontend are deployed on [Render](https://render.com).

### Backend — Render Web Service

| Setting | Value |
|---|---|
| **Service type** | Web Service |
| **Root Directory** | `dpi-web/backend` |
| **Environment** | Node |
| **Build Command** | `npm install && cd ../../ && find src -name "*.java" \| xargs javac -d dpi-web/out` |
| **Start Command** | `npm start` |
| **Env var `JAVA_OUT_DIR`** | `../../out` |
| **Env var `GROQ_API_KEY`** | *(set in Render dashboard, do not commit)* |
| **Env var `GEMINI_API_KEY`** | *(set in Render dashboard, do not commit)* |

### Frontend — Render Static Site

| Setting | Value |
|---|---|
| **Service type** | Static Site |
| **Root Directory** | `dpi-web/frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| **Env var `VITE_API_BASE_URL`** | Your deployed backend URL (e.g. `https://dpi-web-backend.onrender.com`) |

> **Note:** Set `VITE_API_BASE_URL` in the Render dashboard for the Static Site so the frontend knows where to reach the API. Add the frontend's Render URL to the backend's CORS allowed origins if you restrict them.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `java: command not found` | Install JDK 17+ and add it to your PATH |
| `Error: Could not find or load main class Main` | Re-run `javac` and confirm `.class` files exist in `dpi-web/out/` |
| Backend starts but returns no data | Set `DEMO_MODE=true` to verify the API works, then check `JAVA_OUT_DIR` |
| Frontend build fails on Render | Ensure `@tailwindcss/postcss` is **not** in `package.json` (it is a Tailwind v4 package incompatible with the v3 config used here) |
| File too large / timeout | Lower `WEB_MAX_PACKETS` (e.g. `2000`) or use a smaller capture |
| AI insights show "local fallback" | Add a valid `GROQ_API_KEY` or `GEMINI_API_KEY` to the backend environment |
| CORS errors in browser | Make sure the backend `BACKEND_BASE_URL` env var matches your deployed backend URL and the frontend points to that URL |

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 Yug1921

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
