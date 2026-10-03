with open(r"C:\Users\DELL\.gemini\antigravity\brain\43d07ceb-ac35-4f27-b581-5177340ca1b8\QA_REPORT_FINAL.md", "r", encoding="utf-8") as f:
    content = f.read()

import re
# Find the SEC section or just grep for the first few bugs
lines = content.split('\n')
for i, line in enumerate(lines):
    if "Unauthenticated Remote Database Wipe" in line:
        print(f"Found around line {i}")
        # print 50 lines around it
        for j in range(max(0, i-5), min(len(lines), i+20)):
            print(lines[j])
        break
