import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/playlist.model.js";
import { Video } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    // TODO: get all videos

    page = isNaN(page) ? 1 : parseInt(page);
    limit = isNaN(limit) ? 10 : parseInt(limit);

    if(page < 1) {
        page = 1;
    }

    if(limit <= 0) {
        limit = 10;
    }

    const matchStage = {};

    if(userId && isValidObjectId(userId)) {
        matchStage["$match"] = {
            owner: mongoose.Types.ObjectId(userId)
        }
    } else if(query){
        matchStage["$match"] = {
             $or: [
                  {title: { $regex: query, $options: "i" }},
                  {description: { $regex: query, $options: "i" }}
                ]
            };
    } else {
        matchStage["$match"] = {};
    }

    if (userId && query){
        matchStage["$match"] = {
            $and: [
                {owner: mongoose.Types.ObjectId(userId)},
                { $or: [
                    {title: { $regex: query, $options: "i" }},
                    {description: { $regex: query, $options: "i" }}
                ]}
            ]
        }
    
    }

    const sortStage = {};

    if(sortBy && sortType){
        sortStage["$sort"] = {
            [sortBy]: sortType === "asc" ? 1 : -1
        };
    } else {
        sortStage["$sort"] = {
            createdAt: -1
        };
    }

    const videos = await Video.aggregate([
        matchStage,
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
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
        sortStage,
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        },
        {
            $addFields: {
                owner: {
                    $first : "$owner"
                },
                likes: {
                    $size: "$likes"
                }
            }
        }
        
    ]);

    if(!videos){
        throw new ApiError(404, "No video found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "get all videos success"));


});

const publishAVideo = asyncHandler(async (req, res) => {
    const {title, description} = req.body;
    // TODO: publish a video, cloudinary upload

    if([title, description].some((field) => field.trim() === "" || field.trim() === undefined)){
        throw new ApiError(400, "All fields are required");
    }

    let videoLocalPath;
    let thumbnailLocalPath;

    if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0){
        videoLocalPath = req.files.videoFile[0].path;
    }

    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }

    if(!(videoLocalPath || thumbnailLocalPath)){
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(404, "User not found");
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: user._id
    })

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    // TODO: get a video by id

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    if(!videoId){
        throw new ApiError(400, "Video id is required");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
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
                owner: {
                    $first: "$owner"
                },
                likes: {
                    $size: "$likes"
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "get video by id success"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    const {title, description} = req.body;
    // TODO: update a video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    if(!videoId){
        throw new ApiError(400, "Video id is required");
    }

    const video = await Video.findByIdAndUpdate(videoId, {
        $set : {
            title: title,
            description: description
        }
    }, {new: true});

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    // TODO: delete a video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    if(!videoId){
        throw new ApiError(400, "Video id is required");
    }

    const video = await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    if(!videoId){
        throw new ApiError(400, "Video id is required");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;

    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video publish status updated successfully"));

    

    
});

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus };