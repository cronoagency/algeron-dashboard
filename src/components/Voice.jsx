import { useState, useRef, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://api.algeron.ai";
const API_KEY = import.meta.env.VITE_API_KEY || "";

function encodeWav(samples, sampleRate) {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  w(8, "WAVE"); w(12, "fmt ");
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

export function Voice() {
  const [state, setState] = useState("idle"); // idle, recording, transcribing, thinking, speaking
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("");
  const mediaRecRef = useRef(null);
  const chunksRef = useRef([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const startRec = async () => {
    if (state !== "idle") return;
    chunksRef.current = [];
    setState("recording");
    setStatus("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1 },
      });
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecRef.current = rec;
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        processAudio();
      };
      rec.start();
    } catch (e) {
      setStatus("Mic non disponibile");
      setState("idle");
    }
  };

  const stopRec = () => {
    if (state !== "recording") return;
    const rec = mediaRecRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  };

  const processAudio = async () => {
    setState("transcribing");
    setStatus("Trascrivo...");

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const arrayBuf = await blob.arrayBuffer();
    const actx = new AudioContext({ sampleRate: 16000 });

    let audioBuf;
    try {
      audioBuf = await actx.decodeAudioData(arrayBuf);
    } catch {
      setStatus("Errore audio");
      setState("idle");
      return;
    }

    const pcm = audioBuf.getChannelData(0);
    const wav = encodeWav(pcm, 16000);

    try {
      // Transcribe
      const res = await fetch(`${API_URL}/voice/transcribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "audio/wav" },
        body: wav,
      });
      const data = await res.json();
      const text = data.text;

      if (!text) {
        setStatus("Nessun testo");
        setState("idle");
        return;
      }

      setMessages((prev) => [...prev, { role: "user", text }]);
      setState("thinking");
      setStatus("Penso...");

      // Claude
      const clRes = await fetch(`${API_URL}/terminal`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      const clData = await clRes.json();
      const reply = clData.response || clData.error || "...";

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setState("speaking");
      setStatus("Parlo...");

      // TTS
      const ttsRes = await fetch(`${API_URL}/voice/speak`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: reply }),
      });
      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setState("idle");
        setStatus("");
      };
      audio.play();
    } catch (e) {
      setStatus("Errore: " + e.message);
      setState("idle");
    }
  };

  const orbColor =
    state === "recording"
      ? "from-red-900/80 to-red-950"
      : state === "transcribing" || state === "thinking"
        ? "from-yellow-900/60 to-yellow-950"
        : state === "speaking"
          ? "from-emerald-900/60 to-emerald-950"
          : "from-sky-900/40 to-sky-950";

  const orbGlow =
    state === "recording"
      ? "shadow-red-500/30"
      : state === "transcribing" || state === "thinking"
        ? "shadow-yellow-500/20"
        : state === "speaking"
          ? "shadow-emerald-500/30"
          : "shadow-sky-500/20";

  const orbLabel =
    state === "recording"
      ? "parla"
      : state === "transcribing"
        ? "..."
        : state === "thinking"
          ? "penso"
          : state === "speaking"
            ? "♪"
            : "premi";

  return (
    <div className="flex flex-col h-full items-center">
      {/* Orb */}
      <div
        className={`w-20 h-20 rounded-full bg-gradient-to-br ${orbColor} shadow-lg ${orbGlow} cursor-pointer
          flex items-center justify-center select-none transition-all duration-300
          ${state === "recording" || state === "speaking" ? "animate-pulse" : ""}
          hover:shadow-xl`}
        onMouseDown={startRec}
        onMouseUp={stopRec}
        onTouchStart={startRec}
        onTouchEnd={stopRec}
      >
        <span className="text-[10px] text-white/50 uppercase tracking-widest">
          {orbLabel}
        </span>
      </div>

      {/* Status */}
      <p className="text-[10px] text-zinc-600 mt-2 h-4">{status}</p>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 w-full overflow-y-auto space-y-2 mt-3 pr-1"
        style={{ maxHeight: "240px" }}
      >
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span
              className={
                msg.role === "user"
                  ? "inline-block bg-white/[0.06] text-white text-xs px-3 py-1.5 rounded-lg max-w-[85%] text-left"
                  : "inline-block bg-white/[0.03] text-zinc-300 text-xs px-3 py-1.5 rounded-lg max-w-[85%] text-left whitespace-pre-wrap"
              }
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
