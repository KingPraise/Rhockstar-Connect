import os

files = [
    'src/components/layout/MobileHeader.tsx',
    'src/components/layout/MobileNav.tsx',
    'src/components/layout/Sidebar.tsx'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('{ name: "Feed", href: "/feed", icon: Home }', '{ name: "Home", href: "/feed", icon: Home }')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
