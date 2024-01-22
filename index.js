import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import bodyParser from "body-parser"

import authRouter from "./routes/auth.route.js"
import postRouter from "./routes/post.route.js"

import connectDB from "./configs/db.config.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT

app.use(cors())
app.use(bodyParser.json())
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
)

connectDB()
app.use("/api/auth", authRouter)
app.use("/api/post", postRouter)

app.use((err, req, res, next) => {
	const errStatus = err.statusCode || 500
	const errMsg = err.message || "Something went wrong"
	res.status(errStatus).json({
		success: false,
		status: errStatus,
		message: errMsg,
		stack: process.env.NODE_ENV === "development" ? err.stack : {},
	})
})

app.listen(PORT, error => {
	if (!error)
		console.log(
			"Server is Successfully Running,  App is listening on port " + PORT
		)
	else console.log("Error occurred, server can't start", error)
})
