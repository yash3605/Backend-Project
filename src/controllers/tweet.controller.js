import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/playlist.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    // TODO: create a new tweet
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get all tweets for a user
});

const updateTweet = asyncHandler(async (req, res) => {
    // TODO: update a tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
    // TODO: delete a tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
    