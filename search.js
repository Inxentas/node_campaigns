/**
 * This module offers some search filter configs and queries for battlemechs specifically.
 * Before adding more dependencies I thought it would be good practice to do some vanilla SQL.
 */

const searchFilterConfig = {
  size: { column: "size", op: "=" },
  minSize: { column: "size", op: ">=" },
  maxSize: { column: "size", op: "<=" },
  variant: { column: "variant", op: "=" },
  minArmor: { column: "armor", op: ">=" },
  maxArmor: { column: "armor", op: "<=" },
  minStructure: { column: "structure", op: ">=" },
  maxStructure: { column: "structure", op: "<=" },
  minIntro: { column: "intro", op: ">=" },
  maxIntro: { column: "intro", op: "<=" },
  minPV: { column: "pv", op: ">=" },
  maxPV: { column: "pv", op: "<=" },
};

function searchFilterQuery(filters = {}) {
  const conditions = [];
  const params = [];
  // loop through each of the filters
  for (const [key, value] of Object.entries(filters)) {
    // Ignore null, undefined, empty string
    if (value === null || value === undefined || value === "") continue;
    if (searchFilterConfig[key]) {
      const { column, op } = searchFilterConfig[key];
      // prevent empty string searches
      if (searchFilterConfig[key]) {
        conditions.push(`${column} ${op} ?`);
        params.push(value);
      }
    }
  }

  // handle all text values outside of the loop
  if (filters.nameSearch) {
    conditions.push("name LIKE ?");
    params.push(`%${filters.nameSearch.trim()}%`);
  }
  if (filters.classSearch) {
    conditions.push("class = ?");
    params.push(filters.classSearch.trim());
  }

  let sql = "SELECT * FROM battlemechs";

  if (conditions.length) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  // sorting whitelist
  const allowedSort = ["name", "size", "pv", "armor", "overheat"];
  if (filters.sortBy && allowedSort.includes(filters.sortBy)) {
    const dir = filters.sortDir === "desc" ? "DESC" : "ASC";
    sql += ` ORDER BY ${filters.sortBy} ${dir}`;
  }

  console.log("SQL:", sql);
  console.log("Params:", params);

  return { sql, params };
}

module.exports = {
  searchFilterConfig,
  searchFilterQuery,
};