with open("src/app/(dashboard)/employer/ads/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "import { useFlutterwave" not in content:
    content = content.replace('import { toast } from "react-hot-toast";', 'import { toast } from "react-hot-toast";\nimport { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";')
    with open("src/app/(dashboard)/employer/ads/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
