import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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


export { registerUser }