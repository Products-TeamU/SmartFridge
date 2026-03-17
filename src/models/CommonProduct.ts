import mongoose, { Schema, Document } from 'mongoose';

export interface ICommonProduct extends Document {
  name: string;
  category: string;
}

const CommonProductSchema: Schema = new Schema({
  name: { type: String, required: true, index: true },
  category: { type: String, required: true },
});

export default mongoose.model<ICommonProduct>('CommonProduct', CommonProductSchema);