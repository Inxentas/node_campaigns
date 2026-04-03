
const { db, convertExcelFormula, recreateTable, insertData } = require("./database");

async function main() {
    const tablename = "units";
    recreateTable(tablename);
    const files = [
        "csv/bm.csv", 
        "csv/ba.csv", 
        "csv/cv.csv", 
        "csv/pm.csv"
    ];
    for (const filename of files) {
        const units = await insertData(tablename, filename);
        console.log(`Inserted ${units.length} rows from '${filename}'`);
    }
    console.log("All CSV files processed in order!");
}

main().catch(console.error);