import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    //TODO: create a new playlist

    if([name, description].some((field) => field.trim() === undefined || field.trim() === "")){
        throw new ApiError(400, "Name and description are required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    });
    
    const createdPlaylist = await Playlist.findById(playlist._id)

    return res
    .status(201)
    .json( new ApiResponse(201, {createdPlaylist}, "playlist Created Successfully"))
    
    
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    // TODO: get all playlists for a user

    const playlists = await Playlist.find({ owner: userId });

    return res
    .status(200)
    .json(new ApiResponse(200, {playlists}, "User playlists retrieved successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }

    if(!playlistId){
        throw new ApiError(400, "Playlist ID is required");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {playlist}, "Playlist retrieved successfully"));
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist ID or video ID");
    }

    if(!playlistId || !videoId){
        throw new ApiError(400, "Playlist ID and video ID are required");
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, 
    {
        $push: {
            videos: videoId
        }
    },{new: true}
  )

  if(!playlist){
      throw new ApiError(404, "Error adding Video to playlist")
    }
    return res
    .status(201)
    .json(new ApiResponse(201, {playlist}, "Video added to playlist successfully"));

});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    // TODO remove video from playlist

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist ID or video ID");
    }

    if(!playlistId || !videoId){
        throw new ApiError(400, "Playlist ID and video ID are required");
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull: {
                videos: videoId
            }
        },{new: true}   
    )

    if(!playlist){
        throw new ApiError(404, "Error removing video from playlist")
    }   

    return res
    .status(200)
    .json(new ApiResponse(200, {playlist}, "Video removed from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    // TODO delete playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }

    if(!playlistId){
        throw new ApiError(400, "Playlist ID is required");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
    
    if(!deletedPlaylist){
        throw new ApiError(404, "Error deleting playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {deletedPlaylist}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    // TODO update playlist

    if([playlistId, name, description].some((field) => field.trim() === undefined || field.trim() === "")){
        throw new ApiError(400, "Playlist ID, name and description are required");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $set: {
                name: name,
                description: description
            }
        },{new: true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200, {updatedPlaylist}, "Playlist updated successfully"));


});

export { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist };