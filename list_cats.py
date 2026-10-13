with open(r"C:\Users\DELL\.gemini\antigravity\brain\43d07ceb-ac35-4f27-b581-5177340ca1b8\QA_REPORT_FINAL.md", "r", encoding="utf-8") as f:
    lines = f.readlines()
for line in lines:
    if line.startswith("### Category"):
        print(line.strip())
