with open("src/app/error.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_error = """          <h2 className="text-2xl font-extrabold mb-2">Connecting to Feed...</h2>
          <p className="text-slate-400 max-w-sm text-sm mb-6">
            Syncing your session with Rhockstar Connect.
          </p>

          <button 
            onClick={() => reset()}
            className="px-6 py-3 bg-brand hover:bg-brand/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Feed</span>
          </button>"""

new_error = """          <h2 className="text-2xl font-extrabold mb-2">Something went wrong</h2>
          <p className="text-slate-400 max-w-sm text-sm mb-6">
            An unexpected error occurred while loading this page.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={() => reset()}
              className="px-6 py-3 bg-brand hover:bg-brand/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <a 
              href="/feed"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <span>Go to Feed</span>
            </a>
          </div>"""

content = content.replace(old_error, new_error)

with open("src/app/error.tsx", "w", encoding="utf-8") as f:
    f.write(content)
