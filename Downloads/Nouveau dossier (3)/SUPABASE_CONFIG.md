# Prime Studio - Configuration Supabase ✅

## Quick Start

### 1. Create Database Tables

1. Open your Supabase Console: https://app.supabase.com
2. Go to **SQL Editor** → Click **New Query**
3. Copy all SQL from `SUPABASE_SETUP.sql` in this project
4. Paste it and click **Run**

### 2. Set Up Google OAuth

1. In Supabase Console: **Authentication** → **Providers** → **Google**
2. Click **Enable Google**
3. Go to [Google Cloud Console](https://console.cloud.google.com)
4. Create OAuth 2.0 credentials (type: Web Application)
5. Add Authorized redirect URIs:
   - `http://localhost:3001/auth/callback` (development)
   - `https://primestudios.store/auth/callback` (production)
6. Copy **Client ID** and **Client Secret** to Supabase Google Provider

### 3. Test Authentication

```bash
npm run dev
# Open http://localhost:3001
# Click "Connexion" → Try Email or Google Sign In
```

## File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── page.tsx          (Login/Register page)
│   │   └── callback/route.ts (OAuth callback handler)
│   ├── profile/
│   │   └── page.tsx          (User profile & messages)
│   └── layout.tsx            (RootLayout with metadata)
├── lib/
│   └── supabase/
│       ├── client.ts         (Browser client - singleton)
│       └── server.ts         (Server client - SSR)
└── components/
    └── Navigation.tsx        (Updated with auth link)
```

## Key Features

✅ **Email + Password Authentication**
- Users can sign up with email
- Auto-generated secure passwords

✅ **Google OAuth Integration**
- One-click sign-in with Google

✅ **User Profiles**
- Display authenticated user info
- Show email and provider type

✅ **Messaging System**
- Send messages to Prime Studio
- Messages secured with Row Level Security (RLS)
- Users can only see their own messages

✅ **Real-Time Session Updates**
- `onAuthStateChange` listener
- Automatic profile refresh when user logs in elsewhere

## Database Schema

### messages table
```
id (UUID) - Primary Key
sender_id (UUID) - References auth.users
content (TEXT) - Message content
sender_email (TEXT) - User's email
created_at (TIMESTAMPTZ) - Created timestamp
```

### profiles table (optional)
```
id (UUID) - References auth.users
email (TEXT) - Unique email
full_name (TEXT)
phone (TEXT)
bio (TEXT)
category (TEXT)
avatar_url (TEXT)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

## Security

✅ **Row Level Security (RLS)**
- Users can only read/write their own messages
- Messages are private and secure
- Admin access can be added later via service role

✅ **Authentication**
- Next.js SSR + Client integration
- Secure session management with cookies
- OAuth state validation

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Next Steps

1. ✅ Create tables (SQL)
2. ✅ Configure Google OAuth
3. ✅ Test authentication locally
4. 📦 Deploy to Vercel
5. 🔐 Set up admin panel (optional)

## Troubleshooting

### "Invalid API key" error
- Check `.env.local` has correct SUPABASE_URL and ANON_KEY
- Restart dev server: `npm run dev`

### Google OAuth not working
- Verify redirect URIs in Google Cloud Console
- Check OAuth credentials in Supabase
- Clear browser cookies

### Messages not appearing
- Check that `messages` table exists in Supabase
- Verify RLS policies are enabled
- Check user is authenticated

## Support

For issues, check:
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- This project's issues: GitHub

---

**Prime Studio** - Photographie Professionnelle à Kinshasa 📸
