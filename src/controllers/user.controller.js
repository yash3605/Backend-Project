import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
       const user =  await User.findById(userId)
      const accessToken =  user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({validateBeforeSave: false})

      return {accessToken, refreshToken}
    } catch (error) {
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
    // request bodu -> data
    // username or email
    // find the user
    // check password
    // access and refresh token generation
    // send cookies and response

    const {email, username, password} = req.body

    if (!username || !email) {
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

    const loggedInUser = User.findById(user._id).select("-password -refreshToken")

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


export { registerUser, loginUser, logoutUser }