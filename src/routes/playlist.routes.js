import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist
} from "../controllers/playlist.controller.js";






const router = Router()

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/create").post(createPlaylist)
router.route("/:userId").get(getUserPlaylists) // get user playlist
router.route("/:playlistId").get(getPlaylistById)
router.route("/:playlistId/video").post(addVideoToPlaylist)
router.route("/:playlistId/video/:videoId").delete(removeVideoFromPlaylist)
router.route("/delete/:playlistId").delete(deletePlaylist)
router.route("/update/:playlistId").patch(updatePlaylist)


export default router