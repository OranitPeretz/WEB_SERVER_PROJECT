const axios = require("axios");
const favoriteModel = require("../models/favoriteModel");



// HELPERS
function renderVideosPage(req, res, {
    results = null,
    favorites = [],
    favoriteVideoIds = [],
    searchState = null,
    sortBy = "title",
    order = "ASC",
    flash = null,
    error = null
}) {
    res.render("videos", {
        results,
        favorites,
        favoriteVideoIds,
        searchState,
        sortBy,
        order,
        flash,
        error,
        user: req.session.user
    });
}



// SHOW MAIN PAGE
exports.showVideosPage = (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    const sortBy = req.query.sortBy || "title";
    const order  = req.query.order === "DESC" ? "DESC" : "ASC";

    const flash = req.session.flash || null;
    delete req.session.flash;

    favoriteModel.getFavoritesSorted(
        req.session.user.id,
        sortBy,
        order,
        (err, favorites) => {
            favoriteModel.getFavoriteVideoIds(
                req.session.user.id,
                (err2, favoriteVideoIds) => {
                    renderVideosPage(req, res, {
                        results: req.session.searchState?.results || null,
                        favorites,
                        favoriteVideoIds,
                        searchState: req.session.searchState,
                        sortBy,
                        order,
                        flash
                    });
                }
            );
        }
    );
};



// SEARCH VIDEOS
exports.searchVideos = async (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    try {
        delete req.session.flash;

        const query = req.body.query;

        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    key: process.env.YOUTUBE_API_KEY,
                    q: query,
                    part: "snippet",
                    maxResults: 5,
                    type: "video"
                }
            }
        );

        const results = response.data.items.map(v => ({
            videoId: v.id.videoId,
            title: v.snippet.title,
            thumbnail: v.snippet.thumbnails.default.url
        }));

        req.session.searchState = {
            query,
            results,
            nextPageToken: response.data.nextPageToken || null
        };

        favoriteModel.getFavoritesSorted(
            req.session.user.id,
            "title",
            "ASC",
            (err, favorites) => {
                favoriteModel.getFavoriteVideoIds(
                    req.session.user.id,
                    (err2, favoriteVideoIds) => {
                        renderVideosPage(req, res, {
                            results,
                            favorites,
                            favoriteVideoIds,
                            searchState: req.session.searchState,
                            sortBy: "title",
                            order: "ASC"
                        });
                    }
                );
            }
        );

    } catch (err) {
        console.error("Search failed:", err.message);
        renderVideosPage(req, res, {
            error: "❌ Failed to fetch videos from YouTube"
        });
    }
};



// LOAD MORE (PAGINATION)
exports.loadMoreVideos = async (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    try {
        delete req.session.flash;

        const state = req.session.searchState;
        if (!state || !state.nextPageToken) {
            return res.redirect("/videos");
        }

        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    key: process.env.YOUTUBE_API_KEY,
                    q: state.query,
                    part: "snippet",
                    maxResults: 5,
                    type: "video",
                    pageToken: state.nextPageToken
                }
            }
        );

        const newResults = response.data.items.map(v => ({
            videoId: v.id.videoId,
            title: v.snippet.title,
            thumbnail: v.snippet.thumbnails.default.url
        }));

        state.results.push(...newResults);
        state.nextPageToken = response.data.nextPageToken || null;

        favoriteModel.getFavoritesSorted(
            req.session.user.id,
            "title",
            "ASC",
            (err, favorites) => {
                favoriteModel.getFavoriteVideoIds(
                    req.session.user.id,
                    (err2, favoriteVideoIds) => {
                        renderVideosPage(req, res, {
                            results: state.results,
                            favorites,
                            favoriteVideoIds,
                            searchState: state,
                            sortBy: "title",
                            order: "ASC"
                        });
                    }
                );
            }
        );

    } catch (err) {
        console.error("Load more failed:", err.message);
        res.redirect("/videos");
    }
};



// ADD FAVORITE
exports.addFavorite = (req, res) => {
    favoriteModel.addFavorite(
        req.session.user.id,
        req.body,
        err => {
            if (err && err.code === "SQLITE_CONSTRAINT") {
                req.session.flash = "⚠️ Video already in favorites";
            } else if (err) {
                req.session.flash = "❌ Failed to add favorite";
            } else {
                req.session.flash = "⭐ Added to favorites!";
            }

            res.redirect("/videos");
        }
    );
};



// DELETE FAVORITE
exports.deleteFavorite = (req, res) => {
    favoriteModel.deleteFavorite(
        req.params.id,
        req.session.user.id,
        () => {
            req.session.flash = "🗑️ Removed from favorites";
            res.redirect("/videos");
        }
    );
};



// RATE FAVORITE
exports.rateFavorite = (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;

    favoriteModel.updateRating(id, rating, () => {
        res.redirect("/videos?sortBy=rating&order=DESC");
    });
};
