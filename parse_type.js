/**
 * The intent is to map unit TYPES once we have our DB set up for more AS elements.
 */

const fs = require("fs");
const { parse } = require("csv-parse");
const units = [];

const Database = require("better-sqlite3");
const db = new Database("myDatabase.db"); // creates or opens a file

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
    trimmedRow.mul = convertExcelFormula(trimmedRow.name?.trim(),1);
    trimmedRow.name = convertExcelFormula(trimmedRow.name?.trim(),2);
    trimmedRow.sarna = convertExcelFormula(trimmedRow.class?.trim(),1);
    trimmedRow.class = convertExcelFormula(trimmedRow.class?.trim(),2);

    trimmedRow.variant = trimmedRow.variant?.trim();
    trimmedRow.pv = parseFloat(trimmedRow.pv?.trim());
    trimmedRow.size = parseFloat(trimmedRow.size?.trim());
    trimmedRow.armor = parseFloat(trimmedRow.armor?.trim());
    trimmedRow.structure = parseFloat(trimmedRow.structure?.trim());

    trimmedRow.damageS = parseFloat(trimmedRow.damageS?.trim());
    trimmedRow.damageSMin = trimmedRow.damageSMin?.trim();
    trimmedRow.damageM = parseFloat(trimmedRow.damageM?.trim());
    trimmedRow.damageMMin = trimmedRow.damageMMin?.trim();
    trimmedRow.damageL = parseFloat(trimmedRow.damageL?.trim());
    trimmedRow.damageLMin = trimmedRow.damageLMin?.trim();
    trimmedRow.damageE = parseFloat(trimmedRow.damageE?.trim());
    trimmedRow.damageEMin = trimmedRow.damageEMin?.trim();

    trimmedRow.overheat = parseFloat(trimmedRow.overheat?.trim());
    trimmedRow.tonnage = parseFloat(trimmedRow.tonnage?.trim());
    trimmedRow.intro = parseFloat(trimmedRow.intro?.trim());

    trimmedRow.insertQuery = db.prepare(`
        INSERT INTO battlemechs 
        (id, mul, name, class, sarna, variant, pv, size, armor, structure, damageS, damageSMin, damageM, damageMMin, damageL, damageLMin, damageE, damageEMin, overheat, tonnage, intro) 
        VALUES 
        (@id, @mul, @name, @class, @sarna, @variant, @pv, @size, @armor, @structure, @damageS, @damageSMin, @damageM, @damageMMin, @damageL, @damageLMin, @damageE, @damageEMin, @overheat, @tonnage, @intro)`);
    trimmedRow.insertQuery.run({
        id: trimmedRow.Id, /* note the change */
        mul: trimmedRow.mul,
        name: trimmedRow.name,
        class: trimmedRow.class,
        sarna: trimmedRow.sarna,
        variant: trimmedRow.variant,
        pv: trimmedRow.pv,
        size: trimmedRow.size,
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
        tonnage: trimmedRow.tonnage,
        intro: trimmedRow.intro
    });

    // push into collection
    units.push(trimmedRow);
})
.on("end", () => {
    console.log(units[0]);
    console.log(units.length + " rows converted");
});