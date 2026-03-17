import mongoose, { Schema, Document, trusted } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  quantity: number;
  unit: string;            // например 'шт', 'кг', 'л'
  expiryDate: Date;
  category?: string;
  price?: number;
  createdAt: Date;
  userId: mongoose.Types.ObjectId;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true, index: true},
  isCommon: { type: Boolean, default: false, index: true }, // индекс тоже ускорит фильтрацию
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, default: 'шт' },
  expiryDate: { type: Date, required: true },
  category: { type: String },
  price: { type: Number, min: 0 },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.model<IProduct>('Product', ProductSchema);