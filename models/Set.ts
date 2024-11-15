// models/Set.ts

import mongoose, { Schema, Document } from "mongoose";

interface SetDocument extends Document {
  setId: string;
  userId: string;
  setName: string;
  tuneIds: string[];
  recordingRef?: string[];
  links?: string[];
  comments?: string;
  dateAdded: Date;
}

const SetSchema: Schema = new Schema({
  setId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, ref: "User" }, // FK to User
  setName: { type: String, default: "" },
  tuneIds: [{ type: String, required: true, ref: "Tune" }], // FK to Tunes, order matters
  recordingRef: [{ type: String }],
  links: [{ type: String }],
  comments: { type: String },
  dateAdded: { type: Date, default: Date.now, required: true },
});

export default mongoose.model<SetDocument>("Set", SetSchema);
