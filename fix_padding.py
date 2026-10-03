with open("src/components/gamification/LeaderboardView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Pad list
padding_logic = """    useEffect(() => {
      const unsub = subscribeToLeaderboard((list) => {
        // Pad the leaderboard to exactly 20 slots
        const paddedList = [...list];
        while (paddedList.length < 20) {
          paddedList.push({
            uid: `empty-${paddedList.length}`,
            fullName: 'Unranked Member',
            username: '',
            avatar: '',
            stardomXP: 0,
            stardomRank: 'Explorer',
            streakCount: 0
          });
        }
        setLeaders(paddedList);
        setLoading(false);
      });
      return () => unsub();
    }, []);"""

content = content.replace("""    useEffect(() => {
      const unsub = subscribeToLeaderboard((list) => {
        setLeaders(list);
        setLoading(false);
      });
      return () => unsub();
    }, []);""", padding_logic)

# Make sure to update the label for the rest list
content = content.replace("Ranks List 4 - 15", "Ranks List 4 - 20")

with open("src/components/gamification/LeaderboardView.tsx", "w", encoding="utf-8") as f:
    f.write(content)
