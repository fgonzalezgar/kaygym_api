const db = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function migrate() {
    try {
        const sqlPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await db.query(sql);
        console.log("Migración completada con éxito. Las tablas están listas.");
        process.exit(0);
    } catch (err) {
        console.error("Error aplicando la migración:", err);
        process.exit(1);
    }
}

migrate();
