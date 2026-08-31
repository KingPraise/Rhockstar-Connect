import os

with open('src/app/(dashboard)/premium/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the import
content = content.replace(
    'import { useCurrencyStore } from "@/store/useCurrencyStore";',
    'import { useCurrencyStore, CURRENCIES } from "@/store/useCurrencyStore";'
)

# Fix the usage
content = content.replace(
    'const curr = (useCurrencyStore.getState() as any).CURRENCIES[currency] || { rateFromUSD: 1 };',
    'const curr = (CURRENCIES as any)[currency] || { rateFromUSD: 1 };'
)

with open('src/app/(dashboard)/premium/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
