const express = require("express");
const router = express.Router();

const controller = require("../controllers/videoController");
const { requireLogin } = require("../middlewares/authMiddleware");

router.get("/", requireLogin, controller.showVideosPage);

router.post("/search", requireLogin, controller.searchVideos);

router.post("/load-more", requireLogin, controller.loadMoreVideos);

router.post("/add", requireLogin, controller.addFavorite);

router.post("/delete/:id", requireLogin, controller.deleteFavorite);

router.post("/rate/:id", requireLogin, controller.rateFavorite);

module.exports = router;
