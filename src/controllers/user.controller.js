import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefreshToken = async (userId) => {
    try {
       const user =  await User.findById(userId)
      const accessToken =  user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({validateBeforeSave: false})

      return {accessToken, refreshToken}
    } catch (error) {
        console.log("ERROR: ", error);
        throw new ApiError(500, "Failed to generate tokens")
    }
}

const registerUser = asyncHandler( async(req,res) => {
    // get user details from frontend
    // validation - not empty etc
    // check if user already exists: by username or email
    // check for images, check for avatar
    // upload images to cloudinary, avatar
    // create user object - create entry in DB
    // remove password and refresh token from response
    // check for user creation
    // return response

    const {fullname, email, username, password} = req.body

    // if(fullname == ""){
    //     throw new ApiError(400, "Fullname is required")
    // }
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")  
    }

    const existedUser = await User.findOne({
        $or: [{email} , {username}]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
        
    }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar){
        throw new ApiError(500, "Failed to upload avatar")
   }

   const user = await User.create({
         fullname,
         email,
         username: username.toLowerCase(),
         password,
         avatar: avatar.url,
         coverImage: coverImage?.url || ""
   })

   const CreatedUser = await User.findById(user._id).select(
        "-password -refreshToken"
   )

   if(!CreatedUser){
       throw new ApiError(500, "Failed to create user")
   }

   return res.status(201).json(
        new ApiResponse(200, "User created successfully", CreatedUser)
   )    
})

const loginUser = asyncHandler( async(req,res) => {
    // request body -> data
    // username or email
    // find the user
    // check password
    // access and refresh token generation
    // send cookies and response

    const {email, username, password} = req.body

    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

   const isPasswordValid =  await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
         throw new ApiError(401, "Invalid password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken
        
        }, "User logged in successfully")
    )
})

const logoutUser = asyncHandler( async(req,res) => {
    // clear cookies,
    // remove refresh token from DB
   await  User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User Logged out successfully"))
})

const refreshAccessToken = asyncHandler( async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
       const user =  await User.findById(decodedToken?._id)
    
       if(!user){
           throw new ApiError(401, "Invalid refresh token")
       }
    
        if(user?.refreshToken !== incomingRefreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(200, {
                accessToken,
                refreshToken: newrefreshToken
              },
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler( async(req,res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._idid)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword

    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Succesfully"))
})

const getCurrentUser = asyncHandler( async(req,res) => {
    return res
    .status(200)
    .json(200, req.user, "Current user fetched succesfully")
})

const updateAccountDetails = asyncHandler( async(req,res) => {
    const {fullname, email} = req.body

    if(!(fullname || email) ){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname: fullname,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json( new ApiResponse(200, user, "Account Details Update Succesfully"))
})

const updateUserAvatar = asyncHandler( async(req,res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is Missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new :true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated succesfully"))
})

const updateUserCoverImage = asyncHandler( async(req,res) => {
        const coverImageLocalPath = req.file?.path
    
        if(!coverImageLocalPath){
            throw new ApiError(400, "cover image file is Missing")
        }
    
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
        if(!coverImage.url){
            throw new ApiError(400, "Error while uploading cover image")
        }
    
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    coverImage: coverImage.url
                }
            },
            {new :true}
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200, user, "cover image updated succesfully"))
})

const getUserChannelProfile = asyncHandler( async(req,res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "Username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
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
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                email: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404, "Channel not found")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"))
    
})

const getWatchHistory = asyncHandler( async(req,res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
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
                        $addFields: {
                            owner: {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        },
        {
            $project: {
                watchHistory: 1
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, user[0]?.watchHistory, "Watch history fetched successfully"))
})




export {
     registerUser,
     loginUser,
     logoutUser,
     refreshAccessToken,
     changeCurrentPassword,
     getCurrentUser,
     updateAccountDetails,
     updateUserAvatar,
     updateUserCoverImage,
     getUserChannelProfile,
     getWatchHistory 
}