/**
 * NOTE: we deliberately did NOT add the .env file to git ignore, because
 * it just stores local DB data and this project is an example. You'd normally
 * add a little security here, but we just use sqllite3 to store our data.
 */

require("dotenv").config();
const Database = require("better-sqlite3");         /* Our local data storage. Based on CSV files. */
const express = require("express");                 /* We'll use an industry standard for the UI. */
const { searchFilterQuery } = require("./search");  /* I'm using vanilla SQL, just to show I can. */

// express setup
const PORT = process.env.PORT || 3025;              /* If you actually play BattleTech you get the joke. */
const app = express();                              /* Initialize express. Has to happen somewhere. */
app.use(express.json());                            /* JSON parsing middleware to populate our UI. */
app.use(express.static("public"));                  /* Serve static files from /public folder. */

const db = new Database(process.env.DB_PATH);       /* Connect to SQLite DB */

// We'll let express handle our routing. We'll just add a default.
app.get("/", (req, res) => {
  res.send("BattleMech search server is running!");
});

// search endpoint
app.post("/search", (req, res) => {
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

// console message
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});