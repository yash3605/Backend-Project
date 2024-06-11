import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    // TODO: toggle like for a video
})

const toogleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    // TODO: toggle like for a comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    // TODO: toggle like for a tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
    // TODO: get all liked videos
})

export { toggleVideoLike, toogleCommentLike, toggleTweetLike, getLikedVideos };