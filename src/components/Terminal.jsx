import { useState, useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://api.algeron.ai";
const API_KEY = import.meta.env.VITE_API_KEY || "";

function encodeWav(samples, sampleRate) {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buf);
  const w = (o, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  w(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  w(8, "WAVE");
  w(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  w(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: "audio/wav" });
}

export function Terminal() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef(null);
  const mediaRecRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    fetch(`${API_URL}/status`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })
      .then((r) => r.json())
      .then((d) => setConnected(d.status === "online"))
      .catch(() => setConnected(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const text = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setSending(true);

    try {
      const res = await fetch(`${API_URL}/terminal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      const status = data.injected
        ? "iniettato nella sessione"
        : data.error || "non iniettato";
      setMessages((prev) => [...prev, { role: "system", text: status }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "system", text: "Errore di connessione" },
      ]);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Voice recording
  const startRec = async () => {
    if (recording || sending) return;
    chunksRef.current = [];
    setRecording(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1 },
      });
      const rec = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecRef.current = rec;
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        processAudio();
      };
      rec.start();
    } catch {
      setRecording(false);
    }
  };

  const stopRec = () => {
    if (!recording) return;
    setRecording(false);
    const rec = mediaRecRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  };

  const processAudio = async () => {
    setSending(true);
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const arrayBuf = await blob.arrayBuffer();
    const actx = new AudioContext({ sampleRate: 16000 });

    let audioBuf;
    try {
      audioBuf = await actx.decodeAudioData(arrayBuf);
    } catch {
      setSending(false);
      return;
    }

    const pcm = audioBuf.getChannelData(0);
    const wav = encodeWav(pcm, 16000);

    try {
      const res = await fetch(`${API_URL}/voice/transcribe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "audio/wav",
        },
        body: wav,
      });
      const data = await res.json();
      if (data.text) {
        setMessages((prev) => [
          ...prev,
          { role: "user", text: `🎤 ${data.text}` },
          {
            role: "system",
            text: data.injected
              ? `iniettato (${data.elapsed}s)`
              : "trascritto ma non iniettato",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "system", text: "nessun testo rilevato" },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "system", text: "errore voice: " + e.message },
      ]);
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1"
        style={{ maxHeight: "320px" }}
      >
        {messages.length === 0 && !sending && (
          <p className="text-zinc-600 text-xs italic">
            Scrivi o tieni premuto 🎤 per parlare...
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === "user"
                ? "text-right"
                : msg.role === "system"
                  ? "text-center"
                  : "text-left"
            }
          >
            <span
              className={
                msg.role === "user"
                  ? "inline-block bg-white/[0.06] text-white text-xs px-3 py-1.5 rounded-lg max-w-[85%] text-left"
                  : msg.role === "system"
                    ? "inline-block text-zinc-600 text-[10px] px-2 py-1"
                    : "inline-block bg-white/[0.03] text-zinc-300 text-xs px-3 py-1.5 rounded-lg max-w-[85%] text-left whitespace-pre-wrap"
              }
            >
              {msg.text}
            </span>
          </div>
        ))}
        {sending && (
          <div className="text-center">
            <span className="inline-block text-zinc-500 text-xs px-3 py-1.5 animate-pulse">
              ...
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <div
          className={
            "w-1.5 h-1.5 rounded-full flex-shrink-0 " +
            (connected ? "bg-emerald-400" : "bg-red-400")
          }
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Parla con AlgerON..."
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[16px] text-white placeholder-zinc-600 outline-none focus:border-white/[0.15] transition-colors"
        />
        <button
          onMouseDown={startRec}
          onMouseUp={stopRec}
          onTouchStart={startRec}
          onTouchEnd={stopRec}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            recording
              ? "bg-red-500/30 text-red-300 animate-pulse"
              : "bg-white/[0.04] text-zinc-500 hover:text-white hover:bg-white/[0.08]"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </button>
        <button
          onClick={send}
          className="text-xs text-zinc-500 hover:text-white transition-colors px-2"
        >
          ↵
        </button>
      </div>
    </div>
  );
}
