export default function UploadPanel({ file, setFile }) {
  const onChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  return (
    <div className="rounded-[24px] border border-border/80 bg-bg-800/80 p-5 shadow-panel min-h-[220px]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-text-300 mb-1">Capture</div>
          <h3 className="text-2xl font-semibold">Upload PCAP</h3>
        </div>
        <div className="rounded-full border border-border bg-bg-900 px-3 py-1 text-xs text-text-300">
          .pcap / .pcapng
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="inline-flex items-center px-4 py-2 rounded-2xl bg-accent-500 text-black font-semibold cursor-pointer hover:brightness-110 transition">
          Choose File
          <input
            type="file"
            accept=".pcap,.pcapng"
            onChange={onChange}
            className="hidden"
          />
        </label>

        <span className="text-text-200">
          {file ? file.name : "No file selected"}
        </span>
      </div>

      <div className="mt-4 text-sm text-text-300">
        {file ? (
          <>
            <div>Selected: <span className="text-text-100">{file.name}</span></div>
            <div>
              Size:{" "}
              <span className="text-text-100">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </>
        ) : (
          <div>Supported formats: .pcap, .pcapng</div>
        )}
      </div>
    </div>
  );
}