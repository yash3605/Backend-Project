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
});

const getChannelVideos = asyncHandler(async (req, res) => {
    //  TODO: get all videos for a channel
});

export { getChannelStats, getChannelVideos };