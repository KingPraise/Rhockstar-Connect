with open("src/app/(dashboard)/settings/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add imports if missing
if "updateUserProfile" not in content:
    content = content.replace('import { updateProfile } from "firebase/auth";', 'import { updateProfile } from "firebase/auth";\nimport { updateUserProfile } from "@/lib/services/users";')

if "const [currentPassword, setCurrentPassword]" not in content:
    content = content.replace("export default function SettingsPage() {", "export default function SettingsPage() {\n  const [currentPassword, setCurrentPassword] = useState('');\n  const [newPassword, setNewPassword] = useState('');\n  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);")

logic = """
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please enter both current and new password");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { auth } = await import('@/lib/firebase');
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
      
      const user = auth.currentUser;
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        toast.success("Password updated successfully!");
        setCurrentPassword('');
        setNewPassword('');
      } else {
        toast.error("User not found or email missing.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleTogglePref = async (key: string, currentValue: boolean) => {
    try {
      const newValue = !currentValue;
      if (!profile) return;
      
      const res = await updateUserProfile(profile.uid, {
        notificationSettings: {
          ...(profile as any).notificationSettings,
          [key]: newValue
        }
      });
      
      if (res.success) {
        setProfile({
          ...profile,
          notificationSettings: {
            ...(profile as any).notificationSettings,
            [key]: newValue
          }
        } as any);
        toast.success("Preference saved!");
      }
    } catch (err) {
      toast.error("Failed to save preference.");
    }
  };
"""

content = content.replace("export default function SettingsPage() {", logic + "\nexport default function SettingsPage() {")

# SAFE replace for DEAD-01:
content = content.replace(
'''                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors" />
                  </div>''',
'''                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Current Password</label>
                    <input type="password" placeholder="********" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">New Password</label>
                    <input type="password" placeholder="********" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors" />
                  </div>
                  <button onClick={handlePasswordChange} disabled={isUpdatingPassword || !currentPassword || !newPassword} className="px-6 py-3 bg-brand hover:bg-brand/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 mt-4">
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </button>'''
)

# Replace DEAD-02:
content = content.replace('onChange={() => toast.success("Connection alert preference saved!")}', "checked={(profile as any)?.notificationSettings?.connectionAlerts ?? true} onChange={() => handleTogglePref('connectionAlerts', (profile as any)?.notificationSettings?.connectionAlerts ?? true)}")
content = content.replace('onChange={() => toast.success("Post interaction preference saved!")}', "checked={(profile as any)?.notificationSettings?.postInteractions ?? true} onChange={() => handleTogglePref('postInteractions', (profile as any)?.notificationSettings?.postInteractions ?? true)}")

# Replace DEAD-06:
content = content.replace(
'''<button className="px-4 py-2 bg-brand/10 text-brand font-bold rounded-lg border border-brand/20 hover:bg-brand hover:text-white transition-colors">
                            Verify Now
                          </button>''',
'''<button onClick={() => toast.success("Phone verification coming soon!")} className="px-4 py-2 bg-brand/10 text-brand font-bold rounded-lg border border-brand/20 hover:bg-brand hover:text-white transition-colors">
                            Coming Soon
                          </button>'''
)

with open("src/app/(dashboard)/settings/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
