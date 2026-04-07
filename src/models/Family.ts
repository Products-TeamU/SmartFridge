import mongoose, { Schema, Document } from 'mongoose';

export interface IFamily extends Document {
    name: string;
    inviteCode: string;
    members: { userId: mongoose.Types.ObjectId; role: 'admin' | 'member' }[];
    createdAt: Date;
}

const FamilySchema = new Schema<IFamily>({
    name: { type: String, default: 'Моя семья' },
    inviteCode: { type: String, required: true, unique: true },
    members: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            role: { type: String, enum: ['admin', 'member'], default: 'member' },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFamily>('Family', FamilySchema);