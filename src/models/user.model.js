import mongoose, {Schema} from 'mongoose';

const UserSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname:{
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String, //3rd part (cloudinary url)
        required: true,
    },
    coverImage:{
        type: String, //3rd part (cloudinary url)
    },
    watchHistory:[{
        type: Schema.Types.ObjectId,
        ref: 'Video'
    }],
    password:{
        type: String,
        required: [true, 'Password is required'],
    },
    refreshToken:{
        type: String,
    },
        
},{
    timestamps: true
});


export const User = mongoose.model('User', UserSchema)
