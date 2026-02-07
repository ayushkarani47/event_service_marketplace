# Event Service Marketplace - Supabase Migration

Complete migration from MongoDB + JWT to Supabase with phone-based OTP authentication.

## 🚀 What's New

### Authentication
- **Phone-based OTP** instead of email/password
- **3-step registration**: Phone → OTP → Profile
- **2-step login**: Phone → OTP
- **Supabase Auth** for secure session management

### Database
- **Supabase PostgreSQL** instead of MongoDB
- **Phone as primary identifier** in users table
- **Row Level Security (RLS)** for data protection
- **Automatic timestamps** and audit trails

### API Routes
- New Supabase-based API routes
- Helper functions for common operations
- Type-safe database operations

## 📋 Prerequisites

- Node.js 16+
- Supabase account (free at https://supabase.com)
- npm or yarn

## ⚡ Quick Setup (5 minutes)

### 1. Create Supabase Project
```bash
# Visit https://supabase.com
# Create new project and copy credentials
```

### 2. Add Environment Variables
Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create Database Schema
- Open Supabase SQL Editor
- Copy content from `supabase/migrations/001_initial_schema.sql`
- Run the SQL

### 4. Start Development
```bash
npm install
npm run dev
```

### 5. Test
- Visit http://localhost:3000/register-phone
- Enter phone number
- Check console for OTP (in development)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── send-phone-otp/route.ts
│   │   │   ├── verify-phone-otp/route.ts
│   │   │   ├── complete-phone-registration/route.ts
│   │   │   └── phone-login/route.ts
│   │   ├── services-supabase/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── bookings-supabase/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── register-phone/page.tsx
│   ├── login-phone/page.tsx
│   └── ...
├── context/
│   └── AuthContext.tsx
├── lib/
│   ├── supabaseClient.ts
│   ├── supabaseHelpers.ts
│   └── ...
├── types/
│   └── types_db.ts
└── ...
supabase/
└── migrations/
    └── 001_initial_schema.sql
```

## 🔐 Authentication Flow

### Registration (3 Steps)

**Step 1: Send OTP**
```
POST /api/auth/send-phone-otp
{
  "phone": "+1234567890"
}
```

**Step 2: Verify OTP**
```
POST /api/auth/verify-phone-otp
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

**Step 3: Complete Profile**
```
POST /api/auth/complete-phone-registration
{
  "phone": "+1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "customer"
}
```

### Login (2 Steps)

**Step 1: Send OTP**
```
POST /api/auth/send-phone-otp
{
  "phone": "+1234567890"
}
```

**Step 2: Verify & Login**
```
POST /api/auth/phone-login
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

## 📊 Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  phone TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role ENUM ('customer', 'service_provider', 'admin'),
  profile_picture TEXT,
  bio TEXT,
  address JSONB,
  rating NUMERIC,
  review_count INTEGER,
  is_verified BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Services Table
```sql
services (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES users(id),
  title TEXT,
  description TEXT,
  category TEXT,
  price NUMERIC,
  images TEXT[],
  location TEXT,
  rating NUMERIC,
  review_count INTEGER,
  availability JSONB,
  features TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Bookings Table
```sql
bookings (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  customer_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES users(id),
  status ENUM ('pending', 'confirmed', 'completed', 'cancelled'),
  booking_date TIMESTAMP,
  event_date TIMESTAMP,
  total_price NUMERIC,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

See `SUPABASE_MIGRATION_GUIDE.md` for complete schema documentation.

## 🛠️ API Routes

### Authentication
- `POST /api/auth/send-phone-otp` - Send OTP
- `POST /api/auth/verify-phone-otp` - Verify OTP
- `POST /api/auth/complete-phone-registration` - Complete registration
- `POST /api/auth/phone-login` - Login with OTP

### Services
- `GET /api/services-supabase` - List services
- `POST /api/services-supabase` - Create service
- `GET /api/services-supabase/[id]` - Get service details
- `PUT /api/services-supabase/[id]` - Update service
- `DELETE /api/services-supabase/[id]` - Delete service

### Bookings
- `GET /api/bookings-supabase` - List bookings
- `POST /api/bookings-supabase` - Create booking
- `GET /api/bookings-supabase/[id]` - Get booking details
- `PUT /api/bookings-supabase/[id]` - Update booking
- `DELETE /api/bookings-supabase/[id]` - Delete booking

## 💻 Using Helper Functions

```typescript
import { 
  userOperations, 
  serviceOperations, 
  bookingOperations 
} from '@/lib/supabaseHelpers';

// Get user by phone
const { data: user } = await userOperations.getByPhone('+1234567890');

// Get all services
const { data: services, count } = await serviceOperations.getAll(10, 0);

// Search services
const { data: results } = await serviceOperations.search('photography', 10, 0);

// Get user's bookings
const { data: bookings } = await bookingOperations.getByCustomerId(userId);

// Create booking
const { data: booking } = await bookingOperations.create({
  service_id: serviceId,
  customer_id: customerId,
  provider_id: providerId,
  event_date: new Date().toISOString(),
  total_price: 500,
});
```

## 🔑 Using AuthContext

```typescript
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    sendPhoneOtp,
    verifyPhoneOtp,
    completePhoneRegistration,
    logout,
  } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}</h1>
      <p>Phone: {user?.phone}</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

## 🧪 Testing

### Development OTP
In development mode, OTPs are returned in API responses:
```json
{
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

### Test Registration
```bash
# 1. Send OTP
curl -X POST http://localhost:3000/api/auth/send-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'

# 2. Verify OTP (use OTP from response)
curl -X POST http://localhost:3000/api/auth/verify-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "otp": "123456"}'

# 3. Complete Registration
curl -X POST http://localhost:3000/api/auth/complete-phone-registration \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "customer"
  }'
```

## 📱 SMS Integration (Production)

For production, integrate with an SMS provider:

### Twilio
1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token
3. Update `/api/auth/send-phone-otp`:

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: `Your OTP is: ${otp}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phone,
});
```

### AWS SNS
1. Set up AWS account and SNS
2. Configure in Supabase dashboard or update API route

### Firebase Cloud Messaging
1. Set up Firebase project
2. Configure in API route

## 🚀 Deployment

### Vercel
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy

### Netlify
1. Connect GitHub repo
2. Add environment variables
3. Deploy

### Environment Variables for Production
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🔄 Migrating from MongoDB

If you have existing MongoDB data:

1. Export MongoDB collections as JSON
2. Transform data to match Supabase schema
3. Import into Supabase using SQL or API

Example:
```typescript
const migrateUsers = async (mongoUsers: any[]) => {
  const supabaseUsers = mongoUsers.map(user => ({
    phone: user.phone,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    role: user.role,
    is_verified: true,
  }));

  const { error } = await supabase
    .from('users')
    .insert(supabaseUsers);

  return { error };
};
```

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` has correct URL and key
- Restart dev server

### OTP not working
- Verify phone format: `+1234567890`
- Check `otp_verifications` table exists
- Check server logs

### Database errors
- Verify all tables exist
- Check RLS policies
- Verify user permissions

### "Not authorized" errors
- Check user is logged in
- Verify user ID in database
- Check RLS policies

## 📚 Documentation

- **Setup Guide**: See `SETUP_GUIDE.md`
- **Migration Guide**: See `SUPABASE_MIGRATION_GUIDE.md`
- **Quick Start**: See `QUICK_START.md`
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## 🔒 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Phone number validation
- ✅ OTP expiration (10 minutes)
- ✅ Secure session management
- ✅ Input validation on all endpoints
- ✅ HTTPS required in production

## 📞 Support

- **Supabase Community**: https://discord.supabase.io
- **GitHub Issues**: Create an issue in your repo
- **Supabase Docs**: https://supabase.com/docs

## 📝 License

MIT License - See LICENSE file for details

## 🎯 Next Steps

1. ✅ Set up Supabase project
2. ✅ Create database schema
3. ✅ Test phone authentication
4. ⏳ Integrate SMS provider
5. ⏳ Migrate existing data
6. ⏳ Update all components
7. ⏳ Deploy to production

---

**Happy coding! 🚀**
