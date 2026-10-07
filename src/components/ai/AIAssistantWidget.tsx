"use client";

import { useEffect, useRef, useState } from "react";
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

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [isDragging, setIsDragging] = useState(false);

  const windowRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
  });

  const createMessageId = () => {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  };

  /*
   * ==========================================
   * CALCULATE WINDOW POSITION
   * ==========================================
   */

  const setInitialPosition = () => {
    if (typeof window === "undefined") return;

    const isMobile = window.innerWidth < 768;

    const width = isMobile
      ? window.innerWidth
      : 384;

    const height = isMobile
      ? Math.min(window.innerHeight * 0.85, window.innerHeight)
      : 600;

    const margin = isMobile ? 0 : 32;

    setPosition({
      x: Math.max(
        0,
        window.innerWidth - width - margin
      ),
      y: Math.max(
        0,
        window.innerHeight - height - margin
      ),
    });
  };

  /*
   * ==========================================
   * OPEN WINDOW
   * ==========================================
   */

  useEffect(() => {
    if (!isOpen) return;

    setInitialPosition();

    const handleResize = () => {
      if (!windowRef.current) {
        setInitialPosition();
        return;
      }

      const rect =
        windowRef.current.getBoundingClientRect();

      const maxX = Math.max(
        0,
        window.innerWidth - rect.width
      );

      const maxY = Math.max(
        0,
        window.innerHeight - rect.height
      );

      setPosition((current) => ({
        x: Math.min(
          Math.max(0, current.x),
          maxX
        ),
        y: Math.min(
          Math.max(0, current.y),
          maxY
        ),
      }));
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [isOpen]);

  /*
   * ==========================================
   * AUTO SCROLL
   * ==========================================
   */

  // Initialize visibility from local storage on mount
  useEffect(() => {
    const isHidden = localStorage.getItem('aiWidgetHidden');
    if (isHidden === 'true') {
      setAiWidgetVisible(false);
    }
  }, [setAiWidgetVisible]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [messages, isTyping, isOpen]);

  /*
   * ==========================================
   * DRAG START
   * ==========================================
   */

  const handleDragStart = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (window.innerWidth < 768) return;

    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    if (!windowRef.current) return;

    const rect =
      windowRef.current.getBoundingClientRect();

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
    };

    setIsDragging(true);

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch {
      // Ignore pointer capture errors.
    }
  };

  /*
   * ==========================================
   * DRAG MOVE
   * ==========================================
   */

  const handleDragMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isDragging) return;

    if (!windowRef.current) return;

    const rect =
      windowRef.current.getBoundingClientRect();

    const deltaX =
      event.clientX -
      dragRef.current.startX;

    const deltaY =
      event.clientY -
      dragRef.current.startY;

    const maxX = Math.max(
      0,
      window.innerWidth - rect.width
    );

    const maxY = Math.max(
      0,
      window.innerHeight - rect.height
    );

    const newX = Math.min(
      Math.max(
        0,
        dragRef.current.startLeft + deltaX
      ),
      maxX
    );

    const newY = Math.min(
      Math.max(
        0,
        dragRef.current.startTop + deltaY
      ),
      maxY
    );

    setPosition({
      x: newX,
      y: newY,
    });
  };

  /*
   * ==========================================
   * DRAG END
   * ==========================================
   */

  const handleDragEnd = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    setIsDragging(false);

    try {
      if (
        event.currentTarget.hasPointerCapture(
          event.pointerId
        )
      ) {
        event.currentTarget.releasePointerCapture(
          event.pointerId
        );
      }
    } catch {
      // Ignore pointer release errors.
    }
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
      {!isOpen && (
        <button
          type="button"
          aria-label="Open Rhockstar AI"
          onClick={() => setIsOpen(true)}
          className="
            fixed
            bottom-20
            right-4
            md:bottom-8
            md:right-8
            z-[9999]
            w-14
            h-14
            rounded-full
            flex
            items-center
            justify-center
            bg-gradient-to-r
            from-blue-500
            to-purple-500
            text-white
            shadow-lg
            hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]
            hover:scale-110
            active:scale-95
            transition-all
            duration-200
          "
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div
          ref={windowRef}
          className="
            fixed
            z-[9999]
            w-screen
            md:w-96
            h-[85vh]
            md:h-[600px]
            bg-slate-900
            border
            border-white/10
            rounded-t-2xl
            md:rounded-2xl
            shadow-2xl
            flex
            flex-col
            overflow-hidden
          "
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {/* HEADER */}

          <div
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            className={`
              shrink-0
              p-4
              border-b
              border-white/10
              bg-gradient-to-r
              from-slate-800
              to-slate-900
              flex
              items-center
              justify-between
              select-none
              ${
                isDragging
                  ? "cursor-grabbing"
                  : "md:cursor-grab"
              }
            `}
            style={{
              touchAction: "none",
            }}
          >
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
        </div>
      )}
    </>
  );
}




