import mongoose, { Schema, Document } from 'mongoose';

// Fix: We use Omit<Document, '_id'> to tell TS to ignore the default ObjectId type
// so we can define _id as a string.
export interface ICounter extends Omit<Document, '_id'> {
  _id: string; // The namespace (e.g., 'user_id')
  seq: number; // The current sequence value
}

const CounterSchema: Schema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

export default mongoose.model<ICounter>('Counter', CounterSchema);