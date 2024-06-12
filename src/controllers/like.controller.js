import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    // TODO: toggle like for a video

    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const isLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (isLike) {
        await Like.findByIdAndDelete(isLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Like removed successfully"));
    }

    const like = Like.create({
        video: videoId,
        likedBy: userId,
    
    });

    res
        .status(201)
        .json(new ApiResponse(201, like, "Video liked successfully"));
})

const toogleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    // TODO: toggle like for a comment

    const userId = req.user._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const isLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (isLike) {
        await Like.findByIdAndDelete(isLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Like removed successfully"));
    }

    const like = Like.create({
        comment: commentId,
        likedBy: userId,
    
    });

    res
        .status(201)
        .json(new ApiResponse(201, like, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    // TODO: toggle like for a tweet

    const userId = req.user._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const isLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (isLike) {
        await Like.findByIdAndDelete(isLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Like removed successfully"));
    }

    const like = Like.create({
        tweet: tweetId,
        likedBy: userId,
    
    });

    res
        .status(201)
        .json(new ApiResponse(201, like, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    // TODO: get all liked videos

    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: userId,
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "allVideos"
            }
        },
        {
            $unwind: "$allVideos"
        },
        {
            $project: {
                id: "$allVideos._id",
                title: "$allVideos.title",
                description: "$allVideos.description",
                owner: "$allVideos.owner",
                createdAt: "$allVideos.createdAt",
            }
        }
    ]);

    res 
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
})

export { toggleVideoLike, toogleCommentLike, toggleTweetLike, getLikedVideos };