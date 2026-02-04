const express = require("express");
const session = require("express-session");
require('dotenv').config();
const SQLiteStore = require('connect-sqlite3')(session);
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/videoRoutes");

const app = express();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: './database' }),
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/", authRoutes);
app.use("/videos", videoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
