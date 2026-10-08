"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Sparkles,
  Send,
  Bot,
  Heart,
  Briefcase,
  ChevronDown,
} from "lucide-react";

import {
  getAIResponse,
} from "@/lib/services/ai";

import type {
  AIPersona,
  AIMessage,
} from "@/lib/services/ai";

import {
  useAuthStore,
} from "@/store/useAuthStore";

const LAUNCHER_SIZE = 56;

const DRAG_THRESHOLD = 5;

export default function AIAssistantWidget() {
  const {
    aiWidgetVisible,
    setAiWidgetVisible,
  } = useAuthStore();

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    persona,
    setPersona,
  ] =
    useState<AIPersona>(
      "career",
    );

  const [
    input,
    setInput,
  ] = useState("");

  const [
    isTyping,
    setIsTyping,
  ] = useState(false);

  const [
    messages,
    setMessages,
  ] =
    useState<AIMessage[]>([
      {
        id: "welcome",
        role: "ai",
        content:
          "Hi! I'm Rhockstar AI. How can I help you level up your career today?",
        timestamp:
          new Date(),
      },
    ]);

  /*
   * ==========================================
   * OPEN CHAT POSITION
   * ==========================================
   */

  const [
    position,
    setPosition,
  ] = useState({
    x: 0,
    y: 0,
  });

  /*
   * ==========================================
   * CLOSED BUTTON POSITION
   * ==========================================
   */

  const [
    launcherPosition,
    setLauncherPosition,
  ] = useState({
    x: 0,
    y: 0,
  });

  const [
    launcherReady,
    setLauncherReady,
  ] = useState(false);

  /*
   * ==========================================
   * DRAG STATES
   * ==========================================
   */

  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  const [
    isLauncherDragging,
    setIsLauncherDragging,
  ] = useState(false);

  /*
   * ==========================================
   * REFS
   * ==========================================
   */

  const windowRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
  });

  const launcherDragRef =
    useRef({
      startX: 0,
      startY: 0,
      startLeft: 0,
      startTop: 0,
      moved: false,
    });

  /*
   * ==========================================
   * MESSAGE ID
   * ==========================================
   */

  const createMessageId =
    () => {
      return `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
    };

  /*
   * ==========================================
   * INITIAL LAUNCHER POSITION
   * ==========================================
   */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const isMobile =
      window.innerWidth <
      768;

    const rightMargin =
      isMobile
        ? 16
        : 32;

    const bottomMargin =
      isMobile
        ? 80
        : 32;

    setLauncherPosition({
      x: Math.max(
        0,
        window.innerWidth -
          LAUNCHER_SIZE -
          rightMargin,
      ),

      y: Math.max(
        0,
        window.innerHeight -
          LAUNCHER_SIZE -
          bottomMargin,
      ),
    });

    setLauncherReady(
      true,
    );
  }, []);

  /*
   * ==========================================
   * KEEP LAUNCHER INSIDE VIEWPORT
   * ==========================================
   */

  useEffect(() => {
    const handleResize =
      () => {
        setLauncherPosition(
          (current) => {
            const maxX =
              Math.max(
                0,
                window.innerWidth -
                  LAUNCHER_SIZE,
              );

            const maxY =
              Math.max(
                0,
                window.innerHeight -
                  LAUNCHER_SIZE,
              );

            return {
              x: Math.min(
                Math.max(
                  0,
                  current.x,
                ),
                maxX,
              ),

              y: Math.min(
                Math.max(
                  0,
                  current.y,
                ),
                maxY,
              ),
            };
          },
        );
      };

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );
    };
  }, []);

  /*
   * ==========================================
   * WIDGET VISIBILITY
   * ==========================================
   */

  useEffect(() => {
    const isHidden =
      localStorage.getItem(
        "aiWidgetHidden",
      );

    if (
      isHidden === "true"
    ) {
      setAiWidgetVisible(
        false,
      );
    }
  }, [
    setAiWidgetVisible,
  ]);

  /*
   * ==========================================
   * OPEN CHAT NEAR LAUNCHER
   * ==========================================
   */

  const openChat =
    () => {
      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      const isMobile =
        window.innerWidth <
        768;

      const chatWidth =
        isMobile
          ? window.innerWidth
          : 384;

      const chatHeight =
        isMobile
          ? Math.min(
              window.innerHeight *
                0.85,
              window.innerHeight,
            )
          : 600;

      /*
        Mobile remains full-width,
        so horizontal position is 0.
      */
      if (isMobile) {
        setPosition({
          x: 0,

          y: Math.max(
            0,
            window.innerHeight -
              chatHeight,
          ),
        });

        setIsOpen(true);

        return;
      }

      /*
        Center the chat horizontally
        around the floating button.
      */
      let desiredX =
        launcherPosition.x +
        LAUNCHER_SIZE / 2 -
        chatWidth / 2;

      /*
        Prefer opening above the
        launcher if there is room.
      */
      let desiredY =
        launcherPosition.y -
        chatHeight -
        12;

      /*
        If there isn't enough space
        above, try opening below.
      */
      if (
        desiredY < 0
      ) {
        desiredY =
          launcherPosition.y +
          LAUNCHER_SIZE +
          12;
      }

      const maxX =
        Math.max(
          0,
          window.innerWidth -
            chatWidth,
        );

      const maxY =
        Math.max(
          0,
          window.innerHeight -
            chatHeight,
        );

      desiredX =
        Math.min(
          Math.max(
            0,
            desiredX,
          ),
          maxX,
        );

      desiredY =
        Math.min(
          Math.max(
            0,
            desiredY,
          ),
          maxY,
        );

      setPosition({
        x: desiredX,
        y: desiredY,
      });

      setIsOpen(true);
    };

  /*
   * ==========================================
   * CLOSED BUTTON DRAG START
   * ==========================================
   */

  const handleLauncherDragStart =
    (
      event: React.PointerEvent<HTMLButtonElement>,
    ) => {
      if (
        event.pointerType ===
          "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      launcherDragRef.current =
        {
          startX:
            event.clientX,

          startY:
            event.clientY,

          startLeft:
            launcherPosition.x,

          startTop:
            launcherPosition.y,

          moved: false,
        };

      setIsLauncherDragging(
        true,
      );
    };

  /*
   * ==========================================
   * CLOSED BUTTON DRAG
   * ==========================================
   */

  useEffect(() => {
    if (
      !isLauncherDragging
    ) {
      return;
    }

    const handlePointerMove =
      (
        event: PointerEvent,
      ) => {
        const deltaX =
          event.clientX -
          launcherDragRef
            .current.startX;

        const deltaY =
          event.clientY -
          launcherDragRef
            .current.startY;

        /*
          Don't treat tiny accidental
          movements as dragging.
        */
        const distance =
          Math.sqrt(
            deltaX *
              deltaX +
              deltaY *
                deltaY,
          );

        if (
          distance >
          DRAG_THRESHOLD
        ) {
          launcherDragRef.current.moved =
            true;
        }

        if (
          !launcherDragRef
            .current.moved
        ) {
          return;
        }

        const maxX =
          Math.max(
            0,
            window.innerWidth -
              LAUNCHER_SIZE,
          );

        const maxY =
          Math.max(
            0,
            window.innerHeight -
              LAUNCHER_SIZE,
          );

        const newX =
          Math.min(
            Math.max(
              0,
              launcherDragRef
                .current
                .startLeft +
                deltaX,
            ),
            maxX,
          );

        const newY =
          Math.min(
            Math.max(
              0,
              launcherDragRef
                .current
                .startTop +
                deltaY,
            ),
            maxY,
          );

        setLauncherPosition({
          x: newX,
          y: newY,
        });
      };

    const handlePointerUp =
      () => {
        setIsLauncherDragging(
          false,
        );
      };

    window.addEventListener(
      "pointermove",
      handlePointerMove,
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp,
    );

    window.addEventListener(
      "pointercancel",
      handlePointerUp,
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp,
      );

      window.removeEventListener(
        "pointercancel",
        handlePointerUp,
      );
    };
  }, [
    isLauncherDragging,
  ]);

  /*
   * ==========================================
   * CLOSED BUTTON CLICK
   * ==========================================
   */

  const handleLauncherClick =
    (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      /*
        If the pointer actually moved,
        this interaction was a drag,
        not a click.
      */
      if (
        launcherDragRef
          .current.moved
      ) {
        event.preventDefault();

        return;
      }

      openChat();
    };

  /*
   * ==========================================
   * KEEP OPEN CHAT INSIDE VIEWPORT
   * ==========================================
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleResize =
      () => {
        if (
          !windowRef.current
        ) {
          return;
        }

        const rect =
          windowRef.current.getBoundingClientRect();

        const maxX =
          Math.max(
            0,
            window.innerWidth -
              rect.width,
          );

        const maxY =
          Math.max(
            0,
            window.innerHeight -
              rect.height,
          );

        setPosition(
          (current) => ({
            x: Math.min(
              Math.max(
                0,
                current.x,
              ),
              maxX,
            ),

            y: Math.min(
              Math.max(
                0,
                current.y,
              ),
              maxY,
            ),
          }),
        );
      };

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );
    };
  }, [isOpen]);

  /*
   * ==========================================
   * AUTO SCROLL
   * ==========================================
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer =
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView(
          {
            behavior:
              "smooth",

            block:
              "nearest",
          },
        );
      }, 50);

    return () =>
      clearTimeout(timer);
  }, [
    messages,
    isTyping,
    isOpen,
  ]);

  /*
   * ==========================================
   * OPEN CHAT DRAG START
   * ==========================================
   */

  const handleDragStart =
    (
      event: React.PointerEvent<HTMLDivElement>,
    ) => {
      if (
        event.pointerType ===
          "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      if (
        !windowRef.current
      ) {
        return;
      }

      const target =
        event.target as HTMLElement;

      /*
        Don't begin dragging when
        pressing header buttons.
      */
      if (
        target.closest(
          "button",
        )
      ) {
        return;
      }

      const rect =
        windowRef.current.getBoundingClientRect();

      dragRef.current = {
        startX:
          event.clientX,

        startY:
          event.clientY,

        startLeft:
          rect.left,

        startTop:
          rect.top,
      };

      setIsDragging(
        true,
      );

      event.preventDefault();
    };

  /*
   * ==========================================
   * OPEN CHAT GLOBAL DRAG TRACKING
   * ==========================================
   */

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handlePointerMove =
      (
        event: PointerEvent,
      ) => {
        if (
          !windowRef.current
        ) {
          return;
        }

        const rect =
          windowRef.current.getBoundingClientRect();

        const deltaX =
          event.clientX -
          dragRef.current
            .startX;

        const deltaY =
          event.clientY -
          dragRef.current
            .startY;

        const maxX =
          Math.max(
            0,
            window.innerWidth -
              rect.width,
          );

        const maxY =
          Math.max(
            0,
            window.innerHeight -
              rect.height,
          );

        const newX =
          Math.min(
            Math.max(
              0,
              dragRef.current
                .startLeft +
                deltaX,
            ),
            maxX,
          );

        const newY =
          Math.min(
            Math.max(
              0,
              dragRef.current
                .startTop +
                deltaY,
            ),
            maxY,
          );

        setPosition({
          x: newX,
          y: newY,
        });
      };

    const handlePointerUp =
      () => {
        setIsDragging(
          false,
        );
      };

    window.addEventListener(
      "pointermove",
      handlePointerMove,
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp,
    );

    window.addEventListener(
      "pointercancel",
      handlePointerUp,
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp,
      );

      window.removeEventListener(
        "pointercancel",
        handlePointerUp,
      );
    };
  }, [isDragging]);

  /*
   * ==========================================
   * CHANGE PERSONA
   * ==========================================
   */

  const handlePersonaChange =
    (
      newPersona: AIPersona,
    ) => {
      if (
        persona ===
        newPersona
      ) {
        return;
      }

      setPersona(
        newPersona,
      );

      setMessages([
        {
          id:
            createMessageId(),

          role:
            "ai",

          content:
            newPersona ===
            "career"
              ? "You're now talking to Career Coach. I can help with your resume, interviews, job search, career planning, and professional growth."
              : "You're now talking to Dating Wingman. I can help with your dating profile, conversations, openers, and date ideas.",

          timestamp:
            new Date(),
        },
      ]);
    };

  /*
   * ==========================================
   * SEND MESSAGE
   * ==========================================
   */

  const handleSend =
    async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const text =
        input.trim();

      if (
        !text ||
        isTyping
      ) {
        return;
      }

      const userMessage: AIMessage =
        {
          id:
            createMessageId(),

          role:
            "user",

          content:
            text,

          timestamp:
            new Date(),
        };

      setMessages(
        (previous) => [
          ...previous,
          userMessage,
        ],
      );

      setInput("");

      setIsTyping(
        true,
      );

      try {
        const response =
          await getAIResponse(
            persona,
            text,
          );

        const aiMessage: AIMessage =
          {
            id:
              createMessageId(),

            role:
              "ai",

            content:
              response,

            timestamp:
              new Date(),
          };

        setMessages(
          (previous) => [
            ...previous,
            aiMessage,
          ],
        );
      } catch (error) {
        console.error(
          "Rhockstar AI error:",
          error,
        );

        setMessages(
          (previous) => [
            ...previous,

            {
              id:
                createMessageId(),

              role:
                "ai",

              content:
                "Sorry, I couldn't process that right now. Please try again.",

              timestamp:
                new Date(),
            },
          ],
        );
      } finally {
        setIsTyping(
          false,
        );
      }
    };

  /*
   * ==========================================
   * CLOSE CHAT
   * ==========================================
   */

  const handleClose =
    () => {
      setIsOpen(false);

      setIsDragging(
        false,
      );
    };

  /*
   * ==========================================
   * HIDDEN WIDGET
   * ==========================================
   */

  if (
    !aiWidgetVisible
  ) {
    return null;
  }

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <>
      {!isOpen &&
        launcherReady && (
          <button
            type="button"
            aria-label="Open Rhockstar AI"
            onPointerDown={
              handleLauncherDragStart
            }
            onClick={
              handleLauncherClick
            }
            className={`
              fixed
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
              active:scale-95
              transition-shadow
              duration-200
              select-none
              ${
                isLauncherDragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
              }
            `}
            style={{
              left:
                launcherPosition.x,

              top:
                launcherPosition.y,

              touchAction:
                "none",
            }}
          >
            <Sparkles className="w-6 h-6 pointer-events-none" />
          </button>
        )}

      {isOpen && (
        <div
          ref={
            windowRef
          }
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
            left:
              position.x,

            top:
              position.y,
          }}
        >
          {/* HEADER */}

          <div
            onPointerDown={
              handleDragStart
            }
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
                  : "cursor-grab"
              }
            `}
            style={{
              touchAction:
                "none",
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
                  Your personal
                  assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close Rhockstar AI"
              onPointerDown={(
                event,
              ) => {
                event.stopPropagation();
              }}
              onClick={(
                event,
              ) => {
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
                handlePersonaChange(
                  "career",
                )
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
                  persona ===
                  "career"
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
                handlePersonaChange(
                  "dating",
                )
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
                  persona ===
                  "dating"
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
            {messages.map(
              (
                message,
              ) => (
                <div
                  key={
                    message.id
                  }
                  className={`flex ${
                    message.role ===
                    "user"
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
                        message.role ===
                        "user"
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5"
                      }
                    `}
                  >
                    {message.role ===
                      "ai" && (
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="w-3.5 h-3.5 text-purple-400" />

                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Rhockstar
                          AI
                        </span>
                      </div>
                    )}

                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {
                        message.content
                      }
                    </p>
                  </div>
                </div>
              ),
            )}

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
                      animationDelay:
                        "150ms",
                    }}
                  />

                  <span
                    className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                    style={{
                      animationDelay:
                        "300ms",
                    }}
                  />
                </div>
              </div>
            )}

            <div
              ref={
                messagesEndRef
              }
            />
          </div>

          {/* INPUT */}

          <form
            onSubmit={
              handleSend
            }
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
                value={
                  input
                }
                onChange={(
                  event,
                ) =>
                  setInput(
                    event.target
                      .value,
                  )
                }
                placeholder={
                  persona ===
                  "career"
                    ? "Ask about your career..."
                    : "Ask about dating..."
                }
                autoComplete="off"
                disabled={
                  isTyping
                }
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