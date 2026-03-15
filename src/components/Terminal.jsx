import { useState, useEffect, useRef } from "react";

const API_URL = "https://api.algeron.ai";
const API_KEY = "nU3PeuXXwkYVfhBg-OuQiVF-lixycblk1G3vZ_ZKG6c";

export function Terminal() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef(null);

  // Check connection on mount
  useEffect(() => {
    fetch(`${API_URL}/status`, { headers: { Authorization: `Bearer ${API_KEY}` } })
      .then(r => r.json())
      .then(d => setConnected(d.status === "online"))
      .catch(() => setConnected(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const send = async () => {
    if (!input.trim() || thinking) return;
    const text = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    setThinking(true);

    try {
      const res = await fetch(`${API_URL}/terminal`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.response || data.error }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: "Errore di connessione" }]);
    }
    setThinking(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1" style={{ maxHeight: "320px" }}>
        {messages.length === 0 && !thinking && (
          <p className="text-zinc-600 text-xs italic">Scrivi qualcosa...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span className={
              msg.role === "user"
                ? "inline-block bg-white/[0.06] text-white text-xs px-3 py-1.5 rounded-lg max-w-[85%] text-left"
                : "inline-block bg-white/[0.03] text-zinc-300 text-xs px-3 py-1.5 rounded-lg max-w-[85%] text-left whitespace-pre-wrap"
            }>
              {msg.text}
            </span>
          </div>
        ))}
        {thinking && (
          <div className="text-left">
            <span className="inline-block text-zinc-500 text-xs px-3 py-1.5 animate-pulse">...</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <div className={"w-1.5 h-1.5 rounded-full flex-shrink-0 " + (connected ? "bg-emerald-400" : "bg-red-400")} />
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Parla con AlgerON..."
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-white/[0.15] transition-colors" />
        <button onClick={send} className="text-xs text-zinc-500 hover:text-white transition-colors px-2">↵</button>
      </div>
    </div>
  );
}
