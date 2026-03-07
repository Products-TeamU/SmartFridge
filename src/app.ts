import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database';
import testRoutes from './routes/testRoutes';

dotenv.config();

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use('/api', testRoutes);
app.use(express.json());
app.use(morgan('dev'));

// Базовый маршрут для проверки
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

