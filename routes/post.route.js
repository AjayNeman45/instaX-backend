import express from "express"
import userPost from "../controllers/postController.js"
import multer from "multer"
import likeRoute from "./like.route.js"
import commentRoute from "./comment.route.js"
import saveRoute from "./save.route.js"
const router = express()

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post(
	"/uploadPostImage",
	upload.single("image"),
	userPost.uploadPostImage
)

router.use("/like", likeRoute)
router.use("/comment", commentRoute)
router.use("/save", saveRoute)
router.post("/create", userPost.createPost)
router.get("/getAllPosts", userPost.getAllPosts)
router.get("/getPostByUserId/:userId", userPost.getPostByUserId)
router.get("/delete/:postId", userPost.deletePost)

export default router
