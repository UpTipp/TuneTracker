/*
  server.ts

  Backend of the website!
*/

/* Database Models */
import User, { IUser } from "./models/User";
import Tune from "./models/Tune";
import Set from "./models/Set";
import Session from "./models/Session";

/*  Important Modules!  */
import dotenv from "dotenv";
import express, { Request } from "express";

// Extend the Request interface to include tuneId
interface CustomRequest extends Request {
  tuneId?: string;
}
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import crypto from "crypto";
import multer from "multer";
import fs from "fs";

dotenv.config(); // Initialize dotenv

/*  Database Setup!  */
const mongoDB: string = process.env.MONGO_URI!;

mongoose
  .connect(mongoDB)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err: unknown) => console.error("MongoDB connection error:", err));

// Initialize the MongoStore when setting up the session
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: "userSessions",
  ttl: 24 * 60 * 60, // = 1 day. Default is 1 day if you want to set a different TTL.
});

/* Setting Server Up */

// Initialize Express app
const app = express();
const port: string = process.env.PORT!;
const secret: string = process.env.SESSION_SECRET!;

// Add this line to parse JSON request bodies
app.use(express.json());

// Add this line to parse form-data request bodies
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration for session cookies
      secure: process.env.NODE_ENV === "production", // Set to true in production (https only)
      httpOnly: true,
    },
    store: sessionStore,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Use CORS middleware
app.use(cors());

// Serve static files from the 'build' directory
app.use("/", express.static(path.join(__dirname, "./build")));
app.use(
  "/uploads/tunes",
  express.static(path.join(__dirname, "uploads", "tunes"))
);
app.use(
  "/uploads/sets",
  express.static(path.join(__dirname, "uploads", "sets"))
);
app.use(
  "/uploads/sessions",
  express.static(path.join(__dirname, "uploads", "sessions"))
);

// Google Passport Continued
const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET!;

// Define GoogleProfile interface
interface GoogleProfile {
  id: string;
  displayName: string;
  given_name: string;
  family_name: string;
  email: string;
  emails: { value: string; type?: string }[];
  picture: string;
  photos: { value: string; type?: string }[];
  // Add other fields as necessary
}

const authUser = (
  request: Request,
  accessToken: string,
  refreshToken: string,
  profile: GoogleProfile,
  done: (error: any, user?: any) => void
) => {
  return done(null, profile);
};

//Use "GoogleStrategy" as the Authentication Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL:
        (process.env.NODE_ENV === "production"
          ? `https://music.charlescrossan.com`
          : `http://localhost:${port}`) + `/auth/google/callback`,
      passReqToCallback: true,
    },
    async (
      request: Request,
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        // Check if the user already exists in the database
        let user = await User.findOne({ email: profile.email });

        if (!user) {
          // Create new user logic
          let id: string = crypto.randomBytes(16).toString("hex");
          while (await User.findOne({ userId: id })) {
            id = crypto.randomBytes(16).toString("hex");
          }

          user = new User({
            userId: id,
            email: profile.email,
            firstName: profile.given_name,
            lastName: profile.family_name,
            isAdmin: false,
            picture: profile.picture,
            tuneStates: [],
            setStates: [],
            sessionStates: [],
            dateAdded: new Date(),
          });

          await user.save(); // Save new user to the database
        }

        // Pass the user object to the next middleware
        return done(null, user); // Ensure done is passed the correct parameters
      } catch (error) {
        console.log(error);
        return done(error, null);
      }
    }
  )
);

// Serializing and Deserializing User
passport.serializeUser(
  (user: Express.User, done: (err: any, id?: any) => void) => {
    done(null, user);
  }
);

passport.deserializeUser(
  async (userId: string, done: (err: any, user?: any) => void) => {
    try {
      const user = await User.findOne({ userId: userId });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
);

/*  Middleware for files specifically recordings  */
const storageTune = multer.diskStorage({
  destination: function (req: CustomRequest, file, cb) {
    console.log("Request tuneId in storageTune:", req.tuneId); // Log the tuneId
    const tuneId = req.tuneId; // Use the tuneId from the req object
    console.log("Tune ID in storageTune destination:", tuneId); // Log the tuneId
    const dir = path.join("uploads", "tunes", tuneId); // Directory for tune's recordings

    // Ensure directory exists or create it
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir); // Set directory as the destination
  },
  filename: function (req: CustomRequest, file, cb) {
    // Find the next sequential number for the file
    const tuneId = req.tuneId;
    console.log("Tune ID in storageTune filename:", tuneId); // Log the tuneId
    const dir = path.join("uploads", "tunes", tuneId);
    const files = fs.readdirSync(dir);
    const nextIndex = files.length + 1; // Increment based on current files in the directory
    const ext = ".mp3"; // Directly set the extension to .mp3
    cb(null, `${nextIndex}${ext}`); // Name files sequentially
  },
});

const storageSet = multer.diskStorage({
  destination: function (req, file, cb) {
    const setId = req.body.setId || crypto.randomBytes(16).toString("hex");
    const dir = path.join(__dirname, "uploads", "sets", setId);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Attach setId to req.body for later use
    req.body.setId = setId;

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const dir = path.join(__dirname, "uploads", "sets", req.body.setId);
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    const nextIndex = files.length + 1;
    const ext = path.extname(".mp3"); // Assuming recordings are .mp3
    cb(null, `${nextIndex}${ext}`);
  },
});

const storageSession = multer.diskStorage({
  destination: function (req, file, cb) {
    const sessionId =
      req.body.sessionId || crypto.randomBytes(16).toString("hex");
    const dir = path.join(__dirname, "uploads", "sessions", sessionId);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Attach sessionId to req.body for later use
    req.body.sessionId = sessionId;

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const dir = path.join(__dirname, "uploads", "sessions", req.body.sessionId);
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    const nextIndex = files.length + 1;
    const ext = path.extname(".mp3"); // Assuming recordings are .mp3
    cb(null, `${nextIndex}${ext}`);
  },
});

// Multer upload config (limit file size to 100MB, adjust if necessary)
const uploadTune = multer({
  storage: storageTune,
  limits: { fileSize: 100 * 1024 * 1024 },
}).array("recordings"); // Ensure the field name matches the form data

const uploadSet = multer({
  storage: storageSet,
  limits: { fileSize: 100 * 1024 * 1024 },
}).array("recordings"); // Ensure the field name matches the form data

const uploadSession = multer({
  storage: storageSession,
  limits: { fileSize: 100 * 1024 * 1024 },
}).array("recordings"); // Ensure the field name matches the form data

/*  Starting and Killing Server  */
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Shutting down...");
  process.exit(0);
});

/* Endpoints and APIs */

// Google Login APIs
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  (req, res) => {
    const user = req.user as IUser;
    req.session.userId = user.userId;
    req.session.isAdmin = user.isAdmin;
    req.session.email = user.email;
    req.session.save();
    if (!user) {
      console.error("No user found in request");
      return res.status(400).send("User not found");
    }

    const userInfo = {
      id: req.session.userId,
      email: req.session.email,
      isAdmin: req.session.isAdmin,
    };

    const sessionExpiration = req.session.cookie.expires || undefined;

    res.cookie("user", JSON.stringify(userInfo), {
      secure: process.env.NODE_ENV === "production",
      expires: sessionExpiration,
      sameSite: "lax",
    });
    // Send a JSON response with additional information
    res.status(200).redirect("/user/" + req.session.userId);
  }
);

// Logout Route
app.get("/logout", (req, res) => {
  if (!req.session) {
    return res.status(400).send("You are already logged out");
  }

  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Logout failed");
    }

    // Manually destroy the session
    req.session.destroy(async (err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).send("Session destruction failed");
      }

      // Remove session from MongoDB
      await sessionStore.destroy(req.sessionID, (err) => {
        if (err) {
          console.error("Failed to remove session from MongoDB:", err);
        } else {
          console.log("Session removed from MongoDB");
        }
      });

      console.log("Session Destroyed!");
      res.redirect("/"); // Redirect to home after logout
    });
  });
});

// Users
app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({ userId: id });

    if (user) {
      return res.status(200).json(JSON.stringify(user));
    } else {
      return res.status(404).send("User not found");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error retrieving user");
  }
});

app.get("/api/users/top", async (req, res) => {
  try {
    const topUsers = await User.aggregate([
      {
        $lookup: {
          from: "tunes",
          localField: "userId",
          foreignField: "userId",
          as: "tunes",
        },
      },
      {
        $addFields: {
          tuneCount: { $size: "$tunes" },
        },
      },
      {
        $sort: { tuneCount: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          userId: 1,
          firstName: 1,
          lastName: 1,
          picture: 1,
          tuneCount: 1,
        },
      },
    ]);

    return res.status(200).json(topUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error retrieving top users");
  }
});

app.put("/api/users/:id/state", async (req, res) => {
  const { id } = req.params;

  if (!req.session || !req.session.userId) {
    return res.status(403).send("Not Logged In!");
  }

  if (req.session.userId != id) {
    return res.status(403).send("Not Authorized!");
  }

  if (!req.body) {
    return res.status(400).send("Missing request body");
  }

  let body = req.body;
  let state = body.state;
  let itemName = body.item;
  let itemId = body.id;
  console.log(body);

  if (!state || !itemName || !itemId) {
    return res.status(400).send("Missing required fields: state, item, itemId");
  }

  try {
    let user = await User.findOne({ userId: id });

    if (user == null) {
      return res.status(500).send("Error updating user state");
    }

    let itemStates = user[itemName + "States"];
    if (itemStates == null) {
      return res.status(404).send("Item not found in user's states");
    }

    let change = false;
    for (let item of itemStates) {
      if (item[itemName + "Id"] == itemId) {
        change = true;
        item.state = state;
      }
    }

    if (!change) {
      return res.status(404).send("Item not found in user's states");
    }

    await user.save();
    return res.status(200).send("User state updated successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error updating user state");
  }
});

app.post("/api/users/:id/:type", async (req, res) => {
  const { id, type } = req.params;

  if (!req.session || !req.session.userId) {
    return res.status(403).send("Not Logged In!");
  }

  if (req.session.userId != id) {
    return res.status(403).send("Not Authorized!");
  }

  try {
    let user = await User.findOne({ userId: id });

    if (user == null) {
      return res.status(404).send("User not found");
    }

    let itemStates = user[type + "States"];
    if (itemStates == null) {
      return res.status(404).send("Item not found in user's states");
    }

    let stateId = req.body.id;
    if (!stateId) {
      return res.status(400).send("Missing required field: id");
    }

    let state = itemStates.find((state) => state[type + "Id"] == stateId);
    if (state == null) {
      return res.status(404).send("Item not found in user's states");
    }

    state.lastPractice = new Date();

    await user.save();
    return res.status(201).send("User state updated successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error updating user state");
  }
});

// Tunes
async function createTuneId(req, res, next) {
  console.log("Generating tuneId...");
  let attempts = 0;
  const maxAttempts = 10; // Set a maximum number of attempts to avoid infinite loop

  while (attempts < maxAttempts) {
    let tuneId = crypto.randomBytes(16).toString("hex");
    const existingTune = await Tune.findOne({ tuneId: tuneId });

    if (!existingTune) {
      req.tuneId = tuneId; // Set tuneId directly on the req object
      console.log("Generated tuneId:", tuneId);
      return next();
    }

    console.log("Duplicate tuneId found, regenerating...");
    attempts++;
  }

  console.error(
    "Failed to generate a unique tuneId after",
    maxAttempts,
    "attempts"
  );
  return res.status(500).send("Failed to generate a unique tuneId");
}

// Posting Tunes
app.post("/api/tunes", createTuneId, (req: CustomRequest, res) => {
  console.log("Incoming request to /api/tunes");
  let tuneId = req.tuneId;
  uploadTune(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error uploading files");
    }

    const { tuneName, tuneType, author, tuneKey, links, comments } = req.body;

    if (!req.session || !req.session.userId) {
      return res.status(403).send("Not Logged In!");
    }

    if (!tuneName || !tuneType) {
      return res
        .status(400)
        .send("Missing required fields: tuneName or tuneType");
    }

    try {
      // Ensure req.files is treated as an array
      const files = req.files as Express.Multer.File[];

      // Create an array of uploaded file paths (recording references)
      const recordingRefs = files
        ? files.map((file: Express.Multer.File) => file.path)
        : [];

      const newTune = new Tune({
        tuneId,
        userId: req.session.userId, // User ID from session
        tuneName,
        tuneType,
        tuneKey,
        author,
        recordingRef: recordingRefs, // Store the file paths
        links,
        comments,
        dateAdded: new Date(),
      });

      await newTune.save();

      // Add the tune to the user's tuneStates
      let user = await User.findOne({ userId: req.session.userId });
      user.tuneStates.push({
        tuneId,
        state: "want-to-learn",
        lastPractice: new Date(),
        dateAdded: new Date(),
        comments: "",
        hidden: false,
      });
      await user.save();

      return res
        .status(201)
        .json({ message: "Tune created successfully", tune: newTune });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error creating tune");
    }
  });
});

// Getting a Specific Tune
app.get("/api/tunes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the tune by its ID
    const tune = await Tune.findOne({ tuneId: id });

    // If no tune is found, return a 404 error
    if (!tune) {
      return res.status(404).send("Tune not found");
    }

    // Attach the recordings to the tune object
    const tuneData = {
      ...tune.toObject(), // Convert Mongoose document to plain object
    };

    // Return the tune data along with the recordings
    return res.status(200).json(tuneData);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error retrieving tune");
  }
});

// Updating a Specific Tune
app.put("/api/tunes/:id", async (req: CustomRequest, res) => {
  req.tuneId = req.params.id; // Set the tuneId on the request object
  uploadTune(req, res, async (err) => {
    const { id } = req.params;
    let { fileCommands } = req.body; // Expect an array of commands for the existing recordings
    fileCommands = JSON.parse(fileCommands) || []; // Ensure fileCommands is an array

    try {
      const tune = await Tune.findOne({ tuneId: id });
      console.log("Tune: ", tune);
      if (!tune) {
        return res.status(404).send("No Tune Found!");
      }

      if (
        req.session &&
        tune.userId !== req.session.userId &&
        !req.session.isAdmin
      ) {
        return res.status(403).send("Not authorized to update this tune!");
      }

      const recordingsDir = path.join(
        __dirname,
        "uploads",
        "tunes",
        tune.tuneId
      );
      const existingRecordings = tune.recordingRef || [];
      console.log("Existing recordings: ", existingRecordings);

      // Ensure req.files is treated as an array
      const newFiles = req.files as Express.Multer.File[];
      let updatedRecordings: string[] = [];

      // Process the commands for existing files
      fileCommands.forEach((command: string, index: number) => {
        console.log(`Processing command: ${command} for index: ${index}`);
        if (index >= existingRecordings.length) {
          return; // Skip if the index is out of bounds
        }
        const existingFile = existingRecordings[index];
        const filePath = path.join(__dirname, existingFile);
        console.log(`Existing file path: ${filePath}`);
        console.log(`File exists: ${fs.existsSync(filePath)}`);

        if (command === "delete" && fs.existsSync(filePath)) {
          // Delete the file
          console.log(`Deleting file: ${filePath}`);
          fs.unlinkSync(filePath);
        } else if (command === "keep") {
          // Keep the file (renamed later)
          updatedRecordings.push(existingFile);
        }
      });

      // Rename existing files to follow sequential numbering (1.mp3, 2.mp3, etc.)
      updatedRecordings = updatedRecordings.map((file, idx) => {
        console.log(`Updating file at index ${idx}`);
        const newFileName = `${idx + 1}.mp3`;
        const oldFilePath = path.join(__dirname, file);
        const newFilePath = path.join(recordingsDir, newFileName);

        if (file !== newFileName && fs.existsSync(oldFilePath)) {
          fs.renameSync(oldFilePath, newFilePath); // Rename the file
        }

        return newFileName;
      });

      // Append new recordings and give them sequential names
      newFiles.forEach((file, idx) => {
        if (file && file.path) {
          const newFileName = `${updatedRecordings.length + idx + 1}.mp3`;
          const newFilePath = path.join(recordingsDir, newFileName);

          // Move the uploaded file to the correct directory with the correct name
          fs.renameSync(file.path, newFilePath);
          updatedRecordings.push(newFileName);
        }
      });

      // Update the tune with the new list of recordings
      updatedRecordings = updatedRecordings.map((file) =>
        path.join("/uploads/tunes", tune.tuneId, file)
      );
      tune.recordingRef = updatedRecordings;

      // Update other fields
      if (req.body.tuneName && req.body.tuneName !== "") {
        tune.tuneName = req.body.tuneName;
      }

      if (req.body.tuneType && req.body.tuneType !== "") {
        tune.tuneType = req.body.tuneType;
      }

      if (req.body.tuneKey) {
        tune.tuneKey = req.body.tuneKey;
      }

      if (req.body.links) {
        tune.links = req.body.links;
      }

      if (req.body.author) {
        tune.author = req.body.author;
      }

      if (req.body.comments) {
        tune.comments = req.body.comments;
      }

      await tune.save();
      return res.status(200).json(tune);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error updating tune");
    }
  });
});

// Deleting a Specific Tune
// app.delete('/api/tunes/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const tune = await Tune.findOne( {tuneId : id} );
//     if (!tune) {
//       return res.status(404).send('No Tune Found!');
//     }

//     if (req.session && (tune.userId !== req.session.userId && !req.session.isAdmin)) {
//       return res.status(403).send('Not authorized to delete this tune!');
//     }

//     // Path to the recordings folder
//     const recordingsDir = path.join(__dirname, 'uploads/tunes', tune.tuneId);

//     // Delete all the recordings in the directory
//     if (fs.existsSync(recordingsDir)) {
//       fs.readdirSync(recordingsDir).forEach(file => {
//         fs.unlinkSync(path.join(recordingsDir, file));
//       });

//       fs.rmdirSync(recordingsDir); // Remove the directory
//     }

//     await Tune.deleteOne({ _id: id }); // Delete the tune from the database

//     return res.status(200).send('Tune deleted successfully');
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send('Error deleting tune');
//   }
// });

// Sets

// Posting Sets
app.post("/api/sets", uploadSet, async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(403).send("Not Logged In!");
  }

  const { setName, tuneIds, comments } = req.body;

  if (!setName || !tuneIds) {
    return res.status(400).send("Missing required fields: setName or tuneIds");
  }

  try {
    const setId = req.body.setId;

    // Ensure req.files is treated as an array
    const files = req.files as Express.Multer.File[];
    const recordingRefs = files ? files.map((file) => file.path) : [];

    const newSet = new Set({
      setId,
      userId: req.session.userId,
      setName,
      tuneIds: JSON.parse(tuneIds), // Assuming tuneIds is a JSON stringified array
      recordingRef: recordingRefs,
      comments,
    });

    await newSet.save();
    return res
      .status(201)
      .json({ message: "Set created successfully", set: newSet });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error creating set");
  }
});

// Getting a specific Set
app.get("/api/sets/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const set = await Set.findOne({ setId: id }).populate("tuneIds");

    if (!set) {
      return res.status(404).send("Set not found");
    }

    const recordingsDir = path.join(__dirname, "uploads", "sets", set.setId);

    let recordings: string[] = [];
    if (fs.existsSync(recordingsDir)) {
      recordings = fs
        .readdirSync(recordingsDir)
        .filter((file) => file.endsWith(".mp3"))
        .map((file) => path.join("/uploads/sets", set.setId, file));
    }

    const setData = {
      ...set.toObject(),
      recordings,
    };

    return res.status(200).json(setData);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error retrieving set");
  }
});

// Updating a Set
app.put("/api/sets/:id", uploadSet, async (req, res) => {
  const { id } = req.params;
  const { recordingActions } = req.body; // Expecting an array of actions like ['keep', 'delete', ...]

  try {
    const set = await Set.findOne({ setId: id });
    if (!set) {
      return res.status(404).send("Set not found");
    }

    // Authorization Check
    if (
      req.session &&
      set.userId !== req.session.userId &&
      !req.session.isAdmin
    ) {
      return res.status(403).send("Not authorized to update this set!");
    }

    const recordingsDir = path.join(__dirname, "uploads", "sets", set.setId);
    const existingRecordings = set.recordingRef || [];

    // Ensure req.files is treated as an array
    const newFiles = req.files as Express.Multer.File[];
    let updatedRecordings: string[] = [];

    // Process the actions for existing recordings
    if (Array.isArray(recordingActions)) {
      recordingActions.forEach((action: string, index: number) => {
        const existingFile = existingRecordings[index];
        if (!existingFile) {
          return; // Skip if no corresponding file
        }
        const filePath = path.join(recordingsDir, path.basename(existingFile));

        switch (action) {
          case "delete":
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath); // Delete the file
              console.log(`Deleted file: ${filePath}`);
            }
            break;
          case "keep":
            updatedRecordings.push(existingFile); // Keep the file
            break;
          default:
            // Handle other actions if necessary
            break;
        }
      });
    } else {
      return res
        .status(400)
        .send("Invalid recordingActions format. Expected an array.");
    }

    // Rename existing kept files to follow sequential numbering (1.mp3, 2.mp3, etc.)
    updatedRecordings = updatedRecordings.map((file, idx) => {
      const newFileName = `${idx + 1}${path.extname(file)}`;
      const oldFilePath = path.join(recordingsDir, path.basename(file));
      const newFilePath = path.join(recordingsDir, newFileName);

      if (path.basename(file) !== newFileName && fs.existsSync(oldFilePath)) {
        fs.renameSync(oldFilePath, newFilePath); // Rename the file
        console.log(`Renamed file from ${oldFilePath} to ${newFilePath}`);
      }

      return `/uploads/sets/${set.setId}/${newFileName}`;
    });

    // Append new recordings and name them sequentially
    if (newFiles && newFiles.length > 0) {
      newFiles.forEach((file, idx) => {
        const newIndex = updatedRecordings.length + idx + 1;
        const newFileName = `${newIndex}${path.extname(file.originalname)}`;
        const newFilePath = path.join(recordingsDir, newFileName);

        fs.renameSync(file.path, newFilePath); // Move and rename the file
        console.log(`Uploaded new file to ${newFilePath}`);

        updatedRecordings.push(`/uploads/sets/${set.setId}/${newFileName}`);
      });
    }

    // Update the Set document
    set.recordingRef = updatedRecordings;

    // Update other fields if provided
    const { setName, tuneIds, comments, links } = req.body;
    if (setName) set.setName = setName;
    if (tuneIds) set.tuneIds = JSON.parse(tuneIds); // Assuming tuneIds is a JSON stringified array
    if (comments) set.comments = comments;
    if (links) set.links = JSON.parse(links); // Assuming links is a JSON stringified array

    await set.save();

    return res.status(200).json({ message: "Set updated successfully", set });
  } catch (error) {
    console.error("Error updating set:", error);
    return res.status(500).send("Error updating set");
  }
});

// Deleting a Set
app.delete("/api/sets/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const set = await Set.findOne({ setId: id });
    if (!set) {
      return res.status(404).send("Set not found");
    }

    if (
      req.session &&
      set.userId !== req.session.userId &&
      !req.session.isAdmin
    ) {
      return res.status(403).send("Not authorized to delete this set!");
    }

    const recordingsDir = path.join(__dirname, "uploads", "sets", set.setId);
    if (fs.existsSync(recordingsDir)) {
      fs.readdirSync(recordingsDir).forEach((file) => {
        fs.unlinkSync(path.join(recordingsDir, file));
      });
      fs.rmdirSync(recordingsDir);
    }

    await Set.deleteOne({ setId: id });

    return res.status(200).send("Set deleted successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error deleting set");
  }
});

// Session

// Posting a Session
app.post("/api/sessions", uploadSession, async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(403).send("Not Logged In!");
  }

  const { sessionName, tuneIds, setIds, comments } = req.body;

  if (!sessionName) {
    return res.status(400).send("Missing required field: sessionName");
  }

  try {
    const sessionId = req.body.sessionId;

    // Ensure req.files is treated as an array
    const files = req.files as Express.Multer.File[];
    const recordingRefs = files ? files.map((file) => file.path) : [];

    const newSession = new Session({
      sessionId,
      userId: req.session.userId,
      sessionName,
      tuneIds: JSON.parse(tuneIds || "[]"), // Assuming tuneIds is a JSON stringified array
      setIds: JSON.parse(setIds || "[]"), // Assuming setIds is a JSON stringified array
      recordingRef: recordingRefs,
      comments,
    });

    await newSession.save();
    return res
      .status(201)
      .json({ message: "Session created successfully", session: newSession });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error creating session");
  }
});

// Getting a Session
app.get("/api/sessions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const session = await Session.findOne({ sessionId: id })
      .populate("tuneIds")
      .populate("setIds");

    if (!session) {
      return res.status(404).send("Session not found");
    }

    const recordingsDir = path.join(
      __dirname,
      "uploads",
      "sessions",
      session.sessionId
    );

    let recordings: string[] = [];
    if (fs.existsSync(recordingsDir)) {
      recordings = fs
        .readdirSync(recordingsDir)
        .filter((file) => file.endsWith(".mp3"))
        .map((file) => path.join("/uploads/sessions", session.sessionId, file));
    }

    const sessionData = {
      ...session.toObject(),
      recordings,
    };

    return res.status(200).json(sessionData);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error retrieving session");
  }
});

// Delete a Session
app.delete("/api/sessions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const session = await Session.findOne({ sessionId: id });
    if (!session) {
      return res.status(404).send("Session not found");
    }

    if (
      req.session &&
      session.userId !== req.session.userId &&
      !req.session.isAdmin
    ) {
      return res.status(403).send("Not authorized to delete this session!");
    }

    const recordingsDir = path.join(
      __dirname,
      "uploads",
      "sessions",
      session.sessionId
    );
    if (fs.existsSync(recordingsDir)) {
      fs.readdirSync(recordingsDir).forEach((file) => {
        fs.unlinkSync(path.join(recordingsDir, file));
      });
      fs.rmdirSync(recordingsDir);
    }

    await Session.deleteOne({ sessionId: id });

    return res.status(200).send("Session deleted successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error deleting session");
  }
});

// Handle other routes by serving the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./build", "index.html"));
});
