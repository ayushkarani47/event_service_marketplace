import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import errorHandler from './middleware/error';

// Route imports
import authRoutes from './routes/auth';
import serviceRoutes from './routes/services';
import bookingRoutes from './routes/bookings';
import reviewRoutes from './routes/reviews';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app: Express = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
}); 