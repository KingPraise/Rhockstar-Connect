import re
with open("src/components/gamification/LeaderboardView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(
    r'    const unsub = subscribeToLeaderboard\(\(list\) => \{\n      setLeaders\(list\);\n      setLoading\(false\);\n    \}\);',
    '    const unsub = subscribeToLeaderboard((list) => {\n      const padded = [...list];\n      while(padded.length < 20) {\n        padded.push({ uid: "empty-"+padded.length, fullName: "Unranked Member", username: "", avatar: "", stardomXP: 0, stardomRank: "Explorer", streakCount: 0 });\n      }\n      setLeaders(padded);\n      setLoading(false);\n    });',
    content
)

with open("src/components/gamification/LeaderboardView.tsx", "w", encoding="utf-8") as f:
    f.write(content)
