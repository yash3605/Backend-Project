import mongoose, { isValidObjectId } from "mongoose";
import {Comment} from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    // TODO: get all comments for a video
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;

    if(!videoId || isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    page = isNaN(page) ? 1 : Number(page);
    limit = isNaN(limit) ? 10 : Number(limit);

    const videoComments = await Comment.aggregate([
        {
            $match: {
                video: mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "commentedBy",
                foreignField: "_id",
                as: "commentedBy",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        },
                    },
                ]
            }
        },
        {
            $addFields: {
                commentBy: {
                    $first: "$commentedBy"
                }
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        }
        
    ])

    res
    .status(200)
    .json(new ApiResponse(200, videoComments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    //TODO: add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video ID");
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content is required");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400, "Video doesn't exist");
    }

    const userComment = Comment.create({
        video: videoId,
        content: content.trim(),
        commentedBy: req.user?._id
    });

    if(!userComment){
        throw new ApiError(500, "Failed to add comment");
    }

    res
    .status(201)
    .json(new ApiResponse(201, userComment, "Comment added successfully"));


});

const updateComment = asyncHandler(async (req, res) => {
    //TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;

    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid Comment ID");
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content is required");
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId,
      {
           $set: {
              content: content.trim()
           }
      },
      {
           new: true
      }
  );

    if(!updatedComment){
        throw new ApiError(500, "Failed to update comment");
    }

    res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));


});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;

    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid Comment ID");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if(!deletedComment){
        throw new ApiError(500, "Failed to delete comment");
    }

    res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };