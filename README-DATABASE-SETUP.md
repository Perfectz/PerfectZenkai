# Database Setup Instructions

## 🚨 **CRITICAL: Execute SQL Setup First**

Before testing authentication, you **MUST** execute the SQL setup script in your Supabase dashboard.

### **Step 1: Open Supabase SQL Editor**

1. Go to: https://supabase.com/dashboard/project/kslvxxoykdkstnkjgpnd/sql
2. Click "New Query" or use the SQL Editor

### **Step 2: Execute the Setup Script**

**Option A: Full Setup (Recommended for new projects)**
1. Copy the entire contents of `supabase-sql-setup.sql`
2. Paste it into the Supabase SQL Editor
3. Click "Run" to execute the script

**Option B: Quick Fix (If you get policy errors)**
1. Copy the entire contents of `supabase-sql-quick-fix.sql`
2. Paste it into the Supabase SQL Editor
3. Click "Run" to execute the script

### **Step 3: Verify Setup**

After running the script, you should see output like:
```
Profiles table exists | 3
User lookup view works | 3
Test users | testuser1 | testuser1@perfectzenkai.test
Test users | testuser2 | testuser2@perfectzenkai.test
Test users | perfectz | pzgambo@gmail.com
```

## 🔧 **What the Script Does**

### **Database Structure:**
- ✅ Creates `profiles` table with username constraints
- ✅ Creates `user_lookup` view for secure username lookups
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates automatic profile creation triggers
- ✅ Adds performance indexes
- ✅ Grants proper permissions

### **Authentication Flow:**
1. **Registration**: Creates user in `auth.users` + automatic profile in `profiles`
2. **Username Login**: Looks up username in `user_lookup` view → gets email → authenticates
3. **Email Login**: Direct authentication with Supabase Auth

### **Security Features:**
- ✅ RLS prevents unauthorized data access
- ✅ Public username availability checks (for registration)
- ✅ Secure username-to-email lookup
- ✅ Automatic profile creation on signup

## 🧪 **Test Users Available**

After setup, these test accounts will be ready:

| Username | Email | Password |
|----------|-------|----------|
| `testuser1` | testuser1@perfectzenkai.test | TestPassword123! |
| `testuser2` | testuser2@perfectzenkai.test | TestPassword456! |
| `perfectz` | pzgambo@gmail.com | (your password) |

## 🚀 **Testing Authentication**

1. **Execute the SQL setup first** (above steps)
2. Start the development server: `npm run dev`
3. Try logging in with username `perfectz` or `testuser1`
4. Registration should now show proper "User already exists" message

## 🔍 **Troubleshooting**

### **Error: "relation 'public.user_lookup' does not exist"**
- ❌ SQL setup not executed
- ✅ Run the `supabase-sql-setup.sql` script

### **Error: 406 Not Acceptable on profiles table**
- ❌ RLS policies not set up correctly
- ✅ Run the SQL setup script (includes RLS policies)

### **Error: Policy already exists**
- ❌ Trying to create existing policies
- ✅ Use the `supabase-sql-quick-fix.sql` script instead

### **Error: "User already registered"**
- ✅ This is now handled gracefully with proper error message
- ✅ Try logging in instead of registering

### **Username not found**
- ❌ Profile not created for existing user
- ✅ SQL setup script creates missing profiles automatically

## 📝 **Manual Database Queries**

If you need to check the database manually:

```sql
-- Check profiles table
SELECT * FROM public.profiles;

-- Check user_lookup view
SELECT * FROM public.user_lookup;

-- Check auth users
SELECT id, email, created_at FROM auth.users;

-- Create missing profile manually (if needed)
INSERT INTO public.profiles (id, username)
SELECT id, 'perfectz' FROM auth.users 
WHERE email = 'pzgambo@gmail.com'
ON CONFLICT (id) DO NOTHING;
``` 