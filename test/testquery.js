/**
 * A quick and dirty checkup if the search filters work correctly.
 */

const Database = require("better-sqlite3");
const { searchFilterConfig } = require('../search');
const { searchFilterQuery } = require('../search');

const db = new Database("myDatabase.db");

function runTest(name, filters) {
  console.log(`\n=== ${name} ===`);

  
  const { sql, params } = searchFilterQuery(filters);

  console.log("SQL:");
  console.log(sql);

  console.log("Params:");
  console.log(params);

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);

  console.log("Result:");
  console.log(rows.length + " results");
}

// Tests

runTest("Size range 2,4", {
  minSize:Number(2),
  maxSize:Number(4)
});

runTest("Armor Range 3-5", {
  minArmor:Number(3),
  maxArmor:Number(5)
});

runTest("Search + filter", {
  class: "Atlas",
  nameSearch: "Atlas"
});

runTest("Invalid keys (should ignore)", {
  foo: "bar",
  minArmor: 100
});

runTest("Empty input", {});