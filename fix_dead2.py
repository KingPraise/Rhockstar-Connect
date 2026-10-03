with open("src/app/(dashboard)/settings/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add updateUserProfile and state
if "updateUserProfile" not in content:
    content = content.replace('import { updateProfile } from "firebase/auth";', 'import { updateProfile } from "firebase/auth";\nimport { updateUserProfile } from "@/lib/services/users";')

toggle_fn = """
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
if "handleTogglePref" not in content:
    content = content.replace("export default function SettingsPage() {", toggle_fn + "\nexport default function SettingsPage() {")

# Replace inputs
old_conn = """onChange={() => toast.success("Connection alert preference saved!")}"""
new_conn = """checked={(profile as any)?.notificationSettings?.connectionAlerts ?? true} onChange={() => handleTogglePref('connectionAlerts', (profile as any)?.notificationSettings?.connectionAlerts ?? true)}"""
content = content.replace(old_conn, new_conn)

old_post = """onChange={() => toast.success("Post interaction preference saved!")}"""
new_post = """checked={(profile as any)?.notificationSettings?.postInteractions ?? true} onChange={() => handleTogglePref('postInteractions', (profile as any)?.notificationSettings?.postInteractions ?? true)}"""
content = content.replace(old_post, new_post)

with open("src/app/(dashboard)/settings/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
