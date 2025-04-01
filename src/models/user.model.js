import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


// we create a schema for our collection 
const userSchema = new mongoose.Schema({
  watchHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  }],
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  avatar: {
    type: String, // cloudinary url
    required: true
  },
  coverImage: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "password is required"]
  },
  refreshToken: {
    type: String
  },
}, { timestamps: true })


// type of middleware that before saving of password encrypt it 
userSchema.pre("save", async function (next) {
  // if password is not changed return next()
  if (!this.isModified("password")) return next();

  // if password changes encrypt it by bcrypt.hash(password,saltRounds)
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// defining function or methods to user created by userSchema
// first method is to check given password is correct or not with encrpt password by 'bcrypt.compare(password,this.password)'
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

// method to generate access token by user data 
userSchema.methods.generateAccessToken = function () {

  // this is done by jwt - jsonWebToken library to jwt.sign({user details},access_tooken_secret,{expireIn})

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

// this method generate refresh token from userID  'jwt.sign({userID},refresh_token_secret,{expires IN})'

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

// we created model from schema its name stored in mongo database as users (name in lowercase and with s at last) 
export const User = mongoose.model("User", userSchema)