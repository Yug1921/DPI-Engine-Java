# DPI Web Frontend

This is the browser part of the project. It lets you upload a PCAP file, choose block rules, run the analysis, and see the result.

## Simple Flow

1. You upload a `.pcap` file.
2. The frontend sends it to the backend.
3. The backend starts the Java DPI engine.
4. Java reads the file, applies the rules, and creates the filtered output.
5. The backend sends the result back to the frontend.
6. The frontend shows the summary and download link.

## What Java Does

Java is the real DPI engine in this project. It is responsible for:

- reading packet data from the PCAP file
- checking traffic against DPI rules
- filtering or blocking selected apps, IPs, or domains
- writing the output PCAP file
- printing stats that the backend turns into UI data

The web app does not replace the Java engine. It only sends files and rules to Java through the backend.

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

Backend default URL: `http://localhost:5000`

### 3) Start the frontend

Open another terminal:

```powershell
cd dpi-web/frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Important Notes

- Only `.pcap` files are allowed.
- The backend handles one run at a time.
- `DEMO_MODE=true` returns sample data instead of running Java.
- AI insights are optional.
- The dashboard keeps recent results in session storage.

## If Something Breaks

- Check that Java is installed and `javac` works.
- Check that the Java classes were compiled into the folder used by `JAVA_OUT_DIR`.
- Check that the backend is running before opening the frontend.
- If the file is too large, try a smaller PCAP or lower `WEB_MAX_PACKETS`.
