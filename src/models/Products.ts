import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  category?: string;
  price?: number;
  createdAt: Date;
  ownerType: 'personal' | 'family';
  ownerId: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId | null;
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
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
});

export default mongoose.model<IProduct>('Product', ProductSchema);