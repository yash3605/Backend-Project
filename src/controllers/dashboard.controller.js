import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import e from "express";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: get channel stats
    const channelStats = await UserActivation.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "allVideos",
                piprline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes"
                        }
                    },
                    {
                        $addFields: {
                            likesCount: { $size: "$likes" }
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                totalSubscribers: { $size: "$subscribers" },
                totalVideos: { $size: "$allVideos" },
                totalLikes: { $sum: "$allVideos.likesCount" },
                totalViews: { $sum: "$allVideos.views" }
            }
        },
        {
            $project: {
                totalVideos: 1,
                totalSubscribers: 1,
                totalLikes: 1,
                totalViews: 1,
                username: 1,
                fullname: 1,
                avatar:1,
                coverImage: 1
            }
        }
    ]);

    if(channelStats.length < 1){
        throw new ApiError(404, "Channel not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channelStats[0], "Channel stats retrieved successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    //  TODO: get all videos for a channel

    const videos = await Video.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(req.user?._id,)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        {
            $project: {
                title: 1,
                description: 1,
                views: 1,
                likesCount: 1,
                thumbnail: 1,
                createdAt: 1
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos retrieved successfully"));
});

export { getChannelStats, getChannelVideos };