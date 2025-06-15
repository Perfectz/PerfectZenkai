# Environment Setup

This document explains how to configure authentication for Perfect Zenkai.

## Authentication Modes

The app supports two authentication modes:

### 1. Local Authentication (Default)
- **No setup required** - works out of the box
- User data stored in browser localStorage
- Perfect for development and single-user scenarios
- Automatically used when Supabase is not configured

### 2. Supabase Authentication (Optional)
- Requires Supabase project setup
- Multi-user support with cloud database
- Real-time sync across devices

## Supabase Configuration (Currently Active)

**✅ Supabase is already configured and active!**

The `.env` file contains:

```bash
# .env (Already configured)
VITE_SUPABASE_URL=https://kslvxxoykdkstnkjgpnd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbHZ4eG95a2Rrc3Rua2pncG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTk5NTQsImV4cCI6MjA2NTM5NTk1NH0.PMSopl6yPSus2Gtvzqnd_0a6MRbMulIhk6MAwH33pc4
```

### Supabase Project Details

- **Project URL**: https://kslvxxoykdkstnkjgpnd.supabase.co
- **Database Password**: `4p2FSk9CN97fd6hh`
- **Dashboard**: https://supabase.com/dashboard/project/kslvxxoykdkstnkjgpnd

### Database Tables (Already Created)
- `journal_entries` - Morning/evening journal data
- `exercises` - Workout exercise library  
- `workouts` - Workout sessions
- `weight_entries` - Weight tracking
- `meal_entries` - Meal tracking

## Current Configuration

**✅ Supabase Authentication Active**

The app is currently using Supabase authentication with automatic fallback to local auth if needed.

## Troubleshooting

### Supabase Timeout Issues
If you see "Supabase auth timeout" errors:
1. Check your internet connection
2. Verify Supabase credentials are correct
3. The app will automatically fallback to local auth

### Authentication Stuck
If authentication gets stuck:
1. Use the debug panel (bottom-right corner)
2. Click "🔧 Fix State" or "🚨 Force Logout"
3. Clear browser storage if needed

### Switching Between Auth Modes
To switch from Supabase to local auth:
1. Remove or rename your `.env` file
2. Restart the development server
3. Use "🚨 Force Logout" in debug panel

## Security Notes

- Local auth is for development/single-user only
- Supabase provides proper security for multi-user apps
- Never commit `.env` files to version control
- Use environment variables in production 