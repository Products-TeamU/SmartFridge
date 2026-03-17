import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database';
import productRoutes from './routes/productRoutes';
import authRoutes from './routes/authRoutes';
import openFoodFactsRoutes from './routes/openFoodFactsRoutes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000; // <-- исправлено

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Маршруты
app.use('/api/openfoodfacts', openFoodFactsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Подключение к БД и запуск сервера
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT} (accessible from network)`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
  });