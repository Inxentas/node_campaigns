/**
 * NOTE: we deliberately did NOT add the .env file to git ignore, because
 * it just stores local DB data and this project is an example. You'd normally
 * add a little security here, but we just use sqllite3 to store our data.
 */

require("dotenv").config();
const path = require("path");
const Database = require("better-sqlite3");         /* Our local data storage. Based on CSV files. */
const express = require("express");                 /* We'll use an industry standard for the UI. */
const { searchFilterQuery } = require("./search");  /* I'm using vanilla SQL, just to show I can. */

// express setup
const PORT = process.env.PORT || 3025;              /* If you play BattleTech you'd get the joke. */
const app = express();                              /* Initialize express. Has to happen somewhere. */
app.use(express.json());                            /* JSON parsing middleware to populate our UI. */
app.use(express.static("public"));                  /* Serve static files from /public folder. */
app.set('view engine', 'ejs');                      /* */

const db = new Database(process.env.DB_PATH);       /* Connect to SQLite DB */

// enable Google OAuth session
const session = require('express-session');
app.use(session({
  secret: 'your-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false // required for localhost
  }
}));

// enable passport
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

const GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  // This is where you handle the user
  // e.g. find or create user in DB
  console.log("A user is authenticating...");
  console.log(profile.id);
  console.log(profile.displayName);
  console.log(profile.emails[0].value);
  console.log(profile.photos[0].value);
  let google_id = profile.id;
  let name = profile.displayName;
  let email = profile.emails[0].value;
  let picture = profile.photos[0].value;
  // check if this user already exists
  const stmt = db.prepare(`SELECT google_id FROM users WHERE google_id = ?`);
  const row = stmt.get(google_id);
  const exists = !!row;
  console.log("User already exists: " + exists);
  // if not, we log the user in the database
  if(!exists){
    const prep = db.prepare(`
      INSERT INTO users (google_id, name, email, picture)
      VALUES (?, ?, ?, ?)
    `);
    const result = prep.run(google_id, name, email, picture);
    //console.log(result.lastInsertRowid);
    // maybe clean up?
    /* UPDATE sqlite_sequence 
        SET seq = (SELECT MAX(id) FROM users)
        WHERE name = 'users'; 
        */
  } else {
    //
  }
  return done(null, profile);

  /*
  // TODO: figure out this mapping. For now we're happy with using the database user.
  return done(null, {
    id: google_id,
    name: name,
    email: email,
    picture: picture,
    googleProfile: profile
  });*/

}));
/* Serialization */
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

/**
 * For routing I picked express as it's an apparent industry standard. It handles a few things:
 *  1.  Routes for the web application. Simple stuff.
 *  2.  Google OAauth routes. The fullscreen one.
 *  3.  Distinct filter routes for searching.
 */

// a simple default, should everything else fail
app.get("/", (req, res) => {
  res.send("BattleMech search server is running!");
});

// main html endpoint
app.post("/api/search", (req, res) => {
  try {
    // create filters
    const filters = req.body;
    const { sql, params } = searchFilterQuery(filters);
    // execute query
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Redirect to Google OAath
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAath callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

// Setup the searcg page
app.get('/search', (req, res) => {
    res.status(200);
    //res.sendFile(path.join(__dirname, 'public', 'profile.html'));
    res.render('search', { title: 'Unit Search', h1:'Unit Search' });
  }
);
// Setup the user's profile page
app.get('/profile', (req, res) => {
    res.status(200);
    //res.sendFile(path.join(__dirname, 'public', 'profile.html'));
    res.render('profile', { title: 'Profile', h1:'Profile' });
  }
);
// Add a route to grab the users database row
app.get("/api/profile", (req, res) => {
  if (req.isAuthenticated()) {
    // we get the user from our database, so we have all data
    const email = req.user.emails[0].value; // extract safely
    const row = db.prepare("SELECT name, email, picture FROM users WHERE email = ?").get(email);
    return res.json({
      loggedIn: true,
      user: {
        name: req.user.displayName,
        email: req.user.emails[0].value,
        picture: req.user.photos[0].value
      },
      row:row
    });
  }
  res.json({ loggedIn: false });
});
// setup the users page
app.get("/users", (req,res) => {
  res.status(200);
  res.sendFile(path.join(__dirname, 'public', 'users.html'));
});
// setup the users json
app.get("/api/users", (req,res) => {
  const rows = db.prepare(`SELECT * FROM users`).all();
  res.status(200);
  return res.json({
      users: rows
    });
});

// Setup a few simple JSON routes to return each distinct search filter.
const distinct_filter_routes = ['role','technology','type'];
distinct_filter_routes.forEach(element => {
  app.get("/api/distinct/" + element, (req, res) => {
    try {
      const rows = db.prepare(`SELECT DISTINCT ${element} FROM units`).all();
      const map = rows.map(r => r[element]);
      res.json(map);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// console message
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});