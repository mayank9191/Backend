import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware"
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js"



const router = Router()

router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file


router.route("/create-tweet").post(createTweet)
router.route("/user-tweet").get(getUserTweets)
router.route("/delete-tweet").delete(deleteTweet)
router.route("/update-tweet").patch(updateTweet)




export default router