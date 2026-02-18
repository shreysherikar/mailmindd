# Google OAuth Setup - Step by Step

## Why You Need This
MailMind needs access to your Gmail to read and manage emails. Google OAuth provides secure authentication.

## Step-by-Step Instructions

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project
- Click on the project dropdown (top left)
- Click "New Project"
- Name it "MailMind" or anything you like
- Click "Create"

### 3. Enable Gmail API
- In the left sidebar, go to "APIs & Services" > "Library"
- Search for "Gmail API"
- Click on it and press "Enable"

### 4. Configure OAuth Consent Screen
- Go to "APIs & Services" > "OAuth consent screen"
- Choose "External" (unless you have a Google Workspace)
- Click "Create"
- Fill in:
  - App name: MailMind
  - User support email: your email
  - Developer contact: your email
- Click "Save and Continue"
- On Scopes page, click "Add or Remove Scopes"
- Add these scopes:
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/gmail.send`
- Click "Save and Continue"
- Add your email as a test user
- Click "Save and Continue"

### 5. Create OAuth Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth client ID"
- Choose "Web application"
- Name it "MailMind Web Client"
- Under "Authorized redirect URIs", click "Add URI"
- Add: `http://localhost:3000/api/auth/callback/google`
- Click "Create"

### 6. Copy Your Credentials
- You'll see a popup with your Client ID and Client Secret
- Copy both values
- Open `.env.local` in your project
- Paste them:
  ```
  GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your-client-secret-here
  ```

### 7. Save and You're Done!
Your `.env.local` should now look like:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=Z4vL58mk3ug789u7iJbBQq64MOF4UrdqJOAtVYGGv3Y=
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
```

## Testing
1. Run `npm run dev`
2. Open http://localhost:3000
3. Click "Sign in with Google"
4. Grant permissions
5. You should see your emails!

## Common Issues

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- No trailing slash, no extra spaces

### "Access blocked: This app's request is invalid"
- Make sure you added your email as a test user in OAuth consent screen
- Make sure Gmail API is enabled

### "Invalid client"
- Double-check your Client ID and Secret in `.env.local`
- Make sure there are no extra spaces or quotes

## Optional: AI Features

To enable smart features like email summarization and priority scoring:

### Groq API (Free, Recommended)
1. Visit: https://console.groq.com/
2. Sign up with Google/GitHub
3. Go to API Keys
4. Create a new key
5. Add to `.env.local`: `GROQ_API_KEY=gsk_...`

## Next Steps
Once you have Google OAuth working, we can add the to-do list feature!
