import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function runDpiAnalysis(formData) {
  try {
    const res = await axios.post(`${API_BASE}/api/dpi/run`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 180000
    });
    return res.data;
  } catch (e) {
    if (e.code === "ECONNABORTED") {
      throw new Error("DPI run timed out. Try a smaller PCAP or fewer block rules.");
    }
    throw e;
  }
}

export function makeDownloadUrl(downloadUrl) {
  if (!downloadUrl) return "";
  if (downloadUrl.startsWith("http")) return downloadUrl;
  return `${API_BASE}${downloadUrl}`;
}

export async function requestDpiInsights(analysis) {
  const res = await axios.post(`${API_BASE}/api/dpi/insights`, analysis, {
    timeout: 60000
  });
  return res.data;
}