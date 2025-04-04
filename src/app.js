import express from 'express'
import cors from 'cors' // middleware used to allow cross origin resource sharing
import cookieParser from 'cookie-parser'

const app = express()

// MIDDLEWARE => A middleware in Express.js is a function that runs between the request (req) and response (res) cycle. It can modify the request, process data, and decide whether to pass control to the next middleware.

// To define a Middlleware() or a router in express we uses app.use()
// some common middleware are:

// cors() => allow cross origin to access there resources 
// express.json() => allow express to parse incomming JSON request bodies
// express.static() => serves static files from folder name specified 
// express.urlencoded() => used to parse a incomming url-encoded form data helps in handdling form submission in express app and extends true takes in key,value pair

// cookieParser() =>  parses cookies from incoming HTTP requests and makes them available in req.cookies

// cors() → This is middleware that allows your backend to handle requests from different origins (domains).
app.use(cors({
  origin: process.env.CORS_ORIGIN, // it specifies which frontend domains are allowed to make requests
  credentials: true  //This enables the backend to handle cookies and authentication headers.
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// routes

import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import commentRouter from './routes/comment.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import likeRouter from './routes/like.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import healthcheckRouter from './routes/healthcheck.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'



// routes declaration to mount a router at a specific route prefix.
app.use("/api/v1/users", userRouter)

app.use("/api/v1/videos", videoRouter)

app.use("/api/v1/playlists", playlistRouter)

app.use("/api/v1/comments", commentRouter)

app.use("/api/v1/likes", likeRouter)

app.use("/api/v1/tweets", tweetRouter)

app.use("/api/v1/subscriptions", subscriptionRouter)

app.use("/api/v1/healthcheckup", healthcheckRouter)

app.use("/api/v1/dashboard", dashboardRouter)

export { app }
