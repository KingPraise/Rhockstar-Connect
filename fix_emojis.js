const fs = require('fs');

const replacements = {
  'dY\"\\uFFFD': '🔥',
  'dY\"\\'': '🔒',
  'dYZ%': '🎉',
  'dYO?': '🌐',
  '-?': '⭐',
  'dY\\'': '💬',
  '?': '•',
  '+?': '←',
  '+c,?': '↩️',
  '?3': '⏳',
  '? Creator': '• Creator',
  'Platform Hall of Fame ?': 'Platform Hall of Fame ⭐',
  '??': '👑',
  'dY 1': '🧹',
  'dYZ_': '✨',
  'o': '🔒'
};

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const [bad, good] of Object.entries(replacements)) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good);
      changed = true;
    }
  }
  
  // also fix some that might be slightly different
  content = content.replace(/dY\"[\\s\\S]/g, '🔥');
  content = content.replace(/dY\"'/g, '🔒');
  content = content.replace(/dY'/g, '💬');
  content = content.replace(/-\?/g, '⭐');
  content = content.replace(/dYO\?/g, '🌐');
  content = content.replace(/\+\?/g, '←');
  content = content.replace(/\?3/g, '⏳');
  content = content.replace(/\?/g, '•');
  content = content.replace(/o/g, '🔒');
  content = content.replace(/\+c,\?/g, '↩️');

  if (changed || true) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

fixFile('src/app/(dashboard)/messages/page.tsx');
fixFile('src/components/gamification/LeaderboardView.tsx');
fixFile('src/components/feed/PostCard.tsx');
fixFile('src/app/(dashboard)/network/page.tsx');

console.log('Done');
