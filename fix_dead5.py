with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

old_form = """          {/* DM Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-slate-900/90 flex items-center gap-3">
            <textarea
              ref={textareaRef}"""

new_form = """          {/* DM Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-slate-900/90 flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors shrink-0"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button 
              type="button" 
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2.5 rounded-xl transition-colors shrink-0 ${isRecording ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse' : 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700'}`}
            >
              {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <textarea
              ref={textareaRef}"""

content = content.replace(old_form, new_form)

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
