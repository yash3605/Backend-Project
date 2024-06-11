import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/playlist.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
   // TODO: toggle subscription for a channel
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { userId } = req.params;
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };