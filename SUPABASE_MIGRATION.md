# Migration from JSONBin to Supabase

This document outlines the changes made to migrate the Linkr app from JSONBin to Supabase.

## Changes Made

### 1. Dependencies
- Added `@supabase/supabase-js` package
- Removed JSONBin-related code and dependencies

### 2. Database Schema
The app now uses a Supabase `links` table with the following structure:
```sql
CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Files Modified

#### New Files:
- `lib/supabase.ts` - Supabase client configuration and types
- `lib/links.ts` - Client-side functions for CRUD operations
- `env.example` - Environment variables template

#### Modified Files:
- `app/api/links/route.ts` - Updated API routes to use Supabase
- `app/page.tsx` - Updated to use new link structure and functions
- `app/links/page.tsx` - Updated to handle new data structure

#### Removed Files:
- `lib/jsonbin.ts` - Old JSONBin implementation

### 4. Environment Variables Required

#### For Local Development:
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=https://ktalzotacycmybxuvwrk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YWx6b3RhY3ljbXlieHV2d3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjg0NzMsImV4cCI6MjA3MDcwNDQ3M30.pRPAlcMtPJYWvJXQoX68v6_dRwsBz1c6qx7cYBtNack
```

#### For Production (Vercel):
Set these environment variables in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Supabase Setup
1. Create a new Supabase project
2. Create the `links` table with the schema above
3. Set up Row Level Security (RLS) policies as needed
4. Copy your project URL and anon key to the environment variables

### 6. Data Migration
If you have existing data in JSONBin, you'll need to:
1. Export the data from JSONBin
2. Transform it to match the new schema
3. Import it into Supabase using the dashboard or SQL

### 7. API Changes
- `GET /api/links` - Returns all links from Supabase
- `POST /api/links` - Creates a new link
- `PUT /api/links` - Updates an existing link (requires ID)
- `DELETE /api/links?id={id}` - Deletes a link by ID

### 8. Frontend Changes
- Links now have `id` and `created_at` fields
- All CRUD operations use the new Supabase functions
- Search functionality remains the same (client-side with Fuse.js)

### 9. Production Deployment
The app is now production-ready:
- ✅ Uses environment variables in production
- ✅ Falls back to development values locally
- ✅ Proper error handling for missing credentials
- ✅ Ready for Vercel deployment

## Benefits of Migration
- Better data consistency and relationships
- Improved performance with proper indexing
- Built-in authentication and authorization
- Real-time subscriptions capability
- Better scalability and reliability
- Production-ready deployment

## Testing
After migration:
1. Test link creation, editing, and deletion
2. Verify search functionality works correctly
3. Check that all existing features work as expected
4. Test error handling and edge cases
5. Verify production deployment works with environment variables
