# Supabase Setup Guide - Event Service Marketplace

This guide walks you through setting up the Supabase backend for the event service marketplace with phone-based OTP authentication.

## Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account (https://supabase.com)
- Git for version control

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: event-service-marketplace (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for it to initialize (5-10 minutes)

## Step 2: Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Anon Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **Service Role Key** (for server-side operations, optional)

## Step 3: Set Up Environment Variables

1. Create/update `.env.local` in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Never commit `.env.local` to git (should be in `.gitignore`)

## Step 4: Create Database Schema

### Option A: Using Supabase SQL Editor (Recommended for beginners)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content from `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run**
6. Wait for all tables to be created

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Step 5: Enable Phone Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Scroll to **Phone**
3. Click the toggle to enable
4. Configure SMS provider (see SMS Integration section below)

## Step 6: Configure Storage Buckets (Optional)

For storing service images:

1. Go to **Storage** in Supabase dashboard
2. Click **Create a new bucket**
3. Name it `service-images`
4. Make it public (uncheck "Private bucket")
5. Click **Create bucket**

## Step 7: Install Dependencies

```bash
npm install
# or
yarn install
```

Ensure these packages are installed:
- `@supabase/supabase-js` - Supabase client
- `@supabase/auth-helpers-nextjs` - Auth helpers
- `@supabase/auth-helpers-react` - React auth hooks

## Step 8: Test the Setup

### Test OTP Registration

1. Start the development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000/register-phone`

3. Enter a phone number (e.g., +1234567890)

4. Click "Send OTP"

5. In development mode, the OTP will be returned in the API response. Check:
   - Browser console (Network tab)
   - Server logs
   - Or look at the API response

6. Enter the OTP and complete your profile

### Test OTP Login

1. Navigate to `http://localhost:3000/login-phone`

2. Enter the same phone number

3. Enter the OTP

4. You should be logged in

## Step 9: SMS Integration (Production)

For production, you need to integrate with an SMS provider:

### Option A: Twilio (Recommended)

1. Sign up at https://www.twilio.com
2. Get your Account SID and Auth Token
3. In Supabase dashboard:
   - Go to **Authentication** → **Providers** → **Phone**
   - Select **Twilio**
   - Enter Account SID and Auth Token
   - Enter Twilio Phone Number

### Option B: AWS SNS

1. Set up AWS account and SNS service
2. In Supabase dashboard:
   - Go to **Authentication** → **Providers** → **Phone**
   - Select **AWS SNS**
   - Configure AWS credentials

### Option C: Firebase Cloud Messaging

1. Set up Firebase project
2. Configure in Supabase dashboard

### For Development (Testing)

The current setup logs OTPs to console. To test with actual SMS:

1. Update `/api/auth/send-phone-otp` to integrate your SMS provider
2. Example with Twilio:

```typescript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// In the sendPhoneOtp function:
await client.messages.create({
  body: `Your OTP is: ${otp}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phone,
});
```

## Step 10: Configure Row Level Security (RLS)

The SQL migration includes RLS policies. To verify they're enabled:

1. Go to **Authentication** → **Policies** in Supabase dashboard
2. Check that policies are listed for each table
3. Test that users can only access their own data

## Step 11: Test Database Operations

### Test Service Creation

```bash
curl -X POST http://localhost:3000/api/services-supabase \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "user-id",
    "title": "Photography Service",
    "description": "Professional event photography",
    "category": "photography",
    "price": 500,
    "location": "New York, NY"
  }'
```

### Test Service Retrieval

```bash
curl http://localhost:3000/api/services-supabase
```

## Step 12: Migrate Existing Data (If applicable)

If you have existing MongoDB data:

1. Export MongoDB collections as JSON
2. Transform data to match Supabase schema
3. Use Supabase SQL or API to import

Example migration script:

```typescript
// Transform MongoDB user to Supabase
const migrateUsers = async (mongoUsers: any[]) => {
  const supabaseUsers = mongoUsers.map(user => ({
    phone: user.phone,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    role: user.role,
    is_verified: true,
    rating: 0,
    review_count: 0,
  }));

  const { error } = await supabase
    .from('users')
    .insert(supabaseUsers);

  return { error };
};
```

## Step 13: Deploy to Production

### Environment Variables for Production

Set these in your deployment platform (Vercel, Netlify, etc.):

```
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
```

### Vercel Deployment

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Netlify Deployment

1. Connect GitHub repo to Netlify
2. Add environment variables in Netlify dashboard
3. Deploy

## Troubleshooting

### "Missing Supabase environment variables"

**Solution**: Check that `.env.local` has correct values:
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### "Schema hasn't been registered for model"

**Solution**: This error is from MongoDB/Mongoose. If you see this, ensure you're using the new Supabase API routes (`/api/services-supabase`, `/api/bookings-supabase`).

### OTP not being sent

**Solution**: 
- In development, check browser console and server logs
- Verify phone number format: `+1234567890`
- Check that OTP table exists in Supabase
- For production, verify SMS provider credentials

### "Not authorized" errors

**Solution**: 
- Check that user is logged in
- Verify user ID matches in database
- Check RLS policies in Supabase dashboard

### Database connection errors

**Solution**:
- Verify Supabase URL and key are correct
- Check that database tables exist
- Verify network connectivity
- Check Supabase dashboard for any alerts

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## File Structure

```
event_service_marketplace/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── send-phone-otp/
│   │   │   │   ├── verify-phone-otp/
│   │   │   │   ├── complete-phone-registration/
│   │   │   │   └── phone-login/
│   │   │   ├── services-supabase/
│   │   │   └── bookings-supabase/
│   │   ├── register-phone/
│   │   ├── login-phone/
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── supabaseClient.ts
│   │   ├── supabaseHelpers.ts
│   │   └── ...
│   ├── types/
│   │   └── types_db.ts
│   └── ...
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── SUPABASE_MIGRATION_GUIDE.md
├── SETUP_GUIDE.md
└── ...
```

## Next Steps

1. ✅ Create Supabase project
2. ✅ Set up database schema
3. ✅ Configure authentication
4. ✅ Test phone OTP flow
5. ⏳ Integrate SMS provider
6. ⏳ Migrate existing data
7. ⏳ Update all components to use Supabase
8. ⏳ Deploy to production

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Community**: https://discord.supabase.io
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Auth Helpers**: https://supabase.com/docs/guides/auth/auth-helpers

## Security Best Practices

1. **Never commit `.env.local`** - Use `.gitignore`
2. **Use RLS policies** - Restrict data access at database level
3. **Validate input** - Always validate user input on server
4. **Use HTTPS** - Always use HTTPS in production
5. **Rotate keys** - Regularly rotate API keys
6. **Monitor logs** - Check Supabase logs for suspicious activity
7. **Rate limiting** - Implement rate limiting on API endpoints

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase logs in dashboard
3. Check browser console for errors
4. Review server logs in terminal
5. Post in Supabase community forum
