const db = require("../database/db");



exports.addFavorite = (userId, video, cb) => {
    db.run(
        `INSERT OR IGNORE INTO favorites (user_id, video_id, title, thumbnail)
         VALUES (?, ?, ?, ?)`,
        [userId, video.videoId, video.title, video.thumbnail],
        function (err) {
            if (err) {
                return cb && cb(err);
            }

            
            if (this.changes === 0) {
                return cb && cb({ code: "DUPLICATE" });
            }

            cb && cb(null);
        }
    );
};




exports.isFavorite = (userId, videoId, cb) => {
    db.get(
        `
        SELECT id
        FROM favorites
        WHERE user_id = ? AND video_id = ?
        `,
        [userId, videoId],
        (err, row) => {
            if (err) return cb(err);
            cb(null, !!row);
        }
    );
};


exports.getFavoriteVideoIds = (userId, cb) => {
    db.all(
        `
        SELECT video_id
        FROM favorites
        WHERE user_id = ?
        `,
        [userId],
        (err, rows) => {
            if (err) return cb(err);
            cb(null, rows.map(r => r.video_id));
        }
    );
};



exports.getFavoritesByUser = (userId, cb) => {
    db.all(
        `
        SELECT *
        FROM favorites
        WHERE user_id = ?
        `,
        [userId],
        cb
    );
};



exports.getFavoritesSorted = (userId, sortBy, order, cb) => {
    const allowedColumns = ["title", "rating"];
    const sortColumn = allowedColumns.includes(sortBy) ? sortBy : "title";
    const sortOrder = order === "DESC" ? "DESC" : "ASC";

    db.all(
        `
        SELECT *
        FROM favorites
        WHERE user_id = ?
        ORDER BY ${sortColumn} ${sortOrder}
        `,
        [userId],
        cb
    );
};



exports.deleteFavorite = (favId, userId, cb) => {
    db.run(
        `
        DELETE FROM favorites
        WHERE id = ? AND user_id = ?
        `,
        [favId, userId],
        function (err) {
            if (cb) cb(err);
        }
    );
};



exports.updateRating = (id, rating, cb) => {
    const safeRating = Math.min(5, Math.max(1, rating));

    db.run(
        `
        UPDATE favorites
        SET rating = ?
        WHERE id = ?
        `,
        [safeRating, id],
        function (err) {
            if (cb) cb(err);
        }
    );
};
