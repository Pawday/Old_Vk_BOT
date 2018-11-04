//modules
const db = require('sqlite-sync');
const fs = require('fs');


db.connect('databases/vk.db');

try {db.run(fs.readFileSync('tables_SQL/users.sql','utf8'))} catch (error) {}
db.close();
