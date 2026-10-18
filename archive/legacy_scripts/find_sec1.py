with open(r"C:\Users\DELL\.gemini\antigravity\brain\43d07ceb-ac35-4f27-b581-5177340ca1b8\QA_REPORT_FINAL.md", "r", encoding="utf-8") as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines):
    if "#### SEC-01:" in line:
        for j in range(i, i+60):
            print(lines[j])
        break
