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
});

const publishAVideo = asyncHandler(async (req, res) => {
    const {title, description} = req.body;
    // TODO: publish a video, cloudinary upload
});

const getVideoById = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    // TODO: get a video by id
});

const updateVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    // TODO: update a video
});

const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    // TODO: delete a video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
});

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus };