import { Router } from 'express'
// controllers
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getUserWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
} from '../controllers/user.controller.js'
// middlewares
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'


// We make router from Router() from express
const router = Router()


// adding routes to router and defining the HTTP methods for each route

// in HTTP methods like post,get,patch,delete we use eg router.route().post(middleware,...,controller) we can pass n no of middlewares

router.route("/register").post(
  // from multer instance we defines a middleware to take files from form-data 
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }
  ]),
  registerUser
)

router.route("/login").post(loginUser)

// Secured Routes required authentication to go and see changes here middleware is 'verifyJWT'
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(getUserChannelProfile)

router.route("/history").get(verifyJWT, getUserWatchHistory)



export default router