# 🔐 Supabase Authentication Configuration

Complete setup guide for Email + Google OAuth authentication on Prime Studio.

---

## ✅ 1. Supabase URL Configuration (MANDATORY)

### Step 1: Open Supabase Console
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your **prime-studio** project
3. Navigate to: **Settings → Configuration → URL Configuration**

### Step 2: Set Site URL
Replace the **Site URL** with:
```
https://primestudios.store
```

### Step 3: Add Redirect URLs
In the **Redirect URLs** section, add these URLs (one per line):

```
https://primestudios.store/auth/callback
https://primestudios.store/*
http://localhost:3001/auth/callback
http://localhost:3001/*
```

**Why?** 
- Supabase blocks redirects to URLs not in this list
- These URLs are used after Email confirmation and OAuth callback
- Development URLs allow testing locally

---

## 🔑 2. Google OAuth Setup

### Step 1: Enable Google Provider
1. In Supabase Console: **Authentication → Providers → Google**
2. Toggle **Enable** to ON

### Step 2: Add Google Cloud Credentials

You need to get credentials from Google Cloud Console:

#### Get Google Credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing): `Prime Studio Auth`
3. **Enable APIs:**
   - Search for "Google+ API" and enable it
   - Or go to: **APIs & Services → Library** → search "Google+ API"

4. **Create OAuth 2.0 Credentials:**
   - Go to: **APIs & Services → Credentials**
   - Click: **Create Credentials → OAuth 2.0 Client ID**
   - Choose: **Web application**
   - Add **Authorized redirect URIs:**
     ```
     https://ljyjplnkadocloecnpyp.supabase.co/auth/v1/callback
     ```
     ⚠️ **Replace `ljyjplnkadocloecnpyp` with YOUR Supabase project ID**
     (Find it in: Supabase Settings → Configuration → API URLs)

5. Copy the **Client ID** and **Client Secret**

#### Add to Supabase:
1. In Supabase Console: **Authentication → Providers → Google**
2. Paste:
   - **Google Client ID**: `your_client_id_here`
   - **Google Client Secret**: `your_client_secret_here`
3. Click **Save**

---

## 🗄️ 3. Create Database Tables

### Step 1: Open SQL Editor
1. In Supabase Console: **SQL Editor**
2. Click **New Query**

### Step 2: Copy & Paste SQL
Copy all content from `SUPABASE_SETUP.sql` and paste into the SQL editor.

### Step 3: Run Query
Click the **Run** button (or press `Ctrl+Enter`)

**Tables created:**
- ✅ `messages` - Store user messages with RLS policies
- ✅ `profiles` (optional) - User profile information

---

## 🧪 4. Test Authentication Locally

### Test Email Sign Up:
1. Start dev server: `npm run dev`
2. Go to: [http://localhost:3001/auth](http://localhost:3001/auth)
3. Click **"Créer compte"**
4. Enter:
   - Email: `test@example.com`
   - Password: `TestPass123!`
5. Expected: ✅ "Inscription réussie!" message

### Test Email Sign In:
1. Click **"Se connecter"**
2. Enter same credentials
3. Expected: ✅ "Connecté avec succès!" message
4. Redirect to: [http://localhost:3001/profile](http://localhost:3001/profile)

### Test Google OAuth:
1. Click **"Continuer avec Google"**
2. Sign in with your Google account
3. Approve permissions
4. Expected: Redirected to profile page

### Test Message Sending:
1. On profile page → click **Messages** tab
2. Type a message
3. Click Send
4. Expected: Message appears in history

---

## 📁 5. Environment Variables Check

Make sure these are in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ljyjplnkadocloecnpyp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Find these values in: Supabase Console → **Settings → API → Project URL** and **anon key**

---

## ✨ 6. Production Deployment (Vercel)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production: Complete auth setup with Google OAuth"
git push
```

### Step 2: Deploy to Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Step 3: Update Supabase URL Configuration for Production
1. In Supabase: **Settings → URL Configuration**
2. Update **Redirect URLs** to use production domain:

```
https://primestudios.store/auth/callback
https://primestudios.store/*
```

### Step 4: Update Google OAuth Redirect URI
1. In Google Cloud Console: **APIs & Services → Credentials**
2. Add to authorized redirect URIs:
```
https://ljyjplnkadocloecnpyp.supabase.co/auth/v1/callback
```

---

## 🐛 Troubleshooting

### Issue: "Invalid API key"
- ✅ Check `.env.local` has correct keys
- ✅ Keys not expired
- ✅ Database tables created

### Issue: "Redirect URL not allowed"
- ✅ Add the URL to Supabase URL Configuration
- ✅ Verify exact URL matches (case-sensitive)

### Issue: "Email not confirmed"
- ✅ If email confirmation enabled, check your email
- ✅ Or disable email confirmation in Supabase Auth settings

### Issue: Google login redirects to login page
- ✅ Verify Google OAuth credentials in Supabase
- ✅ Check Google Cloud redirect URI matches

### Issue: Messages not appearing
- ✅ Verify `messages` table created
- ✅ Check RLS policies applied
- ✅ Ensure user is authenticated

---

## 🎯 Quick Reference

| Setting | Value |
|---------|-------|
| **Site URL** | `https://primestudios.store` |
| **Dev Callback** | `http://localhost:3001/auth/callback` |
| **Prod Callback** | `https://primestudios.store/auth/callback` |
| **Email Redirect** | `http://localhost:3001/auth/callback` |
| **Google Redirect** | `https://[project-id].supabase.co/auth/v1/callback` |

---

## 📚 Additional Resources

- [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
- [Supabase SSR Authentication](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Status:** ✅ All configurations ready for production
**Last Updated:** February 5, 2026
