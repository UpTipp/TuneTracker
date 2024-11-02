// models/Session.ts

import mongoose, { Schema, Document } from 'mongoose';

interface SessionDocument extends Document {
  sessionId: string;
  userId: string;
  sessionName: string;
  tuneIds: string[];
  setIds: string[];
  links?: string[];
  recordingRef?: string[];
  comments?: string;
}

const SessionSchema: Schema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, ref: 'User' }, // FK to User
  sessionName: { type: String, default: '' },
  tuneIds: [{ type: String, ref: 'Tune' }], // FK to Tunes
  setIds: [{ type: String, ref: 'Set' }],   // FK to Sets
  recordingRef: [{ type: String }],
  links: [{ type: String }],
  comments: { type: String }
});

export default mongoose.model<SessionDocument>('session', SessionSchema);
