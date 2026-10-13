"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Bot,
  Heart,
  Briefcase,
  ChevronDown,
} from "lucide-react";

import { getAIResponse } from "@/lib/services/ai";
import type {
  AIPersona,
  AIMessage,
} from "@/lib/services/ai";

import { useAuthStore } from "@/store/useAuthStore";

export default function AIAssistantWidget() {
  const { aiWidgetVisible, setAiWidgetVisible } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [persona, setPersona] = useState<AIPersona>("career");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Hi! I'm Rhockstar AI. How can I help you level up your career today?",
      timestamp: new Date(),
    },
  ]);

  

  

  const windowRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  

  const createMessageId = () => {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  };

  /*
   * ==========================================
   * CHANGE PERSONA
   * ==========================================
   */

  const handlePersonaChange = (
    newPersona: AIPersona
  ) => {
    if (persona === newPersona) return;

    setPersona(newPersona);

    setMessages([
      {
        id: createMessageId(),
        role: "ai",
        content:
          newPersona === "career"
            ? "You're now talking to Career Coach. I can help with your resume, interviews, job search, career planning, and professional growth."
            : "You're now talking to Dating Wingman. I can help with your dating profile, conversations, openers, and date ideas.",
        timestamp: new Date(),
      },
    ]);
  };

  /*
   * ==========================================
   * SEND MESSAGE
   * ==========================================
   */

  const handleSend = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const text = input.trim();

    if (!text || isTyping) return;

    const userMessage: AIMessage = {
      id: createMessageId(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setIsTyping(true);

    try {
      const response = await getAIResponse(
        persona,
        text
      );

      const aiMessage: AIMessage = {
        id: createMessageId(),
        role: "ai",
        content: response,
        timestamp: new Date(),
      };

      setMessages((previous) => [
        ...previous,
        aiMessage,
      ]);
    } catch (error) {
      console.error(
        "Rhockstar AI error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          id: createMessageId(),
          role: "ai",
          content:
            "Sorry, I couldn't process that right now. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  /*
   * ==========================================
   * CLOSE
   * ==========================================
   */

  const handleClose = () => {
    setIsOpen(false);
    setIsDragging(false);
  };

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
      <>
      <AnimatePresence>
        {!isOpen && (
        <motion.button type="button" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} aria-label="Open Rhockstar AI" onClick={() => setIsOpen(true)} className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-[9999] w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:scale-110 active:scale-95 transition-all duration-200"><Sparkles className="w-6 h-6" /></motion.button>
      )}

      {isOpen && (<motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} drag={typeof window !== "undefined" && window.innerWidth >= 768} dragConstraints={{ left: -1500, right: 0, top: -800, bottom: 0 }} dragElastic={0.1} dragMomentum={false} ref={windowRef} className="fixed z-[9999] w-screen md:w-96 h-[85vh] md:h-[600px] bg-slate-900 border border-white/10 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden bottom-0 md:bottom-24 right-0 md:right-8">
          {/* HEADER */}

          <div className="shrink-0 p-4 border-b border-white/10 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-between select-none md:cursor-grab active:cursor-grabbing" style={{ touchAction: "none" }}>
            <div className="flex items-center gap-3">
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-gradient-to-br
                  from-blue-500
                  to-purple-500
                  flex
                  items-center
                  justify-center
                  p-0.5
                  shrink-0
                "
              >
                <div
                  className="
                    w-full
                    h-full
                    bg-slate-900
                    rounded-full
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white">
                  Rhockstar AI
                </h3>

                <p className="text-xs text-purple-400">
                  Your personal assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close Rhockstar AI"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                handleClose();
              }}
              className="
                w-9
                h-9
                flex
                items-center
                justify-center
                rounded-full
                text-slate-400
                hover:text-white
                bg-white/5
                hover:bg-white/10
                transition-all
              "
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* PERSONA */}

          <div
            className="
              shrink-0
              flex
              gap-2
              p-2
              bg-slate-800/50
              border-b
              border-white/5
            "
          >
            <button
              type="button"
              onClick={() =>
                handlePersonaChange("career")
              }
              className={`
                flex-1
                py-2
                rounded-lg
                text-sm
                font-bold
                flex
                items-center
                justify-center
                gap-2
                transition-all
                ${
                  persona === "career"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:bg-white/5"
                }
              `}
            >
              <Briefcase className="w-4 h-4" />
              Career
            </button>

            <button
              type="button"
              onClick={() =>
                handlePersonaChange("dating")
              }
              className={`
                flex-1
                py-2
                rounded-lg
                text-sm
                font-bold
                flex
                items-center
                justify-center
                gap-2
                transition-all
                ${
                  persona === "dating"
                    ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                    : "text-slate-400 hover:bg-white/5"
                }
              `}
            >
              <Heart className="w-4 h-4" />
              Dating
            </button>
          </div>

          {/* MESSAGES */}

          <div
            className="
              flex-1
              min-h-0
              overflow-y-auto
              p-4
              space-y-4
              custom-scrollbar
              select-text
            "
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`
                    max-w-[85%]
                    rounded-2xl
                    px-4
                    py-3
                    break-words
                    ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5"
                    }
                  `}
                >
                  {message.role === "ai" && (
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />

                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Rhockstar AI
                      </span>
                    </div>
                  )}

                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="
                    bg-slate-800
                    border
                    border-white/5
                    rounded-2xl
                    rounded-tl-sm
                    px-4
                    py-4
                    flex
                    gap-1.5
                    items-center
                  "
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />

                  <span
                    className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                    style={{
                      animationDelay: "150ms",
                    }}
                  />

                  <span
                    className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                    style={{
                      animationDelay: "300ms",
                    }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}

          <form
            onSubmit={handleSend}
            className="
              shrink-0
              p-3
              bg-slate-900
              border-t
              border-white/10
            "
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                placeholder={
                  persona === "career"
                    ? "Ask about your career..."
                    : "Ask about dating..."
                }
                autoComplete="off"
                disabled={isTyping}
                className="
                  w-full
                  bg-slate-800
                  border
                  border-white/10
                  rounded-full
                  pl-4
                  pr-12
                  py-3
                  text-sm
                  text-white
                  focus:outline-none
                  focus:border-purple-500/50
                  focus:ring-1
                  focus:ring-purple-500/50
                  transition-all
                  placeholder:text-slate-500
                  disabled:opacity-60
                "
              />

              <button
                type="submit"
                aria-label="Send message"
                disabled={
                  !input.trim() ||
                  isTyping
                }
                className="
                  absolute
                  right-1.5
                  w-9
                  h-9
                  flex
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-r
                  from-blue-500
                  to-purple-500
                  text-white
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  hover:opacity-90
                  active:scale-95
                  transition-all
                "
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
        )}
      </AnimatePresence>
      </>
  );
}




