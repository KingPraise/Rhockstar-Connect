# Firebase Email Templates Setup

Follow these steps to make your emails look professional and branded instead of the generic Firebase defaults.

### Where to go
1. Go to your **Firebase Console** (console.firebase.google.com)
2. Open your project (`rhockstar-connect-v2`)
3. Click on **Authentication** in the left sidebar
4. Go to the **Templates** tab at the top.

---

### 1. Password Reset Template

Click on the **Password reset** option.
- **Sender Name:** `Rhockstar Connect`
- **Reply-to:** `support@rhockstarconnect.com` *(or your preferred support email)*
- **Subject:** `Reset your password for Rhockstar Connect`

Click the `< >` (HTML) button to edit the message body, delete everything inside, and paste this exactly:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #8b5cf6; margin: 0; font-size: 28px;">Rhockstar Connect</h1>
  </div>
  <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <h2 style="color: #1e293b; margin-top: 0;">Hello %DISPLAY_NAME%,</h2>
    <p style="color: #475569; font-size: 16px; line-height: 1.5;">We received a request to reset your password for your Rhockstar Connect account. Click the button below to choose a new password.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="%LINK%" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
    </div>
    <p style="color: #94a3b8; font-size: 14px; margin-bottom: 0;">If you didn't request a password reset, you can safely ignore this email.</p>
  </div>
</div>
```

---

### 2. Email Address Verification Template

Click on the **Email address verification** option.
- **Sender Name:** `Rhockstar Connect`
- **Reply-to:** `support@rhockstarconnect.com`
- **Subject:** `Verify your email for Rhockstar Connect`

Click the `< >` (HTML) button, delete the contents, and paste this exactly:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #8b5cf6; margin: 0; font-size: 28px;">Rhockstar Connect</h1>
  </div>
  <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <h2 style="color: #1e293b; margin-top: 0;">Welcome to Rhockstar Connect!</h2>
    <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hello %DISPLAY_NAME%, thank you for joining our community of professionals, creatives, and businesses. Please verify your email address to get started.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="%LINK%" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email</a>
    </div>
    <p style="color: #94a3b8; font-size: 14px; margin-bottom: 0;">If you didn't create this account, you can safely ignore this email.</p>
  </div>
</div>
```

Click **Save** on both templates when you are done!
