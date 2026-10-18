with open("src/app/(dashboard)/search/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
old_link = """                <Link key={post.id} href={`/feed?postId=${post.id}#post-${post.id}`} className="block hover:opacity-95 transition-opacity">
                  <PostCard post={post} />
                </Link>"""

new_link = """                <div key={post.id}>
                  <PostCard post={post} />
                </div>"""

content = content.replace(old_link, new_link)

with open("src/app/(dashboard)/search/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
