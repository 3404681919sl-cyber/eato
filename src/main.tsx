import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (e: any) {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `<div style="padding:40px;color:#b91c1c;font:14px/1.6 monospace;white-space:pre-wrap;">REACT RENDER ERROR:\n${e?.stack || e?.message || String(e)}</div>`;
  }
  throw e;
}