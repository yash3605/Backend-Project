import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/playlist.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    // TODO: create a new tweet
    const {content} = req.body;

    const user = await User.findById(req.user._id);

    if(!user){
        throw new ApiError(404, "User not found");
    }

    if([content].some((field) => field.trim() === undefined || field.trim() === "")){
        throw new ApiError(400, "Tweet content is required")
    }

    if(!content){
        throw new ApiError(400, "Tweet content is required");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    });

    return res
    .status(201)
    .json(new ApiResponse(201, {tweet}, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get all tweets for a user
    const { userId } = req.params;

    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(404, "User not found");
    }

    const userTweet = await Tweet.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId)
            }
        }
    ])

    if(!userTweet?.length){
        throw new ApiError(404, "No tweet found for this user");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {tweets: userTweet}, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    // TODO: update a tweet
    const { tweetId } = req.params;
    const { content } = req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set: {
                content: content
            }
        },{ new: true }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, {tweet}, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    // TODO: delete a tweet
    const { tweetId } = req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    return res
    .status(200)
    .json(new ApiResponse(200, {tweet}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
    