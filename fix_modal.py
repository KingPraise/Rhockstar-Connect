with open("src/components/chat/CreateCommunityModal.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import_statement = "import { createPortal } from 'react-dom';\nimport { useEffect, useState } from 'react';\n"
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';")

# Find the start of the return statement
return_start = content.find("return (\n    <div className=\"fixed inset-0")
if return_start != -1:
    before = content[:return_start]
    after = content[return_start + 8:] # skip "return (\n"
    
    # We need to add mounted state
    mounted_state = """
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
"""
    new_content = before + mounted_state + after[:-2] + ");\n}\n" # Close the portal
    
    with open("src/components/chat/CreateCommunityModal.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)
