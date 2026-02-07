# Supabase Migration Guide

This document outlines the complete migration from MongoDB + JWT authentication to Supabase with phone-based OTP authentication.

## Overview

The event service marketplace has been migrated to use:
- **Authentication**: Supabase Auth with phone-based OTP
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (for images)
- **Primary Identifier**: Phone number (users table)

## Database Schema

### Tables Created

#### 1. `users` Table
- **id** (UUID, Primary Key)
- **phone** (Text, Unique) - Primary identifier for users
- **first_name** (Text)
- **last_name** (Text)
- **email** (Text, Optional)
- **role** (Enum: 'customer', 'service_provider', 'admin')
- **profile_picture** (Text, Optional)
- **bio** (Text, Optional)
- **address** (JSONB, Optional) - { street, city, state, zipCode, country }
- **rating** (Numeric, Default: 0)
- **review_count** (Integer, Default: 0)
- **is_verified** (Boolean, Default: false)
- **created_at** (Timestamp)
- **updated_at** (Timestamp)

#### 2. `services` Table
- **id** (UUID, Primary Key)
- **provider_id** (UUID, Foreign Key → users.id)
- **title** (Text)
- **description** (Text)
- **category** (Text)
- **price** (Numeric)
- **images** (Text Array)
- **location** (Text)
- **rating** (Numeric, Default: 0)
- **review_count** (Integer, Default: 0)
- **availability** (JSONB, Optional) - { startDate, endDate }
- **features** (Text Array)
- **created_at** (Timestamp)
- **updated_at** (Timestamp)

#### 3. `bookings` Table
- **id** (UUID, Primary Key)
- **service_id** (UUID, Foreign Key → services.id)
- **customer_id** (UUID, Foreign Key → users.id)
- **provider_id** (UUID, Foreign Key → users.id)
- **status** (Enum: 'pending', 'confirmed', 'completed', 'cancelled')
- **booking_date** (Timestamp)
- **event_date** (Timestamp)
- **total_price** (Numeric)
- **notes** (Text, Optional)
- **created_at** (Timestamp)
- **updated_at** (Timestamp)

#### 4. `reviews` Table
- **id** (UUID, Primary Key)
- **service_id** (UUID, Foreign Key → services.id)
- **reviewer_id** (UUID, Foreign Key → users.id)
- **provider_id** (UUID, Foreign Key → users.id)
- **rating** (Numeric, 0-5)
- **comment** (Text, Optional)
- **created_at** (Timestamp)
- **updated_at** (Timestamp)

#### 5. `conversations` Table
- **id** (UUID, Primary Key)
- **participant_1_id** (UUID, Foreign Key → users.id)
- **participant_2_id** (UUID, Foreign Key → users.id)
- **last_message** (Text, Optional)
- **last_message_at** (Timestamp, Optional)
- **created_at** (Timestamp)
- **updated_at** (Timestamp)

#### 6. `messages` Table
- **id** (UUID, Primary Key)
- **conversation_id** (UUID, Foreign Key → conversations.id)
- **sender_id** (UUID, Foreign Key → users.id)
- **content** (Text)
- **read** (Boolean, Default: false)
- **created_at** (Timestamp)

#### 7. `otp_verifications` Table
- **id** (UUID, Primary Key)
- **phone** (Text)
- **otp_code** (Text)
- **expires_at** (Timestamp)
- **verified** (Boolean, Default: false)
- **created_at** (Timestamp)

## Authentication Flow

### Registration Flow (Phone-based OTP)

1. **Step 1: Send OTP**
   - User enters phone number
   - API: `POST /api/auth/send-phone-otp`
   - OTP is generated and stored in `otp_verifications` table
   - OTP expires in 10 minutes

2. **Step 2: Verify OTP**
   - User enters 6-digit OTP
   - API: `POST /api/auth/verify-phone-otp`
   - OTP is validated against the database
   - Phone is marked as verified in session storage

3. **Step 3: Complete Profile**
   - User enters first name, last name, email (optional), and role
   - API: `POST /api/auth/complete-phone-registration`
   - User profile is created in `users` table
   - Supabase auth user is created with temporary password
   - User is automatically logged in

### Login Flow (Phone-based OTP)

1. **Step 1: Send OTP**
   - User enters phone number
   - API: `POST /api/auth/send-phone-otp`
   - OTP is generated and stored

2. **Step 2: Verify OTP and Login**
   - User enters 6-digit OTP
   - API: `POST /api/auth/phone-login`
   - OTP is validated
   - User data is retrieved from `users` table
   - User is logged in

## New Pages

### `/register-phone`
Multi-step registration page with:
- Phone number input
- OTP verification
- Profile completion (name, email, role)

### `/login-phone`
Two-step login page with:
- Phone number input
- OTP verification

## API Routes

### Authentication
- `POST /api/auth/send-phone-otp` - Send OTP to phone
- `POST /api/auth/verify-phone-otp` - Verify OTP
- `POST /api/auth/complete-phone-registration` - Complete registration
- `POST /api/auth/phone-login` - Login with phone OTP

### Services (Supabase)
- `GET /api/services-supabase` - Get all services with search/filter
- `POST /api/services-supabase` - Create new service
- `GET /api/services-supabase/[id]` - Get service details
- `PUT /api/services-supabase/[id]` - Update service
- `DELETE /api/services-supabase/[id]` - Delete service

### Bookings (Supabase)
- `GET /api/bookings-supabase` - Get user's bookings
- `POST /api/bookings-supabase` - Create new booking
- `GET /api/bookings-supabase/[id]` - Get booking details
- `PUT /api/bookings-supabase/[id]` - Update booking status
- `DELETE /api/bookings-supabase/[id]` - Cancel booking

## Environment Variables

Add these to your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## AuthContext Updates

The `AuthContext` now includes:
- `sendPhoneOtp(phone: string)` - Send OTP
- `verifyPhoneOtp(phone: string, otp: string)` - Verify OTP
- `completePhoneRegistration(userData)` - Complete registration
- Legacy methods still available for backward compatibility

## User Interface

### Updated Components
- `AuthContext` - Added phone OTP methods
- `SupabaseProvider` - Wraps app with Supabase session

### New Pages
- `/register-phone` - Phone-based registration
- `/login-phone` - Phone-based login

## SMS Integration (TODO)

Currently, OTPs are logged to console in development. For production, integrate with:
- **Twilio** - SMS delivery service
- **AWS SNS** - Amazon Simple Notification Service
- **Firebase Cloud Messaging** - Google's messaging service

Update `/api/auth/send-phone-otp` to send actual SMS messages.

## Data Migration (From MongoDB)

To migrate existing MongoDB data to Supabase:

1. Export MongoDB collections as JSON
2. Transform data to match Supabase schema
3. Import into Supabase tables using SQL or API

Example migration script:
```typescript
// Transform MongoDB user to Supabase user
const mongoUser = { firstName, lastName, email, phone, role };
const supabaseUser = {
  phone,
  first_name: mongoUser.firstName,
  last_name: mongoUser.lastName,
  email: mongoUser.email,
  role: mongoUser.role,
  is_verified: true,
  rating: 0,
  review_count: 0,
};
```

## Testing

### Manual Testing Checklist
- [ ] Register with phone OTP
- [ ] Login with phone OTP
- [ ] Create service
- [ ] View service details
- [ ] Create booking
- [ ] Update booking status
- [ ] Leave review
- [ ] Send message

### Development OTP
In development mode, OTPs are returned in the API response for testing:
```json
{
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

## Rollback Plan

If issues occur:
1. Keep MongoDB running in parallel during transition
2. Maintain JWT tokens for backward compatibility
3. Use feature flags to switch between old/new auth
4. Keep old API routes available

## Next Steps

1. ✅ Set up Supabase database schema
2. ✅ Create phone OTP authentication
3. ✅ Create new registration/login pages
4. ✅ Create Supabase API routes
5. ⏳ Migrate existing MongoDB data
6. ⏳ Update all components to use Supabase
7. ⏳ Integrate SMS service for OTP delivery
8. ⏳ Test end-to-end flows
9. ⏳ Deploy to production

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review API route implementations
3. Check browser console for errors
4. Review Supabase dashboard for database issues
