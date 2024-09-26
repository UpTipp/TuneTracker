// models/User.ts

import mongoose from 'mongoose';

const TuneStateSchema = new mongoose.Schema({
  tuneId: { type: String, required: true },
  state: { type: String, required: true },
  lastPractice: { type: Date },
  dateAdded: { type: Date, default: Date.now },
  comments: { type: String },
  hidden: { type: Boolean, default: false }
});

const SetStateSchema = new mongoose.Schema({
  setId: { type: String, required: true },
  state: { type: String, required: true },
  lastPractice: { type: Date },
  dateAdded: { type: Date, default: Date.now },
  comments: { type: String },
  hidden: { type: Boolean, default: false }
});

const SessionStateSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  state: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now },
  comments: { type: String },
  hidden: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Unique random hash
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  picture: { type: String, required: true },
  tuneStates: [TuneStateSchema],
  setStates: [SetStateSchema],
  sessionStates: [SessionStateSchema]
});

const User = mongoose.model('user', UserSchema);

export default User;
