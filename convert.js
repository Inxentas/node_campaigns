const fs = require("fs");
const { parse } = require("csv-parse");
const units = [];

fs.createReadStream("csv/battlemechs.csv")
.pipe(parse({
    columns: true, 
    relax_quotes: true,
    mapHeaders: ({ header }) => header.trim()}))
.on("data", (row) => {
    // we do some manual trimming, just in case
    const trimmedRow = {};
    for (let key in row) {
        trimmedRow[key.trim()] = row[key];
    }
    // convert values
    trimmedRow.Id = parseFloat(trimmedRow.Id);
    trimmedRow.variant = trimmedRow.variant?.trim();
    trimmedRow.pv = parseFloat(trimmedRow.pv);
    trimmedRow.size = parseFloat(trimmedRow.aize);
    trimmedRow.armor = parseFloat(trimmedRow.armor);
    trimmedRow.structure = parseFloat(trimmedRow.structure);
    trimmedRow.damageS = parseFloat(trimmedRow.damageS);
    trimmedRow.damageM = parseFloat(trimmedRow.damageM);
    trimmedRow.damageL = parseFloat(trimmedRow.damageL);
    trimmedRow.damageE = parseFloat(trimmedRow.damageE);
    trimmedRow.overheat = parseFloat(trimmedRow.overheat);
    trimmedRow.tonnage = parseFloat(trimmedRow.tonnage);
    trimmedRow.intro = parseFloat(trimmedRow.intro);
    // push into collection
    units.push(trimmedRow);
})
.on("end", () => {
    console.log(units[0]);
    //console.log(units.length + " rows converted");
    parseRows(units);
});


function parseRows(rows)
{
    for(let i=0; i < rows.length; i++)
    {
        parseRow(rows[i]);
    }
}
function parseRow(row)
{
    const query = objectToInsertQuery("myTable", row);
    console.log(query);
}

function objectToInsertQuery(table, obj) {
  const columns = Object.keys(obj).join(", ");
  const placeholders = Object.keys(obj).map((_, i) => `$${i+1}`).join(", ");
  const values = Object.values(obj);
  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  return { query, values };
}