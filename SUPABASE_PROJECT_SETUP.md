# Supabase Project Setup Guide

This guide will walk you through setting up a Supabase project for PomoMate.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- The PomoMate project cloned locally

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - **Project name**: `pomodoro-play`
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for development

## Step 2: Run Database Migrations

1. Once your project is created, go to the SQL Editor in your Supabase dashboard
2. Run the migration scripts in order:

### Migration 1: Initial Schema
```sql
-- Copy and paste the contents of:
-- /supabase/migrations/001_initial_schema.sql
```

### Migration 2: Row Level Security
```sql
-- Copy and paste the contents of:
-- /supabase/migrations/002_row_level_security.sql
```

### Migration 3: Seed Data
```sql
-- Copy and paste the contents of:
-- /supabase/migrations/003_seed_data.sql
```

## Step 3: Configure Authentication

1. Go to Authentication → Settings in your Supabase dashboard
2. Configure the following:

### Email Auth
- Enable Email auth
- Set site URL: `exp://localhost:8081` (for development)
- Add redirect URLs:
  - `exp://localhost:8081/*`
  - `com.yourcompany.pomodoroplay://` (for production)

### JWT Settings
- Leave default settings

## Step 4: Enable Realtime

1. Go to Database → Replication in your Supabase dashboard
2. Enable replication for the following tables:
   - `team_sessions`
   - `team_session_participants`
   - `users` (for presence/status)

## Step 5: Get Your API Keys

1. Go to Settings → API in your Supabase dashboard
2. Copy the following values:
   - **Project URL**: `https://[YOUR_PROJECT_REF].supabase.co`
   - **Anon/Public Key**: `eyJ...` (long string)

## Step 6: Configure Environment Variables

1. Create a `.env.local` file in your project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

2. Update `/src/lib/supabase.js` if the environment variable names are different

## Step 7: Storage Buckets (Optional)

If you plan to use avatar uploads:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `avatars`
3. Set it as public
4. Add the following RLS policies:
   - INSERT: `auth.uid() = owner`
   - SELECT: `true` (public read)
   - UPDATE: `auth.uid() = owner`
   - DELETE: `auth.uid() = owner`

## Step 8: Test Your Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Test the following:
   - User registration
   - User login
   - Creating a pomodoro session
   - Viewing achievements

## Production Deployment

When ready for production:

1. Update Authentication settings:
   - Change site URL to your production URL
   - Add production redirect URLs

2. Update environment variables for production

3. Enable additional security:
   - Review and tighten RLS policies
   - Enable 2FA for team members
   - Set up database backups

## Monitoring and Maintenance

1. **Database Monitoring**:
   - Check Database → Reports for usage statistics
   - Monitor slow queries
   - Set up alerts for errors

2. **Authentication Monitoring**:
   - Check Authentication → Logs for failed login attempts
   - Monitor user growth

3. **Storage Monitoring**:
   - Check Storage → Usage
   - Set up lifecycle policies if needed

## Troubleshooting

### Common Issues

1. **"Invalid API Key" error**:
   - Double-check your environment variables
   - Ensure you're using the anon/public key, not the service key

2. **"Permission denied" errors**:
   - Check RLS policies are enabled
   - Verify the user is authenticated
   - Check the RLS policies match your use case

3. **Realtime not working**:
   - Ensure replication is enabled for the tables
   - Check WebSocket connections in browser console
   - Verify Realtime quotas haven't been exceeded

### Debug Mode

Enable debug mode in your Supabase client:

```javascript
// In /src/lib/supabase.js
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    debug: true, // Add this line
  },
});
```

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)