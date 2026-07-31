"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm **Veer** 🚗 your VNR Pool AI assistant. Ask me anything — how to book a ride, how fare split works, safety tips, or anything else!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unknown error');

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format basic markdown (bold)
  const formatText = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  };

  const quickPrompts = [
    "How do I book a ride?",
    "How does fare split work?",
    "How do I offer a ride?",
    "Is it safe?",
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.div
        drag
        dragMomentum={false}
        whileDrag={{ scale: 1.05 }}
        style={{ display: open ? "none" : "flex", touchAction: "none" }}
        className="fixed bottom-[84px] md:bottom-6 right-6 z-[100]"
      >
        <div
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl flex items-center justify-center transition-colors cursor-grab active:cursor-grabbing pointer-events-auto select-none"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6 pointer-events-none" />
          {/* Pulse ring */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-30 animate-ping pointer-events-none" />
        </div>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-[84px] md:bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] h-[520px] max-h-[calc(100vh-100px)] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-blue-50 dark:bg-blue-600/10">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Veer — AI Assistant</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Powered by featherless.ai ✨</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-200/50 dark:border-white/5"
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatText(msg.content) }}
                  />
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1.5 border border-slate-200/50 dark:border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 dark:bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 dark:bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 dark:bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts (only shown when just the initial message) */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                      setTimeout(sendMessage, 50);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-colors font-medium"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-white/5 flex gap-2 items-center">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask Veer anything..."
                className="flex-1 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 border border-slate-200/50 dark:border-white/5 transition-all"
                disabled={loading}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
