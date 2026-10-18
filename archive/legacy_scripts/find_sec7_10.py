with open(r"C:\Users\DELL\.gemini\antigravity\brain\43d07ceb-ac35-4f27-b581-5177340ca1b8\QA_REPORT_FINAL.md", "r", encoding="utf-8") as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines):
    if "#### SEC-07" in line or "#### SEC-08" in line or "#### SEC-09" in line or "#### SEC-10" in line:
        print(f"--- Found at line {i} ---")
        for j in range(i, i+30):
            if j < len(lines):
                print(lines[j])
                if "#### SEC-" in lines[j] and j > i:
                    break
