import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/lib/base44Client";
import { motion } from "framer-motion";
import { Send, Loader2, Bot, User, Sparkles, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";

const SUGGESTED = [
  "Show me all active recalls this month",
  "Summarize recent findings for Amoxicillin",
  "Which batches have a high diversion score?",
  "List pending incidents in Kano",
  "How many verified counterfeits are there?",
  "What are the most recent suspicious scan events?",
];

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  const citations = !isUser && Array.isArray(msg.citations) ? msg.citations : [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center border ${
        isUser
          ? "bg-emerald-500/15 border-emerald-500/30"
          : "bg-violet-500/15 border-violet-500/30"
      }`}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-emerald-400" />
          : <Bot className="w-3.5 h-3.5 text-violet-400" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
        isUser
          ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-100 rounded-tr-sm"
          : "bg-white/[0.04] border border-white/[0.08] text-gray-200 rounded-tl-sm"
      }`}>
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div className="prose prose-invert prose-xs max-w-none
            [&>p]:mb-2 [&>p:last-child]:mb-0
            [&>ul]:mb-2 [&>ul]:pl-3 [&>ul>li]:mb-0.5 [&>ul>li]:text-gray-300
            [&>ol]:mb-2 [&>ol]:pl-3 [&>ol>li]:mb-0.5 [&>ol>li]:text-gray-300
            [&>strong]:text-white [&>h3]:text-white [&>h3]:text-xs [&>h3]:font-bold [&>h3]:mb-1">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
        {citations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/[0.08]">
            <p className="text-[9px] uppercase tracking-wider text-violet-400/90 mb-1.5">Sources (verified)</p>
            <ul className="text-[10px] text-gray-500 space-y-1 pl-0 list-none">
              {citations.map((c, j) => (
                <li key={`${c.entity}-${c.id}-${j}`} className="flex flex-wrap gap-x-1.5 gap-y-0">
                  <span className="text-gray-300">{c.label}</span>
                  <span className="text-gray-600 font-mono text-[9px]">{c.entity}</span>
                  <span className="text-gray-600 font-mono text-[9px] truncate max-w-[140px]" title={c.id}>{c.id}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className={`text-[9px] mt-1.5 ${isUser ? "text-emerald-400/50 text-right" : "text-gray-600"}`}>
          {msg.timestamp}
        </p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
      <div className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center border bg-violet-500/15 border-violet-500/30">
        <Bot className="w-3.5 h-3.5 text-violet-400" />
      </div>
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div key={i} animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
            className="w-1.5 h-1.5 rounded-full bg-gray-500" />
        ))}
      </div>
    </motion.div>
  );
}

export default function InspectorAIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello, Inspector. I pull answers from your live data using targeted queries, then cite the exact records used. Ask me anything — for example:\n\n- *\"Show me all active recalls this month\"*\n- *\"Summarize recent findings for Amoxicillin\"*\n- *\"Which batches are flagged in Kano?\"*",
      timestamp: "Now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const timestamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const sendMessage = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");

    const userMsg = { role: "user", content: q, timestamp: timestamp() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const history = messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0);

    const response = await base44.functions.invoke("inspectorAI", {
      question: q,
      history: history.map(m => ({ role: m.role, content: m.content })),
    });

    const answer = response.data?.answer || "Sorry, I couldn't retrieve an answer. Please try again.";
    const citations = Array.isArray(response.data?.citations) ? response.data.citations : [];
    setMessages(prev => [...prev, { role: "assistant", content: answer, citations, timestamp: timestamp() }]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared. How can I help you, Inspector?",
      timestamp: timestamp(),
    }]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Inspector AI</p>
            <p className="text-[9px] text-gray-500">Tool-routed data · Verified sources</p>
          </div>
        </div>
        <button onClick={clearChat} aria-label="Clear chat"
          className="text-gray-600 hover:text-gray-300 transition-colors">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts — only when just the welcome msg */}
      {messages.length === 1 && !loading && (
        <div className="px-4 pb-3 shrink-0">
          <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-2">Suggested</p>
          <div className="flex flex-col gap-1.5">
            {SUGGESTED.slice(0, 4).map((s) => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-left text-[11px] text-gray-400 hover:text-emerald-400 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about incidents, recalls, batches..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-violet-500/40 transition-colors disabled:opacity-50 min-h-[40px] max-h-24"
            style={{ scrollbarWidth: "none" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 shrink-0 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            {loading
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send className="w-3.5 h-3.5 text-white" />
            }
          </button>
        </div>
        <p className="text-[9px] text-gray-700 mt-1.5 text-center">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}