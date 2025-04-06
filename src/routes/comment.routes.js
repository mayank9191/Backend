import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment
} from "../controllers/comment.controller.js";



const router = Router()

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


router.route("/:videoId").get(getVideoComments)
router.route("/add").post(addComment)
router.route("/update/:commentId").patch(updateComment)
router.route("/delete/:commentId").delete(deleteComment)



export default router