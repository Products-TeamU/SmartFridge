// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import CommonProduct from '../src/models/CommonProduct';

// dotenv.config();

// const commonProducts = [
//   { name: 'Молоко', category: 'Молочные' },
//   { name: 'Масло', category: 'Молочные' },
//   { name: 'Мороженое', category: 'Десерты' },
//   { name: 'Макароны', category: 'Бакалея' },
//   { name: 'Мандарины', category: 'Фрукты' },
//   { name: 'Хлеб', category: 'Выпечка' },
//   { name: 'Яйца', category: 'Молочные' },
//   { name: 'Сыр', category: 'Молочные' },
//   { name: 'Кефир', category: 'Молочные' },
// ];

// const seed = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI!);
//     console.log('✅ Connected to MongoDB');

//     await CommonProduct.deleteMany({});
//     await CommonProduct.insertMany(commonProducts);
//     console.log(`✅ Добавлено ${commonProducts.length} общих продуктов`);

//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Ошибка:', error);
//     process.exit(1);
//   }
// };

// seed();