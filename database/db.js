const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/app.db", err => {
    if (err) {
        console.error("❌ Failed to connect to DB:", err.message);
    } else {
        console.log("✔ Connected to SQLite database");
    }
});



db.run("PRAGMA foreign_keys = ON");

db.serialize(() => {

    // ================= USERS =================
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);

    // ================= FAVORITES =================
    db.run(`
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            video_id TEXT NOT NULL,
            title TEXT NOT NULL,
            thumbnail TEXT NOT NULL,
            rating INTEGER DEFAULT 0,

            UNIQUE(user_id, video_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    
    db.all(`PRAGMA table_info(favorites)`, (err, columns) => {
        if (err) {
            console.error("❌ Failed to read favorites schema:", err.message);
            return;
        }

        const columnNames = columns.map(c => c.name);

        if (!columnNames.includes("rating")) {
            db.run(
                `ALTER TABLE favorites ADD COLUMN rating INTEGER DEFAULT 0`,
                err => {
                    if (err) {
                        console.error("❌ Failed to add rating column:", err.message);
                    } else {
                        console.log("✔ rating column added to favorites");
                    }
                }
            );
        }
    });
});

module.exports = db;
