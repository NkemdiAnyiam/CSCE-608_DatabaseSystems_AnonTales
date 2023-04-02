const randomWords = require('random-words');

function randomDate(start) {
  const date = new Date(start.getTime() + Math.random() * (Date.now() - start.getTime())); // generate random date between start and now (in milliseconds)
  return new Intl.DateTimeFormat('en-CA').format(date); // format date value to acceptable SQL format
}

function currentDate() {
  return new Intl.DateTimeFormat('en-CA').format(Date.now());
}

function randomInt(minimum, maximum) {
  return Math.floor(Math.random() * ((maximum + 1) - minimum) + minimum);
}

function randomEntry(maxSentences) {
  return [... new Array(randomInt(1, maxSentences))]
      .map(_ => randomWords({min: 8, max: 17, join: ' '}))
      .join('. ');
}

function getRandomArrayValue(array) {
  if (array.length === 0) { throw new Error('ERROR: Cannot use empty array in randomIndex()'); }
  const randomIndex = randomInt(0, array.length - 1);
  return array[randomIndex];
}

function getRandomTruth(percentRate) {
  return Math.random() <= percentRate;
}

function toPlaceholderTuple(item) {
  const str = Object.values(item)
      .map(value => '?')
      .join(', ');
  return `(${str})`;
}

function toArray(obj) { return obj instanceof Array ? obj : [obj]; }

function toPropertiesStr(instance) { return Object.getOwnPropertyNames(instance).join(', '); }

function minifySqlQuery(query) {
  return query
    // .replace(/\n\s+/g, ' ')
    // .replace(/\(\s+/g, '(')
    // .replace(/\s+\)/, ')')
    // .replace(/\s*,\s*/g, ',')
    .trim();
}

function nullDefault(columnName, defaultValue) {
  return `IFNULL(${columnName}, ${defaultValue}) ${columnName}`;
}

function sqlInsertStatement(schemaClass, insertee) {
  const relationName = typeof schemaClass === 'string' ? schemaClass : schemaClass.schemaName;
  const array = toArray(insertee);
  if (typeof schemaClass !== 'string' && !(array[0] instanceof schemaClass)) { throw new Error('ERROR: insertee type does not match schema class'); }
  const columnNames = toPropertiesStr(array[0]);
  return [
    minifySqlQuery(`INSERT INTO ${relationName}(${columnNames}) VALUES ${array.map(item => toPlaceholderTuple(item)).join(', ')};`),
    array.map(item => Object.values(item)).flat()
  ];
}

function sqlUpdateStatement(schemaClass, assignment, condition) {
  const relationName = typeof schemaClass === 'string' ? schemaClass : schemaClass.schemaName;
  return minifySqlQuery(`UPDATE ${relationName} SET ${assignment} WHERE ${condition};`);
}

function sqlDeleteStatement(schemaClass, condition) {
  const relationName = typeof schemaClass === 'string' ? schemaClass : schemaClass.schemaName;
  return minifySqlQuery(`DELETE FROM ${relationName} WHERE ${condition};`);
}

function sqlInsert(pool, schemaClass, insertee, chunkSize = 1) {
  const schemaName = typeof schemaClass === 'string' ? schemaClass : schemaClass.schemaName;
  const array = toArray(insertee);
  return new Promise(async resolveOuter => {
      console.log(`-----------GENERATING ${schemaName}...`);
      for (let i = 0; i < array.length; i += chunkSize) {
          const subArray = array.slice(i, i + chunkSize);
          await new Promise(resolveInner => {
              pool.getConnection((err, conn) => {
                  if (err) { throw err; }
                  conn.query(...sqlInsertStatement(schemaClass, subArray), (err, result) => {
                      conn.release();
                      if (err) { throw err; }
                      // console.log(result);
                      resolveInner();
                  });
              });
          });
      }
      console.log(`FINISHED ${schemaName}`);
      resolveOuter();
  });
}

module.exports = {
  randomDate,
  currentDate,
  randomInt,
  randomEntry,
  getRandomArrayValue,
  getRandomTruth,
  toPlaceholderTuple,
  toPropertiesStr,
  minifySqlQuery,
  nullDefault,
  sqlInsertStatement,
  sqlUpdateStatement,
  sqlDeleteStatement,
  sqlInsert
};
