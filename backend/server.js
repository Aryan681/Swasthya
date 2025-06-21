import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import triageRoutes from './routes/triage.js';
import { connectWithRetry } from './utils/redisClient.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;


// Middleware
app.use(cors({
  origin: '*',  
}));
  
app.use(express.json());

// Routes
app.use('/api/triage', triageRoutes);
app.use('/admin', adminRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
}); 

connectWithRetry().catch(err => {
  console.error('Redis connection failed, continuing without cache:', err);
}); 