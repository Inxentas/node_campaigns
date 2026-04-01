const Database = require("better-sqlite3");
const db = new Database("myDatabase.db");
const create_table_battlemechs = db.exec(`
    CREATE TABLE IF NOT EXISTS battlemechs (
        id INTEGER,
        mul TEXT,
        name TEXT,
        class TEXT,
        sarna TEXT,
        variant TEXT,
        pv TEXT,
        size TEXT,
        armor INTEGER,
        structure INTEGER,
        damageS INTEGER,
        damageSMin REAL,
        damageM INTEGER,
        damageMMin REAL,
        damageL INTEGER,
        damageLMin REAL,
        damageE INTEGER,
        damageEMin REAL,    
        overheat INTEGER,
        tonnage INTEGER,
        intro INTEGER
    )`
);

const create_table_types = db.exec(`
  CREATE TABLE IF NOT EXISTS unit_types (
        id INTEGER,
        name TEXT
    )`
);

/** We should use DISTINCT to make filters for the dropdowns! */
let distinctTechnology = `SELECT DISTINCT technology FROM units;`;
let distinctRole = `SELECT DISTINCT role FROM units;`;

module.exports = {
  db,
  create_table_battlemechs,
  create_table_types,
};