import re
with open("src/components/gamification/StardomInfoModal.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace React import with React + createPortal
content = re.sub(r'import\s+\{\s*X,\s*Trophy', 'import { useEffect, useState } from "react";\nimport { createPortal } from "react-dom";\nimport { X, Trophy', content, count=1)

# Ensure createPortal is correctly wrapped
return_match = re.search(r'  return \(\s*<div className="fixed inset-0', content)
if return_match:
    start_idx = return_match.start()
    before = content[:start_idx]
    
    # We need to add mounted state
    mounted_state = """  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
"""
    
    # Find the closing tag for the return statement.
    # We know the file ends with:
    #       </div>
    #     </div>
    #   );
    # }
    after = content[start_idx + 10:] # Skip "  return ("
    after = re.sub(r'  \);\n\}', r'  , document.body);\n}', after)
    
    content = before + mounted_state + after

with open("src/components/gamification/StardomInfoModal.tsx", "w", encoding="utf-8") as f:
    f.write(content)
