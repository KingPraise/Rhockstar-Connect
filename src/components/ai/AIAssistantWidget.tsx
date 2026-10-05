"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Heart, Briefcase, ChevronDown } from "lucide-react";
import { getAIResponse, AIPersona, AIMessage } from "@/lib/services/ai";
import { useAuthStore } from "@/store/useAuthStore";

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use global store for visibility instead of local state
  const { aiWidgetVisible, setAiWidgetVisible } = useAuthStore();
  
  const [persona, setPersona] = useState<AIPersona>('career');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: "Hi! I'm Gemini, your Rhockstar Connect AI Assistant. How can I help you level up your career today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const opacityTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize visibility from local storage on mount
  useEffect(() => {
    const isHidden = localStorage.getItem('aiWidgetHidden');
    if (isHidden === 'true') {
      setAiWidgetVisible(false);
    }
  }, [setAiWidgetVisible]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handlePersonaChange = (newPersona: AIPersona) => {
    setPersona(newPersona);
    setMessages([
      {
        id: Date.now().toString(),
        role: 'ai',
        content: newPersona === 'career' 
          ? "Switched to Career Coach! Need help with your resume, interview prep, or job hunt?"
          : "Switched to Dating Wingman! Need advice on your profile, openers, or date ideas?",
        timestamp: new Date()
      }
    ]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    resetOpacityTimer();

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const responseContent = await getAIResponse(persona, userMsg.content);
    
    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: responseContent,
      timestamp: new Date()
    }]);
  };

  const [position, setPosition] = useState({ bottom: 80, right: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startRight: 0, startBottom: 0, hasMoved: false });

  // Load position from local storage
  useEffect(() => {
    const savedPos = localStorage.getItem('aiWidgetPosition');
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos);
        setPosition(parsed);
      } catch (e) {}
    }
  }, []);

  const resetOpacityTimer = () => {
    setOpacity(1);
    if (opacityTimerRef.current) clearTimeout(opacityTimerRef.current);
    opacityTimerRef.current = setTimeout(() => {
      if (!isOpen && !isDragging) {
        setOpacity(0.6);
      }
    }, 3000);
  };

  useEffect(() => {
    resetOpacityTimer();
    return () => {
      if (opacityTimerRef.current) clearTimeout(opacityTimerRef.current);
    };
  }, [isOpen, isDragging, position]); // Reset when position changes too

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      resetOpacityTimer();
      if (!isDragging) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const diffX = dragRef.current.startX - clientX;
      const diffY = dragRef.current.startY - clientY;
      
      if (Math.abs(diffX) > 15 || Math.abs(diffY) > 15) {
        dragRef.current.hasMoved = true;
      }
      
      const newRight = dragRef.current.startRight + diffX;
      const newBottom = dragRef.current.startBottom + diffY;

      setPosition({
        right: newRight,
        bottom: newBottom,
      });
    };

    const handleMouseUp = (e: MouseEvent | TouchEvent) => {
      if (isDragging) {
        setIsDragging(false);
        if (dragRef.current.hasMoved) {
          // Edge Snapping
          setPosition(prev => {
            const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
            const isLeftHalf = clientX < window.innerWidth / 2;
            
            // Safe bounds
            const safeBottom = Math.max(16, Math.min(window.innerHeight - 80, prev.bottom));
            
            const newPos = {
              right: isLeftHalf ? window.innerWidth - 72 : 16, // 72 = 56px width + 16px padding
              bottom: safeBottom
            };
            localStorage.setItem('aiWidgetPosition', JSON.stringify(newPos));
            return newPos;
          });
        }
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    resetOpacityTimer();
    if (isOpen) return;
    setIsDragging(true);
    dragRef.current.hasMoved = false;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragRef.current.startX = clientX;
    dragRef.current.startY = clientY;
    dragRef.current.startRight = position.right;
    dragRef.current.startBottom = position.bottom;
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetOpacityTimer();
    if (!dragRef.current.hasMoved) {
      setIsOpen(true);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAiWidgetVisible(false);
    localStorage.setItem('aiWidgetHidden', 'true');
  };

  if (!aiWidgetVisible) return null;

  return (
    <>
      {/* Floating Action Button */}
      <div 
        id="tour-ai-widget"
        className={`fixed z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100'} ${isDragging ? 'cursor-grabbing' : 'transition-all duration-300 cursor-grab'}`}
        style={{ 
          bottom: `${position.bottom}px`, 
          right: `${position.right}px`, 
          touchAction: 'none',
          opacity: isOpen ? 0 : opacity
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onMouseEnter={resetOpacityTimer}
      >
        <button
          onClick={handleDismiss}
          className={`absolute -top-2 -right-2 bg-slate-800 text-slate-300 hover:text-white rounded-full p-1 border border-white/10 shadow-md z-10 transition-opacity ${opacity < 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          aria-label="Dismiss AI Assistant"
        >
          <X className="w-3 h-3" />
        </button>
        <button
          onClick={handleButtonClick}
          className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.5)] hover:scale-110 transition-transform"
        >
          <Bot className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* Chat Modal */}
      <div className={`fixed bottom-0 md:bottom-8 right-0 md:right-8 w-full md:w-96 h-[85vh] md:h-[600px] bg-slate-900 border border-white/10 md:rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center p-0.5">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white leading-tight">Rhockstar AI</h3>
              <p className="text-xs text-purple-400 font-medium">Powered by Gemini</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Selector */}
        <div className="flex p-2 bg-slate-800/50 gap-2 border-b border-white/5">
          <button 
            onClick={() => handlePersonaChange('career')}
            className={`flex-1 py-1.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${persona === 'career' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Briefcase className="w-4 h-4" /> Career
          </button>
          <button 
            onClick={() => handlePersonaChange('dating')}
            className={`flex-1 py-1.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${persona === 'dating' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Heart className="w-4 h-4" /> Dating
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5'}`}>
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Assistant</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-4 flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-white/10">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full bg-slate-800 border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-500"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-1.5 p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white disabled:opacity-50 transition-opacity hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
