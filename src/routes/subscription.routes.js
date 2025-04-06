import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getSubscribedChannels, toggleSubscription } from "../controllers/subscription.controller.js";






const router = Router()

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/c/:channelId")
  .get(getSubscribedChannels)
  .post(toggleSubscription)


router.route("/u/:subscriberId").get(getSubscribedChannels)






export default router