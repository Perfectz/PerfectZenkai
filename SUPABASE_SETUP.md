# Supabase Authentication Setup

## Quick Setup

1. **Create a Supabase account** at https://supabase.com
2. **Create a new project** in your Supabase dashboard
3. **Copy your project credentials**:
   - Go to Settings → API
   - Copy the "Project URL" and "anon public" API key

## Environment Configuration

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Example:**

```env
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Setup

In your Supabase SQL Editor, run this script to create the profiles table:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Set up RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Public view for username lookup
CREATE VIEW user_lookup AS
  SELECT id, username, email FROM profiles;
ALTER TABLE user_lookup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public user lookup" ON user_lookup
  FOR SELECT USING (true);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Authentication Settings

In Supabase Dashboard → Authentication → Settings:

1. **Disable email confirmation** (for development):

   - Go to Authentication → Settings → Email
   - Uncheck "Enable email confirmations"

2. **Set site URL**:
   - Add your development URL: `http://localhost:5173`
   - Add your production URL when deployed

## Testing

After setup:

1. Restart your development server: `npm run dev`
2. Try registering a new account
3. Check your Supabase dashboard → Authentication → Users to see if the user was created

## Features

With Supabase authentication, you get:

- ✅ **Persistent accounts** across devices/browsers
- ✅ **Secure password hashing**
- ✅ **User management dashboard**
- ✅ **Email/password authentication**
- ✅ **Session management**
- ✅ **Free tier** for development and small projects

## Troubleshooting

**Error: "Missing Supabase environment variables"**

- Make sure your `.env` file is in the project root
- Restart the development server after adding environment variables

**Error: "relation 'profiles' does not exist"**

- Run the database setup SQL script in Supabase SQL Editor

**Error: "Invalid API key"**

- Double-check your VITE_SUPABASE_ANON_KEY in `.env`
- Make sure you're using the "anon public" key, not the service role key

## Next Steps

Once authentication is working:

- User accounts will persist online
- Multiple users can use the same app
- Data is isolated per user automatically
- You can deploy to production with the same authentication system
