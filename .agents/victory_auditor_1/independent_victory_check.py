import re
import os
import sys

report_path = r"c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\QA_REPORT.md"
base_dir = r"c:\Users\DELL\Documents\GitHub\Rhockstar-Connect"

if not os.path.exists(report_path):
    print(f"ERROR: {report_path} does not exist!")
    sys.exit(1)

with open(report_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Check for hallucinated identifiers
banned_identifiers = ["handleSelectTier", "plan.id"]
for ident in banned_identifiers:
    if ident in content:
        print(f"FAIL: Found banned/hallucinated identifier '{ident}' in QA_REPORT.md!")
        sys.exit(1)
print("PASS: No banned/hallucinated identifiers found in QA_REPORT.md.")

# 2. Extract issues from Section 2
issue_pattern = re.compile(r"^####\s+([A-Z\-]+-\d+):\s+(.+)$", re.MULTILINE)
issues = issue_pattern.findall(content)

print(f"Total issues found: {len(issues)}")
if len(issues) != 65:
    print(f"FAIL: Expected 65 issues, found {len(issues)}")
    sys.exit(1)

categories = {"SEC": 0, "PAY": 0, "DATA": 0, "ATS": 0, "ROUT": 0, "DEAD": 0, "DATA-UI": 0, "ARCH": 0}
severities = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
cat_sev = {cat: {"Critical": 0, "High": 0, "Medium": 0, "Low": 0} for cat in categories}

# Split report by issue headers
issue_blocks = re.split(r"^####\s+[A-Z\-]+-\d+:\s+.+$", content, flags=re.MULTILINE)[1:]

all_files_checked = set()
missing_files = []
line_checks = []

for (issue_id, title), block in zip(issues, issue_blocks):
    # Determine category
    prefix = issue_id.split("-")[0]
    if issue_id.startswith("DATA-UI-"):
        cat = "DATA-UI"
    else:
        cat = prefix
    
    if cat in categories:
        categories[cat] += 1
    else:
        print(f"FAIL: Unknown category prefix {cat} in {issue_id}")
        sys.exit(1)

    # Determine severity
    sev_match = re.search(r"-\s+\*\*Severity\*\*:\s+\*\*([A-Za-z]+)", block)
    if not sev_match:
        print(f"FAIL: Severity not found for {issue_id}")
        sys.exit(1)
    sev = sev_match.group(1)
    if sev not in severities:
        print(f"FAIL: Unknown severity {sev} for {issue_id}")
        sys.exit(1)
    severities[sev] += 1
    cat_sev[cat][sev] += 1

    # Check File & Lines
    fl_match = re.search(r"-\s+\*\*File & Lines\*\*:\s*(.+)", block)
    if not fl_match:
        print(f"FAIL: File & Lines not found for {issue_id}")
        sys.exit(1)
    file_lines_raw = fl_match.group(1).strip()
    cited_refs = re.findall(r"`([^`]+)`", file_lines_raw)
    
    # Check Required Fields: Component, Suspected Root Cause, Recommended Fix
    comp_match = re.search(r"-\s+\*\*Component\*\*:", block)
    cause_match = re.search(r"-\s+\*\*Suspected Root Cause\*\*:", block)
    rec_match = re.search(r"-\s+\*\*Recommended Fix\*\*:", block)

    if not (comp_match and cause_match and rec_match):
        print(f"FAIL: Missing required section fields in {issue_id}")
        sys.exit(1)

    for ref in cited_refs:
        if ":" in ref:
            fpath, lrange = ref.split(":", 1)
        else:
            fpath, lrange = ref, ""
        fpath = fpath.strip()
        if not fpath:
            continue
        abs_path = os.path.normpath(os.path.join(base_dir, fpath))
        all_files_checked.add(fpath)
        if not os.path.exists(abs_path):
            missing_files.append((issue_id, fpath))
        else:
            if lrange and os.path.isfile(abs_path):
                try:
                    with open(abs_path, "r", encoding="utf-8", errors="ignore") as af:
                        file_lines = len(af.readlines())
                    line_checks.append((issue_id, fpath, lrange, file_lines))
                except Exception as e:
                    pass

print(f"Categories count: {categories}")
print(f"Severities count: {severities}")
print(f"Unique files checked: {len(all_files_checked)}")
print(f"Missing files: {len(missing_files)}")
if missing_files:
    for issue_id, fpath in missing_files:
        print(f"  Missing: {issue_id} -> {fpath}")
    sys.exit(1)
else:
    print("PASS: 100% of cited files exist on disk.")

# Check Section 1.2 Severity Distribution table
sev_table_matches = re.findall(r"\|\s+\*\*(Critical|High|Medium|Low)\*\*\s+\|\s+\*\*(\d+)\*\*\s+\|\s+(\d+\.\d+)%", content)
for sev_name, count_str, pct_str in sev_table_matches:
    expected_count = severities[sev_name]
    actual_count = int(count_str)
    if expected_count != actual_count:
        print(f"FAIL: Table severity {sev_name} count {actual_count} != catalog count {expected_count}")
        sys.exit(1)
    expected_pct = round(expected_count / 65.0 * 100, 1)
    actual_pct = float(pct_str)
    if abs(expected_pct - actual_pct) > 0.1:
        print(f"FAIL: Table severity {sev_name} pct {actual_pct}% != expected {expected_pct}%")
        sys.exit(1)
print("PASS: Section 1.2 Severity Distribution Table matches catalog 100%.")

# Check Section 1.2 Subsystem Distribution table
cat_table_matches = re.findall(r"\|\s+\*\*([A-Z\-]+)\*\*\s+\|\s+[^|]+\|\s+(\d+)\s+\|\s+(\d+)\s+\|\s+(\d+)\s+\|\s+(\d+)\s+\|\s+(\d+)\s+\|", content)
for cat_name, tot_str, crit_str, high_str, med_str, low_str in cat_table_matches:
    if cat_name == "TOTALS":
        continue
    if cat_name not in categories:
        print(f"FAIL: Unknown category in table {cat_name}")
        sys.exit(1)
    if int(tot_str) != categories[cat_name]:
        print(f"FAIL: Table {cat_name} total {tot_str} != catalog {categories[cat_name]}")
        sys.exit(1)
    if int(crit_str) != cat_sev[cat_name]["Critical"]:
        print(f"FAIL: Table {cat_name} critical {crit_str} != catalog {cat_sev[cat_name]['Critical']}")
        sys.exit(1)
    if int(high_str) != cat_sev[cat_name]["High"]:
        print(f"FAIL: Table {cat_name} high {high_str} != catalog {cat_sev[cat_name]['High']}")
        sys.exit(1)
    if int(med_str) != cat_sev[cat_name]["Medium"]:
        print(f"FAIL: Table {cat_name} med {med_str} != catalog {cat_sev[cat_name]['Medium']}")
        sys.exit(1)
    if int(low_str) != cat_sev[cat_name]["Low"]:
        print(f"FAIL: Table {cat_name} low {low_str} != catalog {cat_sev[cat_name]['Low']}")
        sys.exit(1)
print("PASS: Section 1.2 Subsystem Distribution Table matches catalog 100%.")

print("\n>>> ALL INDEPENDENT VICTORY CHECKS PASSED SUCCESSFULLY! <<<")
