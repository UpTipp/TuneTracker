import mongoose from "mongoose";

// Define the User interface that extends Mongoose's Document
export interface IUser extends Document {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  picture: string;
  tuneStates: Array<{
    tuneId: string;
    state: string;
    lastPractice?: Date;
    dateAdded: Date;
    comments?: string;
    hidden: boolean;
  }>;
  setStates: Array<{
    setId: string;
    state: string;
    lastPractice?: Date;
    dateAdded: Date;
    comments?: string;
    hidden: boolean;
  }>;
  sessionStates: Array<{
    sessionId: string;
    state: string;
    dateAdded: Date;
    comments?: string;
    hidden: boolean;
  }>;
  dateAdded: Date;
}

const possibleStates = ["know", "learning", "want-to-learn", "relearn"];

const TuneStateSchema = new mongoose.Schema({
  tuneId: { type: String, required: true },
  state: { type: String, required: true, enum: possibleStates },
  lastPractice: { type: Date },
  dateAdded: { type: Date, default: Date.now },
  comments: { type: String },
  hidden: { type: Boolean, default: false },
});

const SetStateSchema = new mongoose.Schema({
  setId: { type: String, required: true },
  state: { type: String, required: true, enum: possibleStates },
  lastPractice: { type: Date },
  dateAdded: { type: Date, default: Date.now },
  comments: { type: String },
  hidden: { type: Boolean, default: false },
});

const SessionStateSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  state: { type: String, required: true, enum: possibleStates },
  dateAdded: { type: Date, default: Date.now },
  comments: { type: String },
  hidden: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Unique random hash
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
  picture: { type: String, required: true },
  tuneStates: [TuneStateSchema],
  setStates: [SetStateSchema],
  sessionStates: [SessionStateSchema],
  dateAdded: { type: Date, default: Date.now, required: true },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
