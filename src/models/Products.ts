import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  category?: string;
  price?: number;
  createdAt: Date;
  ownerType: 'personal' | 'family'; // тип владельца
  ownerId: mongoose.Types.ObjectId; // ссылка на User (если ownerType='personal') или Family (если ownerType='family')
}

const ProductSchema = new Schema({
  name: { type: String, required: true, index: true },
  isCommon: { type: Boolean, default: false, index: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, default: 'шт' },
  expiryDate: { type: Date, required: true },
  category: { type: String },
  price: { type: Number, min: 0 },
  createdAt: { type: Date, default: Date.now },
  ownerType: { type: String, enum: ['personal', 'family'], required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'ownerType' }
  // refPath означает, что ссылка зависит от значения ownerType:
  // если ownerType='personal' -> ссылается на коллекцию 'User'
  // если ownerType='family' -> ссылается на коллекцию 'Family'
});

export default mongoose.model<IProduct>('Product', ProductSchema);