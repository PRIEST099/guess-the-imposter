"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";
import { playChatBlip } from "@/lib/sounds";

interface ChatMessage {
  playerId: string;
  nickname: string;
  text: string;
  timestamp: number;
}

export function ChatPanel() {
  const socket = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on("chat:message", (data) => {
      setMessages((prev) => [...prev, data]);
      playChatBlip();
    });

    return () => {
      socket.off("chat:message");
    };
  }, [socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("chat:message", { text: input.trim() });
    setInput("");
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 mb-3 min-h-[200px] max-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="w-8 h-8 text-white/[0.04] mb-3" />
            <p className="text-[9px] text-white/15 font-mono uppercase tracking-wider">No messages yet</p>
            <p className="text-[9px] text-white/8 mt-1 font-mono">Say hello to the lobby</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300 group"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-accent-sky/60 shrink-0 tracking-wide">{msg.nickname}</span>
                <span className="text-[8px] text-white/8 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="text-sm text-white/50 mt-0.5 leading-relaxed break-words">{msg.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className={cn(
        "flex gap-2 p-1.5 rounded-lg border transition-colors duration-300",
        isFocused
          ? "border-accent-sky/15 bg-white/[0.03]"
          : "border-white/[0.06] bg-white/[0.02]"
      )}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type a message..."
          className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-white/50 placeholder:text-white/10 font-mono"
          maxLength={500}
        />
        <Button
          onClick={sendMessage}
          size="sm"
          disabled={!input.trim()}
          className={cn(
            "shrink-0 rounded-lg transition-colors duration-300 h-9 w-9 p-0",
            input.trim()
              ? "bg-accent-sky/10 text-accent-sky/60 hover:bg-accent-sky/20"
              : "bg-white/[0.02] text-white/10"
          )}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
