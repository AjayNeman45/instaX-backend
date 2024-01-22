import express from "express"
import postComment from "../controllers/commentController.js"
const router = express()

router.post("/create", postComment.createComment)
router.get("/delete/:commentId", postComment.deleteComment)

export default router
