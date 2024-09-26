/*  
  server.ts

  Backend of the website!
*/

/* Database Models */
import User from './models/User';

/*  Important Modules!  */
import dotenv from 'dotenv';
import express, { Request } from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy} from 'passport-google-oauth2';
import crypto from 'crypto';

dotenv.config();  // Initialize dotenv


/*  Database Setup!  */
const mongoDB: string = process.env.MONGO_URI!;

mongoose.connect(mongoDB)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err: unknown) => console.error("MongoDB connection error:", err));

// Initialize the MongoStore when setting up the session
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: 'userSessions',
  ttl: 24 * 60 * 60 // = 1 day. Default is 1 day if you want to set a different TTL.
});

/* Setting Server Up */

// Initialize Express app
const app = express();  
const port: string = process.env.PORT!;
const secret: string = process.env.SESSION_SECRET!;

app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,                   // 1 day expiration for session cookies
    secure: process.env.NODE_ENV === 'production', // Set to true in production (https only)
    httpOnly: true
  },
  store: sessionStore,
}));

app.use(passport.initialize());
app.use(passport.session());

// Use CORS middleware
app.use(cors());

// Serve static files from the 'build' directory
app.use('/', express.static(path.join(__dirname, './build')));

// Google Passport Continued
const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET!;

// Define GoogleProfile interface
interface GoogleProfile {
  id: string;
  displayName: string;
  given_name: string,
  family_name: string,
  email: string,
  emails: { value: string; type?: string }[];
  picture: string,
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
passport.use(new GoogleStrategy({
  clientID:     GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `http://localhost:${port}/auth/google/callback`,
  passReqToCallback: true
}, async (request: Request, accessToken: string, refreshToken: string, profile: GoogleProfile, done: (error: any, user?: any) => void) => {
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
        picture: profile.picture,
        tuneStates: [],
        setStates: [],
        sessionStates: [],
      });

      await user.save(); // Save new user to the database
    }

    // Pass the user object to the next middleware
    return done(null, user);  // Ensure done is passed the correct parameters
  } catch (error) {
    console.log(error);
    return done(error, null);
  }
}));


// Serializing and Deserializing User
passport.serializeUser((user: Express.User, done: (err: any, id?: any) => void) => {
  done(null, user);
});

passport.deserializeUser(async (user: Express.User, done: (err: any, user?: any) => void) => {
  try {
    done(null, user); // Return the user object after fetching from the database
  } catch (err) {
    done(err, null); // Handle error
  }
});

/*  Starting and Killing Server  */
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Shutting down...');
  process.exit(0);
});

/* Endpoints and APIs */

// Google Login APIs
app.get('/auth/google',
  passport.authenticate('google', { scope:
    [ 'email', 'profile' ] }
));

app.get('/auth/google/callback',
  passport.authenticate( 'google', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

// Logout Route
app.get('/logout', (req, res) => {
  if (!req.user) {
    return res.status(400).send('You are already logged out');
  }

  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }

    // Manually destroy the session
    req.session.destroy(async (err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).send('Session destruction failed');
      }

      // Remove session from MongoDB
      await sessionStore.destroy(req.sessionID, (err) => {
        if (err) {
          console.error('Failed to remove session from MongoDB:', err);
        } else {
          console.log('Session removed from MongoDB');
        }
      });

      console.log('Session Destroyed!');
      res.redirect('/'); // Redirect to home after logout
    });
  });
});





// Handle other routes by serving the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './build', 'index.html'));
});