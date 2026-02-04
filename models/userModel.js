const db = require("../database/db");

exports.createUser = (username, hashedPassword, callback) => {
    db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        callback
    );
};

exports.findUserByUsername = (username, callback) => {
    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        callback
    );
};
