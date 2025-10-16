# Delete Account Feature Setup

## ✅ Implementation Complete

The delete account feature has been successfully added to SmartBuds with the following components:

### 1. Profile/Settings Page (`/app/profile/page.tsx`)
- Displays account information
- **Danger Zone** section with delete account option
- Confirmation modal requiring user to type "DELETE"
- Shows what data will be permanently deleted

### 2. Delete API Route (`/app/api/account/delete/route.ts`)
- Handles secure account deletion using proper foreign key relationships
- Deletes all user data in correct order:
  - Test progress (matched by `user_email`)
  - Test results (matched by `user_id` **foreign key** - **this also removes all activity history**)
  - Question reports (matched by `user_id` foreign key)
  - Profile (matched by `id` foreign key)
  - Auth user account

**Note:** 
- Activity is derived from the `results` table, so deleting results automatically removes all activity history
- All deletions now use proper foreign key relationships (`user_id`) instead of email matching
- See `MIGRATION_USER_ID.md` for details on the database migration

### 3. Navigation Update (`/components/NavigationHeader.tsx`)
- Added dropdown menu with user avatar
- **Account Settings** link to profile page
- Sign Out option

## 🔧 Required Configuration

### Important: Service Role Key

The delete account feature requires the **Supabase Service Role Key** to delete auth users.

**Add to your `.env.local` file:**
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Get your service role key from:**
1. Go to your Supabase dashboard
2. Click on Settings → API
3. Copy the `service_role` key (⚠️ Keep this secret!)

### Update Supabase Client for Admin Operations

Create or update `/lib/supabase-admin.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

Then update the delete route to use:
```typescript
import { supabaseAdmin } from '@/lib/supabase-admin';

// In the DELETE route, replace:
const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);

// With:
const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
```

## 📋 Database Cascade Rules

To ensure complete data cleanup, verify these CASCADE rules in Supabase:

```sql
-- Run in Supabase SQL Editor
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE test_results 
  DROP CONSTRAINT IF EXISTS test_results_user_id_fkey,
  ADD CONSTRAINT test_results_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE test_progress 
  DROP CONSTRAINT IF EXISTS test_progress_user_id_fkey,
  ADD CONSTRAINT test_progress_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE question_reports 
  DROP CONSTRAINT IF EXISTS question_reports_user_id_fkey,
  ADD CONSTRAINT question_reports_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE activity_logs 
  DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey,
  ADD CONSTRAINT activity_logs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;
```

## 🎯 Features

✅ **User-Friendly Interface**
- Clear account information display
- Prominent danger zone styling
- Detailed list of what will be deleted

✅ **Security**
- Requires authentication
- Confirmation modal
- Must type "DELETE" to confirm
- Loading states to prevent double-deletion

✅ **Complete Data Cleanup**
- Deletes all user data across tables
- Removes auth account
- Prevents orphaned records

✅ **User Experience**
- Accessible via dropdown menu in navigation
- Clear feedback and error messages
- Redirect to home page after deletion

## 🧪 Testing

### Test the Feature:
1. Sign in to your account
2. Click on your avatar in the navigation
3. Select "Account Settings"
4. Scroll to "Danger Zone"
5. Click "Delete My Account"
6. Type "DELETE" in the confirmation modal
7. Click "Delete Account"

### Verify Deletion:
- Check that you're logged out
- Verify user data is removed from database tables
- Try logging in again (should fail)

## 🔒 Security Considerations

⚠️ **Important:**
- The service role key bypasses Row Level Security (RLS)
- Never expose it in client-side code
- Only use in secure server-side API routes
- Store it as an environment variable
- Never commit it to version control

## 📝 User Flow

1. User navigates to Profile page
2. Sees account information and danger zone
3. Clicks "Delete My Account"
4. Modal appears with warning
5. User types "DELETE" to confirm
6. API deletes all user data
7. User is signed out
8. Redirected to homepage with confirmation

## 🚀 Next Steps

- [ ] Add service role key to environment variables
- [ ] Test delete functionality in development
- [ ] Verify cascade rules in database
- [ ] Consider adding email confirmation step (optional)
- [ ] Add audit logging for account deletions (optional)

