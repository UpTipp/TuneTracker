"use strict";
/*
  server.ts

  Backend of the website!
*/
Object.defineProperty(exports, "__esModule", { value: true });
/*  Important Modules!  */
var dotenv_1 = require("dotenv");
var express_1 = require("express");
var cors_1 = require("cors");
var path_1 = require("path");
var mongoose_1 = require("mongoose");
var connect_mongo_1 = require("connect-mongo");
var express_session_1 = require("express-session");
var passport_1 = require("passport");
var passport_google_oauth2_1 = require("passport-google-oauth2");
dotenv_1.default.config(); // Initialize dotenv
/*  Database Setup!  */
var mongoDB = process.env.MONGO_URI;
mongoose_1.default.connect(mongoDB)
    .then(function () { return console.log("MongoDB connected successfully"); })
    .catch(function (err) { return console.error("MongoDB connection error:", err); });
/* Setting Server Up */
// Initialize Express app
var app = (0, express_1.default)();
var port = process.env.PORT;
var secret = process.env.SESSION_SECRET;
app.use((0, express_session_1.default)({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day expiration for session cookies
        secure: process.env.NODE_ENV === 'production', // Set to true in production (https only)
        httpOnly: true
    },
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    })
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Use CORS middleware
app.use((0, cors_1.default)());
// Serve static files from the 'build' directory
app.use('/', express_1.default.static(path_1.default.join(__dirname, './build')));
// Google Passport Continued
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var authUser = function (request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
};
//Use "GoogleStrategy" as the Authentication Strategy
passport_1.default.use(new passport_google_oauth2_1.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:".concat(port, "/auth/google/callback"),
    passReqToCallback: true
}, authUser));
// Serializing and Deserializing User
passport_1.default.serializeUser(function (user, done) {
    done(null, user);
});
passport_1.default.deserializeUser(function (user, done) {
    done(null, user);
});
/*  Starting and Killing Server  */
app.listen(port, function () {
    console.log("Server is running at http://localhost:".concat(port));
});
process.on('SIGINT', function () {
    console.log('\nReceived SIGINT. Shutting down...');
    process.exit(0);
});
/* Endpoints and APIs */
// Google Login APIs
app.get('/auth/google', passport_1.default.authenticate('google', { scope: ['email', 'profile'] }));
app.get('/auth/google/callback', passport_1.default.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/login'
}));
