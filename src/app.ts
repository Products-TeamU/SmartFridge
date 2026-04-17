import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';
import productRoutes from './routes/productRoutes';
import authRoutes from './routes/authRoutes';
import familyRoutes from './routes/familyRoutes';
import commonProductRoutes from './routes/commonProductRoutes';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import ocrRoutes from './routes/ocrRoutes';


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SmartFridge API',
      version: '1.0.0',
      description: 'API для управления продуктами и сброса пароля',
    },
    servers: [{ url: 'https://smartfridge-ouxh.onrender.com' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {                     // <-- добавляем раздел schemas
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            quantity: { type: 'number' },
            unit: { type: 'string' },
            expiryDate: { type: 'string', format: 'date' },
            category: { type: 'string' },
            price: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            ownerType: { type: 'string', enum: ['personal', 'family'] },
            ownerId: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts', './dist/controllers/*.js'],
};

// Загружаем .env только в режиме разработки
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}
const specs = swaggerJsdoc(swaggerOptions);



const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/family', familyRoutes);
app.use(morgan('dev'));

app.get('/api-docs.json', (req, res) => {
  res.json(specs);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Маршрут для перенаправления на глубокую ссылку
app.get('/reset-password', (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== 'string') {
    return res.status(400).send('Неверная ссылка для сброса пароля');
  }
  const redirectUrl = `SmartFridge://reset-password?token=${encodeURIComponent(token)}`;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Сброс пароля SmartFridge</title>
      <meta http-equiv="refresh" content="0; url=${redirectUrl}">
    </head>
    <body>
      <p>Перенаправление в приложение...</p>
      <p>Если приложение не открывается, <a href="${redirectUrl}">нажмите здесь</a>.</p>
    </body>
    </html>
  `);
});

// API маршруты
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/common', commonProductRoutes);
app.use('/api/ocr', ocrRoutes);
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