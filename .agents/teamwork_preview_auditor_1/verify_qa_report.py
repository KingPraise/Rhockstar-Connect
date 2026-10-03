import os
import re
import sys

# Ensure UTF-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

REPO_ROOT = r"c:\Users\DELL\Documents\GitHub\Rhockstar-Connect"
QA_REPORT_PATH = os.path.join(REPO_ROOT, ".agents", "QA_REPORT.md")

def audit_details():
    with open(QA_REPORT_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    issue_pattern = re.compile(r"^####\s+([A-Z0-9_\-]+):\s+(.+)$", re.MULTILINE)
    matches = list(issue_pattern.finditer(content))

    print(f"Total issues found: {len(matches)}")

    results = []
    
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

        # Extract only the Evidence Snippet block (between - **Evidence Snippet**: and the next - ** or ---)
        ev_match = re.search(r"-\s+\*\*Evidence Snippet\*\*:(.*?)(?:-\s+\*\*|---|$)", issue_body, re.DOTALL)
        evidence_raw = ev_match.group(1) if ev_match else ""
        snippets = re.findall(r"```[a-zA-Z0-9_\-]*\n(.*?)```", evidence_raw, re.DOTALL)

        # Verify files and line numbers
        ref_status = []
        for ref in cited_refs:
            if ":" in ref:
                fpath, lrange = ref.split(":", 1)
            else:
                fpath, lrange = ref, ""

            fpath = fpath.strip()
            abs_path = os.path.normpath(os.path.join(REPO_ROOT, fpath))
            exists = os.path.exists(abs_path)
            
            total_lines = -1
            if exists and os.path.isfile(abs_path):
                with open(abs_path, "r", encoding="utf-8", errors="replace") as af:
                    total_lines = len(af.readlines())

            ref_status.append({
                "ref": ref,
                "file": fpath,
                "exists": exists,
                "lines_spec": lrange.strip(),
                "actual_lines": total_lines
            })

        # Check snippet veracity
        snippet_status = []
        for s in snippets:
            s_lines = [l.strip() for l in s.splitlines() if l.strip() and not l.strip().startswith("//") and not l.strip().startswith("#")]
            # find if at least one meaningful line exists in one of the cited files
            found = False
            best_match = ""
            for r in ref_status:
                if r["exists"]:
                    abs_p = os.path.normpath(os.path.join(REPO_ROOT, r["file"]))
                    with open(abs_p, "r", encoding="utf-8", errors="replace") as af:
                        fcontent = af.read()
                    for sl in s_lines:
                        # remove trailing ellipses or comments
                        clean_sl = re.sub(r"\.\.\..*$", "", sl).strip()
                        if len(clean_sl) >= 12 and clean_sl in fcontent:
                            found = True
                            best_match = clean_sl
                            break
                    if found:
                        break
            snippet_status.append({
                "found": found,
                "best_match": best_match,
                "raw_snippet_sample": s_lines[0] if s_lines else ""
            })

        results.append({
            "id": issue_id,
            "title": issue_title,
            "severity": severity,
            "refs": ref_status,
            "snippets": snippet_status
        })

    # Summary analysis
    all_files_exist = True
    missing_files = []
    snippet_unmatched = []

    for res in results:
        for r in res["refs"]:
            if not r["exists"]:
                all_files_exist = False
                missing_files.append((res["id"], r["file"]))
        for s in res["snippets"]:
            if not s["found"]:
                snippet_unmatched.append((res["id"], s["raw_snippet_sample"]))

    print(f"\nAll files exist? {all_files_exist}")
    if missing_files:
        print(f"Missing files ({len(missing_files)}): {missing_files}")
    else:
        print("-> 100% of cited files exist in the repository!")

    print(f"\nSnippet match status:")
    print(f"Total snippets evaluated: {sum(len(r['snippets']) for r in results)}")
    print(f"Snippets unmatched by exact substring: {len(snippet_unmatched)}")
    for su in snippet_unmatched:
        print(f"  [{su[0]}] Sample: {su[1]}")

    return results

if __name__ == "__main__":
    audit_details()
