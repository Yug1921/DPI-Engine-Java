export default function UploadPanel({ file, setFile }) {
  const onChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  return (
    <div className="bg-bg-800 border border-border rounded-2xl p-4 min-h-[220px]">
      <h3 className="text-2xl font-semibold mb-4">Upload PCAP</h3>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="inline-flex items-center px-4 py-2 rounded bg-accent-500 text-black font-semibold cursor-pointer hover:brightness-110">
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