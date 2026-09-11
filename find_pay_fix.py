with open(r"C:\Users\DELL\.gemini\antigravity\brain\43d07ceb-ac35-4f27-b581-5177340ca1b8\QA_REPORT_FINAL.md", "r", encoding="utf-8") as f:
    content = f.read()

lines = content.split('\n')
out = []
for i, line in enumerate(lines):
    if "### Category 2: Payments, Billing & Monetization (PAY)" in line:
        for j in range(i, i+150):
            if j < len(lines):
                out.append(lines[j])
                if "### Category 3" in lines[j]:
                    break
        break

with open("pay_bugs.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out))
