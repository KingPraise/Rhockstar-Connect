import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

REPO_ROOT = r"c:\Users\DELL\Documents\GitHub\Rhockstar-Connect"
QA_REPORT_PATH = os.path.join(REPO_ROOT, ".agents", "QA_REPORT.md")

with open(QA_REPORT_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Parse all issues
issue_pattern = re.compile(r"^####\s+([A-Z0-9_\-]+):\s+(.+)$", re.MULTILINE)
matches = list(issue_pattern.finditer(content))

categories = {}
for i, m in enumerate(matches):
    issue_id = m.group(1)
    issue_title = m.group(2).strip()
    start_idx = m.start()
    end_idx = matches[i+1].start() if i + 1 < len(matches) else len(content)
    issue_body = content[start_idx:end_idx]

    sev_match = re.search(r"-\s+\*\*Severity\*\*:\s+\**([A-Za-z]+)\**", issue_body)
    severity = sev_match.group(1) if sev_match else "UNKNOWN"

    fl_match = re.search(r"-\s+\*\*File & Lines\*\*:\s*(.+)", issue_body)
    file_lines_raw = fl_match.group(1).strip() if fl_match else ""
    cited_refs = re.findall(r"`([^`]+)`", file_lines_raw)

    ev_match = re.search(r"-\s+\*\*Evidence Snippet\*\*:(.*?)(?:-\s+\*\*|---|$)", issue_body, re.DOTALL)
    evidence_raw = ev_match.group(1) if ev_match else ""
    snippets = re.findall(r"```[a-zA-Z0-9_\-]*\n(.*?)```", evidence_raw, re.DOTALL)

    cat = issue_id.split("-")[0]
    if cat not in categories:
        categories[cat] = []

    categories[cat].append({
        "id": issue_id,
        "title": issue_title,
        "severity": severity,
        "refs": cited_refs,
        "snippets": snippets,
        "body": issue_body
    })

print("Categories and Issue counts:")
for cat, issues in categories.items():
    print(f"  {cat}: {len(issues)} issues (Severities: {set(iss['severity'] for iss in issues)})")

# Select sample issues across each category and each severity
sample_issues = []
# Pick 1-2 from each category covering Critical, High, Medium, Low
for cat, issues in categories.items():
    sample_issues.append(issues[0])
    if len(issues) > 1:
        sample_issues.append(issues[-1])

print(f"\nTotal selected sample issues for deep forensic line-by-line check: {len(sample_issues)}")

detailed_evidence = []
for issue in sample_issues:
    iid = issue["id"]
    sev = issue["severity"]
    title = issue["title"]
    
    # Check refs
    ref_findings = []
    for ref in issue["refs"]:
        if ":" in ref:
            fpath, lrange = ref.split(":", 1)
        else:
            fpath, lrange = ref, ""
        fpath = fpath.strip()
        abs_p = os.path.normpath(os.path.join(REPO_ROOT, fpath))
        if os.path.exists(abs_p):
            with open(abs_p, "r", encoding="utf-8", errors="replace") as af:
                flines = af.readlines()
            ref_findings.append(f"EXISTS ({len(flines)} lines)")
        else:
            ref_findings.append("MISSING")

    # Check snippets
    snip_findings = []
    for snip in issue["snippets"]:
        lines = [l for l in snip.splitlines() if l.strip() and not l.strip().startswith("//") and not l.strip().startswith("#")]
        matched_lines = 0
        total_nonempty = len(lines)
        for l in lines:
            clean = l.strip()
            # check in any cited file
            found = False
            for ref in issue["refs"]:
                fpath = ref.split(":", 1)[0].strip()
                abs_p = os.path.normpath(os.path.join(REPO_ROOT, fpath))
                if os.path.exists(abs_p):
                    with open(abs_p, "r", encoding="utf-8", errors="replace") as af:
                        fc = af.read()
                    if clean in fc or (len(clean) > 20 and clean[:20] in fc):
                        found = True
                        break
            if found:
                matched_lines += 1
        pct = (matched_lines / total_nonempty * 100) if total_nonempty > 0 else 100
        snip_findings.append(f"{matched_lines}/{total_nonempty} lines matched ({pct:.1f}%)")

    detailed_evidence.append({
        "id": iid,
        "sev": sev,
        "title": title,
        "refs": issue["refs"],
        "ref_status": ref_findings,
        "snip_status": snip_findings
    })

for d in detailed_evidence:
    print(f"[{d['id']}] ({d['sev']}) {d['title'][:50]}")
    print(f"  Refs: {d['refs']} -> {d['ref_status']}")
    print(f"  Snippet Match: {d['snip_status']}")

