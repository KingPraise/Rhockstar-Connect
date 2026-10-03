with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("import React, { useState, useEffect", "import React, { useState, useEffect")
if "createPortal" not in content:
    content = content.replace("import React,", "import React from 'react';\nimport { createPortal } from 'react-dom';\nimport ")

# Replace forwardingMessage start
content = content.replace("{forwardingMessage && (", "{forwardingMessage && typeof window !== 'undefined' && createPortal(")

# Replace forwardingMessage end
content = content.replace("""                {chats.filter(c => c.id !== activeChat?.id).length === 0 && (
                  <p className="text-center text-slate-500 text-sm py-6">No other conversations to forward to</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );""", """                {chats.filter(c => c.id !== activeChat?.id).length === 0 && (
                  <p className="text-center text-slate-500 text-sm py-6">No other conversations to forward to</p>
                )}
              </div>
            </div>
          </div>
        ), document.body)}
      </div>
    );""")

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
