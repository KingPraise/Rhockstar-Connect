with open("src/app/(dashboard)/settings/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add state for password change if not exists
if "const [currentPassword, setCurrentPassword]" not in content:
    content = content.replace("export default function SettingsPage() {", "export default function SettingsPage() {\n  const [currentPassword, setCurrentPassword] = useState('');\n  const [newPassword, setNewPassword] = useState('');\n  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);")

# Add handlePasswordChange function
password_fn = """
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please enter both current and new password");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      // Need EmailAuthProvider, EmailAuthProvider.credential, reauthenticateWithCredential, updatePassword
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
"""

if "handlePasswordChange" not in content:
    content = content.replace("export default function SettingsPage() {", password_fn + "\nexport default function SettingsPage() {")

# Replace password inputs
old_pwd = """                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Current Password</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors" />
                      </div>"""

new_pwd = """                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Current Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">New Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors" 
                        />
                      </div>
                      <button 
                        onClick={handlePasswordChange}
                        disabled={isUpdatingPassword || !currentPassword || !newPassword}
                        className="px-6 py-3 bg-brand hover:bg-brand/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 mt-4"
                      >
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                      </button>"""

# Using regex because the dot characters might differ due to encoding
content = re.sub(r'<div>\s*<label.*?Current Password.*?</div>\s*<div>\s*<label.*?New Password.*?</div>', new_pwd, content, flags=re.DOTALL)

with open("src/app/(dashboard)/settings/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
