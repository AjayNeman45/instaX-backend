import express from "express"
import savePost from "../controllers/saveController.js"

const router = express()

router.post("/saveUnsavePost", savePost.saveUnsavePost)

export default router
