import express from "express"
import postLike from "../controllers/likeController.js"

const router = express()

router.post("/likeUnlike", postLike.likeUnlikedPost)

export default router
