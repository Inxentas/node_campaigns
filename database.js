/** 
 * A reusable module that provides our database connection. 
 * ``
 * const { db } = require("./database");`
 * ``
 * */
require('dotenv').config();
const fs = require("fs");
const { parse } = require("csv-parse");
const Database = require("better-sqlite3");
const db = new Database(process.env.DB_PATH);

/**
 * Converts an ExcellFormula from the Terminus data into:
 * match[1] = URL, match[2] = friendly name
 * @param {*} raw 
 * @param {*} index 
 * @returns 
 */
function convertExcelFormula(raw, index)
{
  const match = raw.match(/HYPERLINK\("([^"]+)",\s*"([^"]+)"\)/i);
  return match ? match[index] : null;
}
function recreateTable(tablename)
{
    console.log(`Dropping '${tablename}' table`);
    db.exec(`DROP TABLE IF EXISTS ${tablename}`);
    // create a new table table
    db.exec(`
    CREATE TABLE IF NOT EXISTS ${tablename} (
        id INTEGER PRIMARY KEY,
        mul TEXT,
        name TEXT,
        class TEXT,
        sarna TEXT,
        variant TEXT,
        type TEXT,
        subtype TEXT,
        pv INTEGER,
        size INTEGER,
        move TEXT,
        armor INTEGER,
        structure INTEGER,
        damageS INTEGER,
        damageSMin INTEGER NOT NULL DEFAULT 0,
        damageM INTEGER,
        damageMMin INTEGER NOT NULL DEFAULT 0,
        damageL INTEGER,
        damageLMin INTEGER NOT NULL DEFAULT 0,
        damageE INTEGER,
        damageEMin REAL,    
        overheat INTEGER,
        abilities TEXT,
        imagelink TEXT,
        ruleslevel TEXT,
        role TEXT,
        technology TEXT,
        tonnage INTEGER,
        intro INTEGER
    )
    `);
    console.log(`Created new '${tablename}' TABLE`);
    console.log('\n');
}
function insertData(tablename, csvfile)
{
    return new Promise((resolve, reject) => {
        let units = [];
        fs.createReadStream(csvfile)
        .pipe(parse({
            columns: true, 
            relax_quotes: true,
            mapHeaders: ({ header }) => header.trim()}))
        .on("data", (row) => {
            // manual trimming of all the keys
            const trimmedRow = {};
            for (let key in row) {
                trimmedRow[key.trim()] = row[key];
            }
            // convert values
            trimmedRow.Id = parseFloat(trimmedRow.Id);
            trimmedRow.mul = convertExcelFormula(trimmedRow.name?.trim(),1);
            trimmedRow.name = convertExcelFormula(trimmedRow.name?.trim(),2);
            trimmedRow.sarna = convertExcelFormula(trimmedRow.class?.trim(),1);
            trimmedRow.class = convertExcelFormula(trimmedRow.class?.trim(),2);
            trimmedRow.variant = trimmedRow.variant?.trim();
            trimmedRow.type = trimmedRow.type?.trim();
            trimmedRow.subtype = trimmedRow.subtype?.trim();
            trimmedRow.pv = parseFloat(trimmedRow.pv?.trim());
            trimmedRow.size = parseFloat(trimmedRow.size?.trim());
            trimmedRow.move = trimmedRow.move?.trim();
            trimmedRow.armor = parseFloat(trimmedRow.armor?.trim());
            trimmedRow.structure = parseFloat(trimmedRow.structure?.trim());
            trimmedRow.damageS = parseFloat(trimmedRow.damageS?.trim());
            trimmedRow.damageSMin = trimmedRow.damageSMin?.trim().toLowerCase() === 'true' ? 1 : 0;
            trimmedRow.damageM = parseFloat(trimmedRow.damageM?.trim());
            trimmedRow.damageMMin = trimmedRow.damageMMin?.trim().toLowerCase() === 'true' ? 1 : 0;
            trimmedRow.damageL = parseFloat(trimmedRow.damageL?.trim());
            trimmedRow.damageLMin = trimmedRow.damageLMin?.trim().toLowerCase() === 'true' ? 1 : 0;
            trimmedRow.damageE = parseFloat(trimmedRow.damageE?.trim());
            trimmedRow.damageEMin = trimmedRow.damageEMin?.trim().toLowerCase() === 'true' ? 1 : 0;
            trimmedRow.overheat = parseFloat(trimmedRow.overheat?.trim());
            trimmedRow.abilities = trimmedRow.abilities?.trim();
            trimmedRow.imagelink = trimmedRow.imagelink?.trim();
            trimmedRow.rulesLevel = trimmedRow.rulesLevel?.trim();
            trimmedRow.role = trimmedRow.role?.trim();
            trimmedRow.technology = trimmedRow.technology?.trim();
            trimmedRow.tonnage = parseFloat(trimmedRow.tonnage?.trim());
            trimmedRow.intro = parseFloat(trimmedRow.intro?.trim());

            // prepare and run the queries
            trimmedRow.insertQuery = db.prepare(
                `INSERT INTO ${tablename} 
                (
                    id, 
                    mul, 
                    name, 
                    class, 
                    sarna, 
                    variant, 
                    type, 
                    subtype, 
                    pv, 
                    size, 
                    move, 
                    armor, 
                    structure, 
                    damageS, 
                    damageSMin, 
                    damageM, 
                    damageMMin, 
                    damageL, 
                    damageLMin, 
                    damageE, 
                    damageEMin, 
                    overheat, 
                    abilities, 
                    imagelink, 
                    ruleslevel, 
                    role, 
                    technology, 
                    tonnage, 
                    intro
                ) 
                VALUES 
                (
                    @id, 
                    @mul, 
                    @name, 
                    @class, 
                    @sarna, 
                    @variant, 
                    @type, 
                    @subtype, 
                    @pv, 
                    @size, 
                    @move, 
                    @armor, 
                    @structure, 
                    @damageS, 
                    @damageSMin, 
                    @damageM, 
                    @damageMMin, 
                    @damageL, 
                    @damageLMin, 
                    @damageE, 
                    @damageEMin, 
                    @overheat, 
                    @abilities, 
                    @imagelink,
                    @ruleslevel, 
                    @role,
                    @technology,
                    @tonnage, 
                    @intro
                )
            `);
            trimmedRow.insertQuery.run({
                id: trimmedRow.Id, /* note the change to lowercase */
                mul: trimmedRow.mul,
                name: trimmedRow.name,
                class: trimmedRow.class,
                sarna: trimmedRow.sarna,
                variant: trimmedRow.variant,
                type: trimmedRow.type,
                subtype: trimmedRow.subtype,
                pv: trimmedRow.pv,
                size: trimmedRow.size,
                move: trimmedRow.move,
                armor: trimmedRow.armor,
                structure: trimmedRow.structure,
                damageS: trimmedRow.damageS,
                damageSMin: trimmedRow.damageSMin,
                damageM: trimmedRow.damageM,
                damageMMin: trimmedRow.damageMMin,
                damageL: trimmedRow.damageL,
                damageLMin: trimmedRow.damageLMin,
                damageE: trimmedRow.damageE,
                damageEMin: trimmedRow.damageEMin,
                overheat: trimmedRow.overheat,
                abilities: trimmedRow.abilities,
                imagelink: trimmedRow.imagelink, 
                ruleslevel: trimmedRow.rulesLevel, /* note the change to lowercase */
                role: trimmedRow.role, 
                tonnage: trimmedRow.tonnage, 
                technology: trimmedRow.technology, 
                intro: trimmedRow.intro
            });
            // add to collection
            units.push(trimmedRow);
            // log our progress
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(`${units.length} units converted from file '${csvfile}' into table '${tablename}'.`);
        })
        .on("end", () => {
            console.log(" Completed.");
            resolve(units);
        });
    });
}

module.exports = { db, convertExcelFormula, recreateTable, insertData };