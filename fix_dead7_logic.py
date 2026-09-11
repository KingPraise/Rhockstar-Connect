with open("src/app/(dashboard)/company/[username]/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Remove the previously injected handleFollow
content = re.sub(r'const \[isFollowing, setIsFollowing\] = useState\(false\);\s*const handleFollow = async \(\) => \{.*?\};\s*export default function CompanyPage\(\) \{', 'export default function CompanyPage() {', content, flags=re.DOTALL)

# Inject inside CompanyPage
follow_logic = """  const [isFollowing, setIsFollowing] = useState(false);
  const handleFollow = async () => {
    if (!loggedInProfile || !company) return;
    try {
      const { followUser, unfollowUser } = await import('@/lib/services/follows');
      if (isFollowing) {
        await unfollowUser(loggedInProfile.uid, company.uid);
        setIsFollowing(false);
        import('react-hot-toast').then(({ toast }) => toast.success(`Unfollowed ${company.fullName}`));
      } else {
        await followUser(loggedInProfile.uid, company.uid);
        setIsFollowing(true);
        import('react-hot-toast').then(({ toast }) => toast.success(`Following ${company.fullName}`));
      }
    } catch (err) {
      import('react-hot-toast').then(({ toast }) => toast.error("Action failed"));
    }
  };"""

content = content.replace("  const [jobs, setJobs] = useState<any[]>([]);", "  const [jobs, setJobs] = useState<any[]>([]);\n" + follow_logic)

with open("src/app/(dashboard)/company/[username]/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
