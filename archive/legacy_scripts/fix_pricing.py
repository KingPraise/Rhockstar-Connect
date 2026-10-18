with open("src/app/admin/(protected)/subscriptions/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("(proCount * 9.99) + (eliteCount * 19.99)", "(proCount * 2) + (eliteCount * 5)")
content = content.replace("$9.99/mo Pro, $19.99/mo Elite", "$2/mo Pro, $5/mo Elite")

with open("src/app/admin/(protected)/subscriptions/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
