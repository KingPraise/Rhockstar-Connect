with open("src/lib/auth.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "export const resetPasswordDirect" in line:
        skip = True
    
    if skip and line.startswith("};"):
        skip = False
        continue

    if skip:
        continue

    new_lines.append(line)

content = "".join(new_lines)

import re

# We want to replace the whole catch block in loginUser:
#     } catch (authErr: any) {
#       try {
#         // Check if user recently reset password directly in Firestore
# ...
#       } catch (error: unknown) {
#         return { user: null, error: (error as Error).message };
#       }

# Actually, the simplest is to replace the fallback block with just `throw authErr;`
pattern = re.compile(r'catch \(authErr: any\) \{.*?throw authErr;\n    \}', re.DOTALL)
replacement = r'catch (authErr: any) {\n      throw authErr;\n    }'

content = pattern.sub(replacement, content)

with open("src/lib/auth.ts", "w", encoding="utf-8") as f:
    f.write(content)
