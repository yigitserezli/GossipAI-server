# GossipAI — Legal Pages Implementation Task

## Context

**Site**: `https://gossip-ai.site`  
**App**: GossipAI — an AI-powered relationship advice mobile app for women  
**Brand**: Pride AI Advisor  
**Support email**: alpermir3@gmail.com  
**Payment provider**: RevenueCat (handles all subscription billing, receipts, and refunds)  
**Data storage**: User data is collected and stored on our own servers  
**App version**: v1.0.4

---

## Pages to Create

The mobile app links to the following URLs. Each must return a valid HTML page. The design should be clean, minimal, and consistent across all pages (dark-background preferred, matching the app's aesthetic).

| Page | URL Path | App Store Required |
|---|---|---|
| Privacy Policy | `/privacy` | ✅ Yes |
| Terms of Service | `/terms` | ✅ Yes |
| Cookie Policy | `/cookies` | ✅ GDPR |
| Refund Policy | `/refund` | ✅ App Store |
| Data Deletion Request | `/data-deletion` | ✅ Apple required |

---

## Page Content Requirements

### 1. Privacy Policy — `/privacy`

**What data we collect:**
- Name and email address (at registration)
- Conversation content entered by the user (stored on our servers to provide AI advice)
- Language preference
- Subscription plan status (via RevenueCat)
- Device type / OS version (for analytics)

**How we use it:**
- To provide personalized AI relationship advice
- To maintain the user account and subscription
- We do NOT sell data to third parties
- We do NOT use data to train external AI models

**Data storage:**
- All data is stored on GossipAI's own servers
- Data is retained for the duration of the account, plus 30 days after deletion

**User rights (GDPR):**
- Right to access their data
- Right to erasure (delete account)
- Right to data portability
- Contact: alpermir3@gmail.com

**Third-party services used:**
- RevenueCat (subscription management) — their privacy policy applies to payment data
- Apple / Google (app distribution) — their privacy policies apply

**Last updated**: May 2026

---

### 2. Terms of Service — `/terms`

**Key points to cover:**
- The service is intended for users 18+
- GossipAI provides AI-generated relationship advice for informational purposes only — it is NOT a substitute for professional psychological or legal advice
- Users are responsible for how they use the advice provided
- We reserve the right to terminate accounts that violate community standards (harassment, abuse, illegal content)
- Subscriptions are managed via RevenueCat and billed by Apple/Google according to their terms
- We may update the service and these terms at any time with notice

**Last updated**: May 2026

---

### 3. Cookie Policy — `/cookies`

**What we collect:**
- We use session tokens (stored securely on-device) for authentication — these are not traditional browser cookies
- We collect usage analytics to improve the app (anonymous, aggregated data)
- We do NOT use advertising cookies or tracking pixels

**Note:** This is a mobile app, not a browser-based product. The "cookies" in this context refer to local storage tokens and analytics data.

**User control:**
- Users can request full data deletion at any time via `/data-deletion` or by emailing alpermir3@gmail.com

**Last updated**: May 2026

---

### 4. Refund Policy — `/refund`

**Key points:**
- All subscriptions are processed through the Apple App Store or Google Play Store via RevenueCat
- **Refunds are handled directly by Apple or Google**, not by GossipAI
- To request a refund:
  - **iOS**: Visit [reportaproblem.apple.com](https://reportaproblem.apple.com)
  - **Android**: Visit [Google Play Help](https://support.google.com/googleplay/answer/2479637)
- GossipAI cannot issue refunds directly
- Subscription cancellations can be managed in your device's subscription settings
- After cancellation, Premium access continues until the end of the billing period

**Last updated**: May 2026

---

### 5. Data Deletion Request — `/data-deletion`

**Purpose:** Apple App Store requires that apps with user accounts provide a mechanism for users to request account and data deletion.

**Page content:**

1. **Explanation paragraph**: Tell the user that submitting this form will permanently delete their GossipAI account and all associated conversation data. This action cannot be undone.

2. **Simple form** with the following fields:
   - Email address (text input, required)
   - Reason for deletion (optional dropdown: "No longer using the app", "Privacy concerns", "Switching devices", "Other")
   - Confirmation checkbox: "I understand this action is permanent and cannot be undone"
   - Submit button: "Send Deletion Request"

3. **On submit**: Send an email to `alpermir3@gmail.com` with subject `Account Deletion Request` and body containing the user's email and reason. This can be done with a `mailto:` link OR a simple backend form handler if one exists.

4. **After submit**: Show a confirmation message: "Your deletion request has been received. We'll process it within 30 days and send a confirmation to your email."

5. **Alternative**: Users can also email alpermir3@gmail.com directly with subject "Account Deletion Request".

---

## Design Guidelines

- **Background**: Dark (`#0F0A1E` or similar deep purple-black, matching the app)
- **Text**: White / light gray
- **Accent color**: Purple (`#9F54F3`)
- **Font**: System font or Inter/SF Pro
- **Header**: Simple nav with GossipAI logo and "Back to Home" link
- **Footer**: "© 2026 GossipAI · alpermir3@gmail.com"
- All pages should be **mobile-responsive**
- All pages should be accessible at their exact paths (no redirects)

---

## Important Notes

- These pages will be opened directly from the mobile app via `Linking.openURL()` — they must load fast and render cleanly in a mobile WebView
- The Data Deletion page (`/data-deletion`) is **required by Apple** for App Store approval — it must be live before App Store submission
- Keep the language **English only** on the web pages (the app handles multilingual, but the web pages can be English)
