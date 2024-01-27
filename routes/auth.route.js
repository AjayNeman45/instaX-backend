import express from "express"
import {
	getAllUsers,
	loginUser,
	registerUser,
	getUserById,
} from "../controllers/authController.js"

const router = express()

router.post("/login", loginUser)
router.post("/register", registerUser)
router.get("/users", getAllUsers)
router.get("/users/:username", getUserById)

export default router
