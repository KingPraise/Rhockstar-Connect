with open("src/app/(dashboard)/company/[username]/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

follow_fn = """
  const [isFollowing, setIsFollowing] = useState(false);
  const handleFollow = async () => {
    if (!profile) return;
    try {
      const { followUser, unfollowUser } = await import('@/lib/services/follows');
      if (isFollowing) {
        await unfollowUser(profile.uid, companyUser.uid);
        setIsFollowing(false);
        toast.success(`Unfollowed ${companyUser.fullName}`);
      } else {
        await followUser(profile.uid, companyUser.uid);
        setIsFollowing(true);
        toast.success(`Following ${companyUser.fullName}`);
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };
"""

content = content.replace("export default function CompanyProfilePage() {", follow_fn + "\nexport default function CompanyProfilePage() {")

old_btn = """<button className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20">
                Follow Company
              </button>"""

new_btn = """<button onClick={handleFollow} className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20">
                {isFollowing ? 'Following' : 'Follow Company'}
              </button>"""

content = content.replace(old_btn, new_btn)

with open("src/app/(dashboard)/company/[username]/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
