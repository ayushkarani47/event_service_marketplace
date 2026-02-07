# Quick Start Guide - Supabase Migration

## 5-Minute Setup

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Copy URL and Anon Key

### 2. Add Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### 3. Create Database Schema
- Go to Supabase SQL Editor
- Copy content from `supabase/migrations/001_initial_schema.sql`
- Run the SQL

### 4. Start Development Server
```bash
npm install
npm run dev
```

### 5. Test Phone Registration
- Visit http://localhost:3000/register-phone
- Enter phone: +1234567890
- Check console/network tab for OTP
- Enter OTP and complete profile

## Key Files

| File | Purpose |
|------|---------|
| `src/context/AuthContext.tsx` | Phone OTP authentication |
| `src/app/register-phone/page.tsx` | Registration UI |
| `src/app/login-phone/page.tsx` | Login UI |
| `src/app/api/auth/send-phone-otp/route.ts` | Send OTP endpoint |
| `src/app/api/auth/verify-phone-otp/route.ts` | Verify OTP endpoint |
| `src/app/api/auth/complete-phone-registration/route.ts` | Complete registration |
| `src/app/api/auth/phone-login/route.ts` | Phone login endpoint |
| `src/app/api/services-supabase/route.ts` | Services API |
| `src/app/api/bookings-supabase/route.ts` | Bookings API |
| `src/lib/supabaseClient.ts` | Supabase client |
| `src/lib/supabaseHelpers.ts` | Database helper functions |
| `src/types_db.ts` | TypeScript types |

## API Endpoints

### Authentication
```
POST /api/auth/send-phone-otp
POST /api/auth/verify-phone-otp
POST /api/auth/complete-phone-registration
POST /api/auth/phone-login
```

### Services
```
GET /api/services-supabase
POST /api/services-supabase
GET /api/services-supabase/[id]
PUT /api/services-supabase/[id]
DELETE /api/services-supabase/[id]
```

### Bookings
```
GET /api/bookings-supabase
POST /api/bookings-supabase
GET /api/bookings-supabase/[id]
PUT /api/bookings-supabase/[id]
DELETE /api/bookings-supabase/[id]
```

## Database Tables

- `users` - User profiles (phone is primary identifier)
- `services` - Event services
- `bookings` - Service bookings
- `reviews` - Service reviews
- `conversations` - User conversations
- `messages` - Chat messages
- `otp_verifications` - OTP records

## Authentication Flow

### Register
1. User enters phone → `send-phone-otp`
2. User enters OTP → `verify-phone-otp`
3. User enters profile → `complete-phone-registration`
4. User is logged in automatically

### Login
1. User enters phone → `send-phone-otp`
2. User enters OTP → `phone-login`
3. User is logged in

## Using Helper Functions

```typescript
import { userOperations, serviceOperations, bookingOperations } from '@/lib/supabaseHelpers';

// Get user by phone
const { data: user } = await userOperations.getByPhone('+1234567890');

// Get all services
const { data: services, count } = await serviceOperations.getAll(10, 0);

// Get user's bookings
const { data: bookings } = await bookingOperations.getByCustomerId(userId);
```

## Testing in Development

### Test OTP Registration
```bash
curl -X POST http://localhost:3000/api/auth/send-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

Response includes OTP in development mode:
```json
{
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

### Test Service Creation
```bash
curl -X POST http://localhost:3000/api/services-supabase \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "user-id",
    "title": "Photography",
    "description": "Professional photography",
    "category": "photography",
    "price": 500,
    "location": "New York"
  }'
```

## Common Issues

### "Missing Supabase environment variables"
- Check `.env.local` has correct URL and key
- Restart dev server after adding env vars

### OTP not working
- Check phone format: `+1234567890`
- Verify `otp_verifications` table exists
- Check server logs for errors

### Database errors
- Verify all tables exist in Supabase
- Check RLS policies are enabled
- Verify user has correct permissions

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Create database schema
3. ✅ Test phone authentication
4. ⏳ Integrate SMS provider (Twilio, AWS SNS, etc.)
5. ⏳ Migrate existing MongoDB data
6. ⏳ Update components to use new APIs
7. ⏳ Deploy to production

## Documentation

- **Full Setup Guide**: See `SETUP_GUIDE.md`
- **Migration Guide**: See `SUPABASE_MIGRATION_GUIDE.md`
- **Supabase Docs**: https://supabase.com/docs

## Support

- Check Supabase dashboard for errors
- Review browser console for client-side errors
- Check server logs for API errors
- Post in Supabase community forum
