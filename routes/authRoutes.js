const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

router.get("/", auth.showLogin);
router.get("/register", auth.showRegister);
router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/logout", auth.logout);
router.get("/home", auth.home);

module.exports = router;
