import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/playlist.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
   // TODO: toggle subscription for a channel

   if(!isValidObjectId(channelId)){
       throw new ApiError(400, "Invalid channel ID");
   }

   if(!channelId){
       throw new ApiError(400, "Channel ID is required");
   }

   const isSubscribed = await Subscription.findOne({
    $and: [
        { subscriber: req.user?._id },
        { channel: channelId  }
    ]
   })

   if(!isSubscribed){
     const subscriber = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        });
   }

   if(!subscriber){
    throw new ApiError(500, "Failed to subscribe to channel");
   }

    if(isSubscribed){
         await Subscription.findByIdAndDelete(isSubscribed._id);
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Subscription toggled successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel ID");
    }

    if(!channelId){
        throw new ApiError(400, "Channel ID is required");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ubscribers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Channel subscribers fetched successfully"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid subscriber ID");
    }

    if(!subscriberId){
        throw new ApiError(400, "Subscriber ID is required");
    }

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "allChannels",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));

});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };