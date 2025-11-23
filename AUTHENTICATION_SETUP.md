# Full Authentication Implementation Guide - Sales Management App

## Overview
This document provides complete setup instructions for the Supabase authentication system integrated into the Sales Management App.

---

## 1. Installation & Dependencies

### Install Supabase Client
```bash
npm install @supabase/supabase-js
```

The `package.json` has already been updated with this dependency.

### Environment Variables
The `.env` file is already configured with:
```
VITE_SUPABASE_URL = https://ryweadwsfnimbrthdkgl.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Never commit `.env` file with real credentials to public repositories.

---

## 2. Supabase Project Setup

### Enable Authentication Methods

1. **Go to Supabase Dashboard** → Your Project
2. **Authentication → Providers**

#### Enable Email/Password:
- Navigate to `Auth → Providers → Email`
- Enable "Email" provider
- Keep "Confirm email" enabled for security

#### Enable Google OAuth:
1. **Get Google OAuth Credentials:**
   - Visit [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web Application)
   - Add authorized origins:
     - `http://localhost:5173` (local development)
     - `https://your-domain.com` (production)
   - Add authorized redirect URIs:
     - `https://ryweadwsfnimbrthdkgl.supabase.co/auth/v1/callback`

2. **In Supabase Dashboard:**
   - Go to `Auth → Providers → Google`
   - Enable Google provider
   - Paste Google Client ID and Client Secret
   - Save

### Create Profiles Table

Execute this SQL in Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

## 3. File Structure

```
Sales Management/
├── SALES_LOGIN/
│   ├── index.html              # Login page with forms
│   ├── main.tsx                # Form handling & UI logic
│   ├── auth.js                 # Authentication functions
│   ├── supabaseClient.js       # Supabase client initialization
│   ├── style.css               # Login page styles
│   └── auth.js                 # Original auth helper (deprecated)
├── DASHBOARD/
│   └── dashboard.html          # Protected dashboard page
├── .env                        # Environment variables
├── package.json                # Dependencies
└── AUTHENTICATION_SETUP.md     # This file
```

---

## 4. Authentication Features

### Sign Up
**File:** `SALES_LOGIN/auth.js`
**Function:** `signUp(email, password, name)`

Features:
- Creates user in Supabase auth
- Inserts profile record with name
- Email confirmation (if enabled)
- Returns user data or error

**Usage in main.tsx:**
```typescript
const result = await signUp(email, password, name);
if (result.success) {
  // Handle success
} else {
  // Handle error
}
```

### Sign In
**Function:** `signIn(email, password)`

Features:
- Authenticates user
- Establishes session
- Returns user data and session token

**Usage:**
```typescript
const result = await signIn(email, password);
if (result.success) {
  window.location.href = '/DASHBOARD/dashboard.html';
}
```

### Google OAuth
**Function:** `signInWithGoogle()`

Features:
- Redirects to Google login
- Auto-creates profile on first login
- Redirects to dashboard on success
- Handles OAuth callback

**Usage:**
```typescript
const result = await signInWithGoogle();
// Automatic redirect handled
```

### Session Management
**Functions:**
- `getCurrentSession()` - Get current session object
- `getCurrentUser()` - Get current authenticated user
- `protectRoute(redirectUrl)` - Protect routes by checking session

**Route Protection (Dashboard):**
```typescript
const user = await protectRoute('/index.html');
if (user) {
  // User is authenticated, load content
}
```

### Logout
**Function:** `logout()`

Features:
- Signs out current user
- Clears session
- Redirects to login page

**Usage:**
```javascript
document.getElementById('logout').addEventListener('click', async () => {
  const result = await logout();
  // Automatic redirect to /index.html
});
```

---

## 5. Form IDs and Structure

### Login Page (index.html)

**Sign Up Form:**
```html
<form id="signup-form">
  <input type="text" placeholder="Name" />
  <input type="email" placeholder="Email" />
  <input type="password" placeholder="Password" />
  <button type="submit">Sign Up</button>
</form>
```

**Sign In Form:**
```html
<form id="signin-form">
  <input type="email" placeholder="Email" />
  <input type="password" placeholder="Password" />
  <button type="submit">Sign In</button>
</form>
```

**Google OAuth Buttons:**
```html
<a href="#" class="icon" id="google-signup">...</a>
<a href="#" class="icon" id="google-signin">...</a>
```

### Dashboard Page (dashboard.html)

**Logout Button:**
```html
<button id="logout">Logout</button>
```

The button is automatically wired to the logout function in the script.

---

## 6. Running the Application

### Development Mode
```bash
npm run dev
```

This starts a local server at `http://localhost:5173` (or similar).

### Access Points
- **Login:** `http://localhost:5173/index.html`
- **Dashboard:** `http://localhost:5173/DASHBOARD/dashboard.html` (protected)

### Testing Authentication Flow
1. Open `http://localhost:5173/index.html`
2. Sign up with email/password or Google
3. Confirm email (if required)
4. Sign in
5. Should redirect to dashboard
6. View user info and test logout
7. After logout, should redirect to login

---

## 7. Error Handling

The implementation includes comprehensive error handling:

- **Form Validation:** Client-side email and password checks
- **Auth Errors:** User-friendly error messages displayed via alerts
- **Session Errors:** Automatic redirect to login if session expires
- **Network Errors:** Graceful handling of API failures

**Error Display:**
```typescript
showAlert('Error message here', 'error');  // Red alert
showAlert('Success message here', 'success');  // Green alert
```

---

## 8. Security Features

✅ **Implemented:**
- Row Level Security (RLS) on profiles table
- HTTPS/SSL for production
- Session-based authentication
- Secure password handling via Supabase
- Email verification for sign-ups
- OAuth provider verification

✅ **Best Practices:**
- Never expose ANON_KEY in client (already using VITE_ prefix)
- Always use environment variables for secrets
- Validate inputs on both client and server
- Use HTTPS in production
- Enable email confirmation for sign-ups

---

## 9. Troubleshooting

### Issue: "Missing Supabase environment variables"
**Solution:** Ensure `.env` file exists in the project root with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Issue: Google OAuth redirects not working
**Solution:** 
1. Verify redirect URI in Google Cloud Console matches Supabase setting
2. Check CORS settings in Supabase dashboard
3. Ensure Google provider is enabled in Supabase

### Issue: Profile table insert fails
**Solution:**
1. Check RLS policies on profiles table
2. Verify auth user ID matches profile ID
3. Check table permissions for authenticated users

### Issue: Session persists after logout
**Solution:**
1. Clear browser cookies for localhost
2. Check browser cache
3. Hard refresh page (Ctrl+F5)

### Issue: TypeScript errors for auth.js
**Solution:**
The warning about missing declaration file is expected for JavaScript modules. It doesn't affect functionality.

---

## 10. Advanced Features

### Custom Metadata
Store additional user data in auth metadata:

```typescript
await signUp(email, password, {
  name: fullName,
  phone: phoneNumber,
  company: companyName
});
```

### Password Reset
To implement password reset (not included in basic setup):

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email);
```

### Real-time Database Subscriptions
Listen for profile changes:

```typescript
const subscription = supabase
  .from('profiles')
  .on('*', payload => {
    console.log('Profile updated:', payload);
  })
  .subscribe();
```

---

## 11. Production Deployment

### Before Going Live

1. **Update environment variables:**
   - Change `localhost:5173` to your domain
   - Use production Supabase instance

2. **Configure redirect URIs:**
   - Update Google OAuth redirect in Google Cloud Console
   - Update Supabase auth redirect settings

3. **Enable HTTPS:**
   - Get SSL certificate
   - Update URLs to use `https://`

4. **Set up email confirmation:**
   - Configure SMTP in Supabase
   - Send confirmation emails on sign-up

5. **Monitor authentication:**
   - Check Supabase dashboard for auth logs
   - Monitor error rates
   - Set up alerts for failed logins

---

## 12. API Reference

### Core Functions (from auth.js)

```typescript
// Sign up
signUp(email: string, password: string, name: string)
  → { success, data, message/error }

// Sign in
signIn(email: string, password: string)
  → { success, data, message/error }

// Google OAuth
signInWithGoogle()
  → { success, message/error }

// Logout
logout()
  → { success, message/error }

// Session management
getCurrentSession()
  → session object | null

getCurrentUser()
  → user object | null

protectRoute(redirectUrl?: string)
  → user object | null

// Listeners
onAuthStateChange(callback: (event, session) => void)
  → unsubscribe function

// Profile management
getUserProfile(userId: string)
  → profile object | null

updateUserProfile(userId: string, updates: object)
  → { success, data, message/error }
```

---

## 13. Support & Resources

- **Supabase Docs:** https://supabase.io/docs
- **Supabase Auth Guide:** https://supabase.io/docs/guides/auth
- **Google OAuth Setup:** https://support.google.com/cloud/answer/6158849
- **Repository:** https://github.com/engr-julia/Sales_Management

---

## 14. File Documentation

### supabaseClient.js
- Initializes Supabase client
- Reads environment variables
- Throws error if credentials missing

### auth.js
- **Core exports:**
  - `signUp()` - User registration
  - `signIn()` - User login
  - `signInWithGoogle()` - OAuth login
  - `logout()` - User logout
  - `getCurrentSession()` - Get session
  - `getCurrentUser()` - Get user
  - `protectRoute()` - Route protection
  - `onAuthStateChange()` - Listen to auth changes
  - `getUserProfile()` - Get profile data
  - `updateUserProfile()` - Update profile

### main.tsx
- **Features:**
  - Form submission handlers
  - Input validation
  - Error display
  - Success redirects
  - Google OAuth button handler
  - Auth state listener

### index.html
- **Form IDs:** `signup-form`, `signin-form`
- **Button IDs:** `google-signup`, `google-signin`
- **Features:**
  - Alert system for notifications
  - Form toggle (sign up ↔ sign in)
  - Responsive design

### dashboard.html
- **Protected route:** Checks session before loading
- **Features:**
  - User info display
  - Logout button
  - Session-based content

---

**Last Updated:** November 24, 2025
**Version:** 1.0
**Status:** Production Ready ✅

For questions or issues, refer to the Supabase documentation or check the authentication logs in your Supabase dashboard.
