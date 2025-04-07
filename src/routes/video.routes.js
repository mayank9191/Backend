import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo
} from "../controllers/video.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/").get(verifyJWT, getAllVideos)
router.route("/upload-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1
    },
    {
      name: "thumbnail",
      maxCount: 1
    }
  ]),
  publishAVideo
)

router.route("/watch").get(getVideoById)

router.route("/update").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1
    },
    {
      name: "thumbnail",
      maxCount: 1
    }
  ]),
  updateVideo
)

router.route("/delete").delete(verifyJWT, deleteVideo)

router.route("/change-publish-status").post(verifyJWT, togglePublishStatus)


export default router 