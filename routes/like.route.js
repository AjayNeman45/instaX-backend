import express from "express"
import postLike from "../controllers/likeController.js"

const router = express()

router.post("/create", postLike.createLike)
router.get("/delete/:likeId", postLike.deleteLike)

export default router
