import express from "express"
import connectUser from "../controllers/connectionController.js"

const router = express()

router.post("/addFollowerAndFollowing", connectUser.addFollowerAndFollowing)
router.post(
	"/removeFollowerAndFollowing",
	connectUser.removeFollowerAndFollowing
)

export default router
