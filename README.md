# DPI Engine Java

This project has two parts:

1. A Java DPI engine that reads a PCAP file and analyzes the network traffic.
2. A web app that lets you upload a PCAP file, run the Java engine, and view the result in the browser.

## How It Works

The flow is simple:

1. You upload a `.pcap` file in the frontend.
2. The frontend sends the file to the Node.js backend.
3. The backend saves the file and starts the Java DPI engine.
4. Java reads the PCAP, applies the selected rules, and writes the filtered output.
5. The backend returns the result to the frontend.
6. The frontend shows the summary and gives you a download link.

## Project Parts

```text
src/              Java DPI engine source
out/              Compiled Java classes used by the backend
dpi-web/backend/   Express API that runs Java
dpi-web/frontend/  React web interface
```

## What You Need

- Node.js
- npm
- Java JDK
- A `.pcap` file

## How Java Is Integrated

The backend does not process packets by itself. It calls the Java program instead.

The Java code is compiled into the `out/` folder. The backend then runs a command similar to this:

```text
java -cp <out-folder> Main input.pcap output.pcap
```

The backend also passes optional rules like block app, block IP, block domain, and max packets.

The Java program is responsible for:

- reading the input PCAP
- analyzing the traffic
- applying the DPI rules
- writing the filtered PCAP output
- printing packet and flow stats for the backend to read

## Main Folders

- `src/` is the Java engine.
- `dpi-web/backend/` is the API that talks to Java.
- `dpi-web/frontend/` is the browser UI.
- `out/` must contain the compiled Java classes.

## Run the Project

### 1) Compile Java

From the repository root in Windows PowerShell:

```powershell
$sources = Get-ChildItem .\src -Recurse -Filter *.java | ForEach-Object { $_.FullName }
javac -d .\dpi-web\out $sources
```

### 2) Start the backend

```powershell
cd dpi-web/backend
npm install
npm run dev
```

The backend usually runs on `http://localhost:5000`.

### 3) Start the frontend

Open another terminal:

```powershell
cd dpi-web/frontend
npm install
npm run dev
```

The frontend usually runs on `http://localhost:5173`.

## Simple Notes

- Only `.pcap` files are accepted.
- The backend processes one run at a time.
- `DEMO_MODE=true` makes the backend return sample results without running Java.
- AI insights only work when the backend has a valid `GEMINI_API_KEY` or `GROQ_API_KEY`; otherwise the app shows a local fallback summary.

## If Something Fails

- Check that `java` and `javac` work in your terminal.
- Check that the Java classes were compiled into the folder used by `JAVA_OUT_DIR`.
- Check that the backend is running before opening the frontend.
- If a file is too large, try a smaller PCAP or lower `WEB_MAX_PACKETS`.
