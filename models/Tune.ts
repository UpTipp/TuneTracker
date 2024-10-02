import mongoose, { Schema, Document } from 'mongoose';

interface TuneDocument extends Document {
  tuneId: string;
  userId: string;
  tuneName: string;
  tuneType: string;
  author?: string;
  recordingRef?: string[];
  links?: string[];
  comments?: string;
}

const TuneSchema: Schema = new Schema({
  tuneId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, ref: 'User' }, // FK to User
  tuneName: { type: String, required: true },
  tuneType: { type: String, required: true },
  author: { type: String },
  recordingRef: [{ type: String }],
  links: [{ type: String }],
  comments: { type: String }
});

export default mongoose.model<TuneDocument>('Tune', TuneSchema);
