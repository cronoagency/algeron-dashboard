import { useState, useEffect, useRef } from "react";
import * as mqtt from "mqtt/dist/mqtt.min";

const MQTT_URL = "ws://192.168.1.219:9001";
const INPUT_TOPIC = "algeron/terminal/input";
const OUTPUT_TOPIC = "algeron/terminal/output";

export function Terminal() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [thinking, setThinking] = useState(false);
  const clientRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let client;
    try {
      client = mqtt.connect(MQTT_URL, {
        clientId: "dashboard-terminal-" + Date.now(),
        connectTimeout: 5000,
        reconnectPeriod: 5000,
      });
      clientRef.current = client;

      client.on("connect", () => {
        setConnected(true);
        client.subscribe(OUTPUT_TOPIC);
      });

      client.on("message", (topic, payload) => {
        try {
          const data = JSON.parse(payload.toString());
          if (data.type === "thinking") {
            setThinking(true);
          } else if (data.type === "response" || data.type === "error") {
            setThinking(false);
            setMessages(prev => [...prev, { role: "assistant", text: data.text }]);
          }
        } catch (e) {}
      });

      client.on("close", () => setConnected(false));
      client.on("error", () => setConnected(false));
    } catch (e) {
      console.error("MQTT connection error:", e);
    }

    return () => { if (client) client.end(); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const send = () => {
    if (!input.trim() || !clientRef.current) return;
    setMessages(prev => [...prev, { role: "user", text: input }]);
    clientRef.current.publish(INPUT_TOPIC, JSON.stringify({ text: input }));
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1"
        style={{ maxHeight: "280px" }}>
        {messages.length === 0 && !thinking && (
          <p className="text-zinc-600 text-xs italic">Scrivi qualcosa...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span className={
              msg.role === "user"
                ? "inline-block bg-white/[0.06] text-white text-xs px-3 py-1.5 rounded-lg max-w-[85%] text-left"
                : "inline-block bg-white/[0.03] text-zinc-300 text-xs px-3 py-1.5 rounded-lg max-w-[85%] text-left"
            }>
              {msg.text}
            </span>
          </div>
        ))}
        {thinking && (
          <div className="text-left">
            <span className="inline-block text-zinc-500 text-xs px-3 py-1.5 animate-pulse">
              ...
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 items-center">
        <div className={"w-1.5 h-1.5 rounded-full flex-shrink-0 " + (connected ? "bg-emerald-400" : "bg-red-400")} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Parla con AlgerON..."
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-white/[0.15] transition-colors"
        />
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
