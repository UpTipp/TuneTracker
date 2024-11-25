import mongoose, { Schema, Document } from "mongoose";

interface TuneDocument extends Document {
  tuneId: string;
  userId: string;
  tuneName: string;
  tuneType: string;
  tuneKey?: string;
  author?: string;
  recordingRef?: string[];
  links?: string[];
  comments?: string;
  dateAdded: Date;
}

const TuneSchema: Schema = new Schema({
  tuneId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, ref: "User" }, // FK to User
  tuneName: { type: String, required: true },
  tuneType: { type: String, required: true },
  tuneKey: { type: String },
  author: { type: String },
  recordingRef: [{ type: String }],
  links: [{ type: String }],
  comments: { type: String },
  dateAdded: { type: Date, default: Date.now, required: true },
});

export default mongoose.model<TuneDocument>("Tune", TuneSchema);
