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

// Extend the Request interface to include tuneId
interface CustomRequest extends Request {
  setId: any;
  tuneId?: string;
}

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
  ttl: 24 * 60 * 60,
  autoRemove: "native",
  touchAfter: 24 * 3600, // Update only once per 24 hours
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

// Update session configuration - make sure this comes BEFORE any route handlers
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain:
        process.env.NODE_ENV === "production"
          ? ".charlescrossan.com"
          : undefined,
    },
    store: sessionStore,
    name: "sessionId", // This ensures the cookie is named "sessionId"
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Add this debugging middleware before any route handlers
app.use((req, res, next) => {
  console.log("\n=== Session Debug Info ===");
  console.log("Cookies:", req.headers.cookie);
  console.log("Session ID:", req.sessionID);
  console.log("Session:", {
    ...req.session,
    cookie: {
      ...req.session?.cookie,
      expires: req.session?.cookie?.expires,
      maxAge: req.session?.cookie?.maxAge,
    },
  });
  console.log("Is Authenticated:", req.isAuthenticated());
  console.log("User:", req.user);
  console.log("=== End Session Debug ===\n");
  next();
});

// Add this middleware before your routes
app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    console.log("Request cookies:", req.cookies);
    console.log("Session ID:", req.sessionID);
    console.log("Session data:", req.session);
  }
  next();
});

// Use CORS middleware with updated configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://music.charlescrossan.com"
        : "http://localhost:3002",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// Add debug middleware for cookie inspection
app.use((req, res, next) => {
  console.log("\n=== Cookie Debug Info ===");
  console.log("Raw Cookies Header:", req.headers.cookie);
  console.log("Parsed Cookies:", req.cookies);
  console.log("Session Cookie:", req.sessionID);
  console.log("=== End Cookie Debug ===\n");
  next();
});

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

// Add MIME type configuration
app.use((req, res, next) => {
  if (req.path.endsWith(".mp3")) {
    res.type("audio/mpeg");
    res.set({
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=0",
    });
  }
  next();
});

// Update static file serving configuration
app.use(
  "/uploads/tunes",
  express.static(path.join(__dirname, "uploads", "tunes"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".mp3")) {
        res.set({
          "Accept-Ranges": "bytes",
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=0",
        });
      }
    },
  })
);

app.use(
  "/uploads/sets",
  express.static(path.join(__dirname, "uploads", "sets"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".mp3")) {
        res.set({
          "Accept-Ranges": "bytes",
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=0",
        });
      }
    },
  })
);

app.use(
  "/uploads/sessions",
  express.static(path.join(__dirname, "uploads", "sessions"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".mp3")) {
        res.set({
          "Accept-Ranges": "bytes",
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=0",
        });
      }
    },
  })
);

// Add byte-range request handler
app.get("*/uploads/**/*.mp3", (req, res, next) => {
  if (req.headers.range) {
    const filePath = path.join(__dirname, req.path);
    const stat = fs.statSync(filePath);
    const range = req.headers.range;
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "audio/mpeg",
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    next();
  }
});

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
  async (user: Express.User, done: (err: any, user?: any) => void) => {
    try {
      done(null, user); // Return the user object after fetching from the database
    } catch (err) {
      done(err, null); // Handle error
    }
  }
);

/*  Middleware for files specifically recordings  */
const storageTune = multer.diskStorage({
  destination: function (req: CustomRequest, file, cb) {
    const tuneId = req.tuneId;
    const dir = path.join("uploads", "tunes", tuneId);

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
  destination: function (req: CustomRequest, file, cb) {
    const setId = req.setId;
    const dir = path.join("uploads", "sets", setId);

    // Ensure directory exists or create it
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir); // Set directory as the destination
  },
  filename: function (req: CustomRequest, file, cb) {
    // Find the next sequential number for the file
    const setId = req.setId;
    const dir = path.join("uploads", "sets", setId);
    const files = fs.readdirSync(dir);
    const nextIndex = files.length + 1; // Increment based on current files in the directory
    const ext = ".mp3"; // Directly set the extension to .mp3
    cb(null, `${nextIndex}${ext}`); // Name files sequentially
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

    // Set session data
    req.session.userId = user.userId;
    req.session.isAdmin = user.isAdmin;
    req.session.email = user.email;

    // Force session save before setting cookies
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).send("Error saving session");
      }

      console.log("Session saved successfully:", {
        sessionID: req.sessionID,
        userId: req.session.userId,
        isAuthenticated: req.isAuthenticated(),
      });

      const userInfo = {
        id: user.userId,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      // Set cookie with explicit attributes
      res.cookie("user", JSON.stringify(userInfo), {
        secure: process.env.NODE_ENV === "production",
        httpOnly: false,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain:
          process.env.NODE_ENV === "production"
            ? ".charlescrossan.com"
            : undefined,
        path: "/",
      });

      res.redirect("/user/" + user.userId);
    });
  }
);

// Add session logging middleware
app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    console.log("Request session data:", {
      sessionID: req.sessionID,
      userId: req.session?.userId,
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
    });
  }
  next();
});

// Create an auth check middleware function
const requireAuth = (req, res, next) => {
  console.log("\n=== Auth Check ===");
  console.log("Session ID:", req.sessionID);
  console.log("Is Authenticated:", req.isAuthenticated());
  console.log("Session User:", req.session?.userId);
  console.log("Passport User:", req.user);
  console.log("=== End Auth Check ===\n");

  if (!req.isAuthenticated()) {
    console.log("Authentication failed");
    return res.status(401).send("Not authenticated");
  }
  console.log("Authentication successful");
  next();
};

// Keep these functions with their full implementations
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

async function createSetId(req, res, next) {
  console.log("Generating setId...");
  let attempts = 0;
  const maxAttempts = 10; // Set a maximum number of attempts to avoid infinite loop

  while (attempts < maxAttempts) {
    let setId = crypto.randomBytes(16).toString("hex");
    const existingSet = await Set.findOne({ setId: setId });

    if (!existingSet) {
      req.setId = setId; // Set setId directly on the req object
      console.log("Generated setId:", setId);
      return next();
    }

    console.log("Duplicate setId found, regenerating...");
    attempts++;
  }

  console.error(
    "Failed to generate a unique setId after",
    maxAttempts,
    "attempts"
  );
  return res.status(500).send("Failed to generate a unique setId");
}

// Add this logging middleware before your routes
app.use((req, res, next) => {
  const start = Date.now();

  // Log request details
  console.log(`\n=== ${new Date().toISOString()} ===`);
  console.log(`${req.method} ${req.url}`);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Query:", JSON.stringify(req.query, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log(
    "User:",
    req.user ? `ID: ${(req.user as IUser).userId}` : "Not authenticated"
  );

  // Log response details
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`Response Status: ${res.statusCode}`);
    console.log(`Response Time: ${duration}ms`);
    console.log("=== End ===\n");
  });

  next();
});

// Protected routes that need authentication
app.put("/api/users/:id/state", requireAuth, async (req, res) => {
  const { id } = req.params;
  const user = req.user as IUser;

  if (!user) {
    return res.status(401).send("Not authenticated");
  }

  if (user.userId !== id) {
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

    // Update the main item's state
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

    // Handle nested items states
    if (itemName === "set") {
      // Find the set to get its tunes
      const set = await Set.findOne({ setId: itemId });
      if (set && set.tuneIds) {
        // Update state for all tunes in the set
        for (const tuneId of set.tuneIds) {
          const tuneState = user.tuneStates.find(
            (state) => state.tuneId === tuneId
          );
          if (tuneState) {
            tuneState.state = state;
          }
        }
      }
    } else if (itemName === "session") {
      // Find the session to get its tunes and sets
      const session = await Session.findOne({ sessionId: itemId });
      if (session) {
        // Update state for all tunes in the session
        if (session.tuneIds) {
          for (const tuneId of session.tuneIds) {
            const tuneState = user.tuneStates.find(
              (state) => state.tuneId === tuneId
            );
            if (tuneState) {
              tuneState.state = state;
            }
          }
        }
        // Update state for all sets in the session and their tunes
        if (session.setIds) {
          for (const setId of session.setIds) {
            // Update the set's state
            const setState = user.setStates.find(
              (state) => state.setId === setId
            );
            if (setState) {
              setState.state = state;
            }

            // Find the set to get its tunes
            const set = await Set.findOne({ setId });
            if (set && set.tuneIds) {
              // Update state for all tunes in the set
              for (const tuneId of set.tuneIds) {
                const tuneState = user.tuneStates.find(
                  (state) => state.tuneId === tuneId
                );
                if (tuneState) {
                  tuneState.state = state;
                }
              }
            }
          }
        }
      }
    }

    await user.save();
    return res.status(200).send("User state updated successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error updating user state");
  }
});

app.post("/api/users/:id/:type", requireAuth, async (req, res) => {
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

    const currentTime = new Date();
    state.lastPractice = currentTime;

    // Handle nested items
    if (type === "set") {
      // Find the set to get its tunes
      const set = await Set.findOne({ setId: stateId });
      if (set && set.tuneIds) {
        // Update lastPractice for all tunes in the set
        for (const tuneId of set.tuneIds) {
          const tuneState = user.tuneStates.find(
            (state) => state.tuneId === tuneId
          );
          if (tuneState) {
            tuneState.lastPractice = currentTime;
          }
        }
      }
    } else if (type === "session") {
      // Find the session to get its tunes and sets
      const session = await Session.findOne({ sessionId: stateId });
      if (session) {
        // Update lastPractice for all tunes in the session
        if (session.tuneIds) {
          for (const tuneId of session.tuneIds) {
            const tuneState = user.tuneStates.find(
              (state) => state.tuneId === tuneId
            );
            if (tuneState) {
              tuneState.lastPractice = currentTime;
            }
          }
        }
        // Update lastPractice for all sets in the session
        if (session.setIds) {
          for (const setId of session.setIds) {
            // Update the set's lastPractice
            const setState = user.setStates.find(
              (state) => state.setId === setId
            );
            if (setState) {
              setState.lastPractice = currentTime;
            }

            // Find the set to get its tunes
            const set = await Set.findOne({ setId });
            if (set && set.tuneIds) {
              // Update lastPractice for all tunes in the set
              for (const tuneId of set.tuneIds) {
                const tuneState = user.tuneStates.find(
                  (state) => state.tuneId === tuneId
                );
                if (tuneState) {
                  tuneState.lastPractice = currentTime;
                }
              }
            }
          }
        }
      }
    }

    await user.save();
    return res.status(201).send("User state updated successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error updating user state");
  }
});

app.post("/api/tunes", createTuneId, requireAuth, (req: CustomRequest, res) => {
  console.log("[POST /api/tunes] Creating new tune");
  console.log("TuneId:", req.tuneId);
  const currentUser = req.user as IUser;
  if (!currentUser) {
    return res.status(401).send("Not authenticated");
  }

  console.log("Session data:", req.session);
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
        userId: currentUser.userId, // User ID from session
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
      let user = await User.findOne({ userId: currentUser.userId });
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

app.put("/api/tunes/:id", requireAuth, async (req: CustomRequest, res) => {
  console.log("[PUT /api/tunes/:id] Updating tune:", req.params.id);
  const user = req.user as IUser;
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

      if (!user.isAdmin && tune.userId !== user.userId) {
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

app.post("/api/sets", createSetId, requireAuth, (req: CustomRequest, res) => {
  console.log("[POST /api/sets] Creating new set");
  console.log("SetId:", req.setId);
  console.log("Incoming request to /api/sets");
  let setId = req.setId;
  uploadSet(req, res, async (err) => {
    console.log("Set Id:", setId);
    if (err) {
      console.error(err);
      return res.status(500).send("Error uploading files");
    }

    const { setName, author, tunes, links, comments } = req.body;

    if (!req.session || !req.session.userId) {
      return res.status(403).send("Not Logged In!");
    }

    if (!setName || tunes.length < 2) {
      return res
        .status(400)
        .send("Missing required fields: setName or tunes[>=2]");
    }

    const user = await User.findOne({ userId: req.session.userId });

    let uploadTunes = [];
    for (let tune in tunes) {
      console.log("Checking tune:", tunes[tune]);
      if (
        !user.tuneStates
          .map((tuneState) => tuneState.tuneId)
          .includes(tunes[tune])
      ) {
        return res
          .status(400)
          .send("Tune not found in user's tuneStates: " + tunes[tune]);
      } else {
        uploadTunes.push(tunes[tune]);
      }
    }

    try {
      // Ensure req.files is treated as an array
      const files = req.files as Express.Multer.File[];

      // Create an array of uploaded file paths (recording references)
      const recordingRefs = files
        ? files.map((file: Express.Multer.File) => file.path)
        : [];

      const newSet = new Set({
        setId,
        userId: req.session.userId, // User ID from session
        setName,
        tuneIds: uploadTunes,
        recordingRef: recordingRefs, // Store the file paths
        links,
        comments,
        dateAdded: new Date(),
      });

      await newSet.save();

      // Add the tune to the user's tuneStates
      let user = await User.findOne({ userId: req.session.userId });
      user.setStates.push({
        setId,
        state: "want-to-learn",
        lastPractice: new Date(),
        dateAdded: new Date(),
        comments: "",
        hidden: false,
      });
      await user.save();

      return res
        .status(201)
        .json({ message: "Tune created successfully", set: newSet });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error creating set");
    }
  });
});

app.put("/api/sets/:id", requireAuth, async (req: CustomRequest, res) => {
  console.log("[PUT /api/sets/:id] Updating set:", req.params.id);
  const user = req.user as IUser;
  req.setId = req.params.id; // Set the setId on the request object
  uploadSet(req, res, async (err) => {
    const { id } = req.params;
    let { fileCommands } = req.body; // Expect an array of commands for the existing recordings
    fileCommands = JSON.parse(fileCommands) || []; // Ensure fileCommands is an array

    try {
      const set = await Set.findOne({ setId: id });
      console.log("Set: ", set);
      if (!set) {
        return res.status(404).send("No Tune Found!");
      }

      if (!user.isAdmin && set.userId !== user.userId) {
        return res.status(403).send("Not authorized to update this set!");
      }

      const recordingsDir = path.join(__dirname, "uploads", "sets", set.setId);
      const existingRecordings = set.recordingRef || [];
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
        path.join("/uploads/tunes", set.setId, file)
      );
      set.recordingRef = updatedRecordings;

      // Update other fields
      if (req.body.setName && req.body.setName !== "") {
        set.setName = req.body.setName;
      }

      if (req.body.links) {
        set.links = req.body.links;
      }

      if (req.body.comments) {
        set.comments = req.body.comments;
      }

      await set.save();
      return res.status(200).json(set);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error updating set");
    }
  });
});

app.post("/api/sessions", requireAuth, uploadSession, async (req, res) => {
  console.log("[POST /api/sessions] Creating new session");
  console.log("SessionId:", req.body.sessionId);
  const user = req.user as IUser;
  if (!user) {
    return res.status(401).send("Not authenticated");
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
      userId: user.userId,
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

app.delete("/api/sessions/:id", requireAuth, async (req, res) => {
  console.log("[DELETE /api/sessions/:id] Deleting session:", req.params.id);
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

// Public routes (no auth required)
app.get("/api/users-top", async (req, res) => {
  console.log("[GET /api/users-top] Retrieving top users");
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

// New Users
app.get("/api/users-new", async (req, res) => {
  console.log("[GET /api/users-new] Retrieving new users");
  try {
    const newUsers = await User.find()
      .sort({ dateAdded: -1 })
      .limit(10)
      .select("userId firstName lastName picture dateAdded");

    return res.status(200).json(newUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error retrieving new users");
  }
});

// New Tunes
app.get("/api/tunes-new", async (req, res) => {
  console.log("[GET /api/tunes-new] Retrieving new tunes");
  try {
    const newTunes = await Tune.find()
      .sort({ dateAdded: -1 })
      .limit(10)
      .select("tuneId tuneName userId tuneType dateAdded");

    // Get user details for each tune
    const tunesWithUserDetails = await Promise.all(
      newTunes.map(async (tune) => {
        const user = await User.findOne({ userId: tune.userId }).select(
          "firstName lastName"
        );
        return {
          ...tune.toObject(),
          userId: tune?.userId,
          firstName: user?.firstName,
          lastName: user?.lastName,
        };
      })
    );

    return res.status(200).json(tunesWithUserDetails);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error retrieving new tunes");
  }
});

// User Continued
// Single User
app.get("/api/users/:id", async (req, res) => {
  console.log("[GET /api/users/:id] Retrieving user:", req.params.id);
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

// Getting a Specific Tune
app.get("/api/tunes/:id", async (req, res) => {
  console.log("[GET /api/tunes/:id] Retrieving tune:", req.params.id);
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

// Getting a specific Set
app.get("/api/sets/:id", async (req, res) => {
  console.log("[GET /api/sets/:id] Retrieving set:", req.params.id);
  const { id } = req.params;

  try {
    const set = await Set.findOne({ setId: id });

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

// Getting a Session
app.get("/api/sessions/:id", async (req, res) => {
  console.log("[GET /api/sessions/:id] Retrieving session:", req.params.id);
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

// Add this new logout route after the Google auth routes
app.get("/logout/", (req, res) => {
  console.log("[GET /logout] User logging out");
  console.log(
    "User:",
    req.user ? `ID: ${(req.user as IUser).userId}` : "Not authenticated"
  );
  // Clear the session
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Logout failed");
    }

    // Destroy the session
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

      // Clear all cookies
      res.clearCookie("sessionId", {
        path: "/",
        domain:
          process.env.NODE_ENV === "production"
            ? ".charlescrossan.com"
            : undefined,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      res.clearCookie("user", {
        path: "/",
        domain:
          process.env.NODE_ENV === "production"
            ? ".charlescrossan.com"
            : undefined,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      // Send success response
      res.status(200).send("Logged out successfully");
    });
  });
});

// Replace the existing static file serving with this new middleware
app.get("/uploads/:type/:id/*.mp3", (req, res) => {
  const filePath = path.join(__dirname, req.path);
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });

    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-cache",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "audio/mpeg",
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache",
    };

    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Handle other routes by serving the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./build", "index.html"));
});
