import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

REPO_ROOT = r"c:\Users\DELL\Documents\GitHub\Rhockstar-Connect"
QA_REPORT_PATH = os.path.join(REPO_ROOT, ".agents", "QA_REPORT.md")

with open(QA_REPORT_PATH, "r", encoding="utf-8") as f:
    content = f.read()

issue_pattern = re.compile(r"^####\s+([A-Z0-9_\-]+):\s+(.+)$", re.MULTILINE)
matches = list(issue_pattern.finditer(content))

line_audit_results = []

for i, m in enumerate(matches):
    issue_id = m.group(1)
    issue_title = m.group(2).strip()
    start_idx = m.start()
    end_idx = matches[i+1].start() if i + 1 < len(matches) else len(content)
    issue_body = content[start_idx:end_idx]

    fl_match = re.search(r"-\s+\*\*File & Lines\*\*:\s*(.+)", issue_body)
    file_lines_raw = fl_match.group(1).strip() if fl_match else ""
    cited_refs = re.findall(r"`([^`]+)`", file_lines_raw)

    for ref in cited_refs:
        if ":" in ref:
            fpath, lrange = ref.split(":", 1)
        else:
            fpath, lrange = ref, ""

        fpath = fpath.strip()
        abs_path = os.path.normpath(os.path.join(REPO_ROOT, fpath))
        if not os.path.exists(abs_path):
            continue

        with open(abs_path, "r", encoding="utf-8", errors="replace") as af:
            file_lines = af.readlines()
        total_lines = len(file_lines)

        sub_ranges = [r.strip() for r in lrange.split(",") if r.strip()]
        for sr in sub_ranges:
            range_match = re.match(r"^(\d+)(?:-(\d+))?$", sr)
            if range_match:
                start_l = int(range_match.group(1))
                end_l = int(range_match.group(2)) if range_match.group(2) else start_l
                
                # Fetch lines
                # Note: 1-indexed
                slice_start = max(0, start_l - 1)
                slice_end = min(total_lines, end_l)
                actual_content_slice = "".join(file_lines[slice_start:slice_end]).strip()

                line_audit_results.append({
                    "id": issue_id,
                    "file": fpath,
                    "range": sr,
                    "start": start_l,
                    "end": end_l,
                    "total_lines": total_lines,
                    "in_bounds": (start_l <= total_lines and end_l <= total_lines),
                    "preview": actual_content_slice[:100].replace("\n", " ")
                })

out_of_bounds = [r for r in line_audit_results if not r["in_bounds"]]
print(f"Total line references checked: {len(line_audit_results)}")
print(f"Out of bounds: {len(out_of_bounds)}")
for oob in out_of_bounds:
    print(f"  [{oob['id']}] {oob['file']}:{oob['range']} (file has {oob['total_lines']} lines)")

print("\nSample of verified line references:")
for r in line_audit_results[:10]:
    print(f"  [{r['id']}] {r['file']}:{r['range']} -> {r['preview'][:60]}...")
