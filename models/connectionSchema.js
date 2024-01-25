// follower.js
import mongoose from "mongoose"

const followerSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
		follower_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
		// You can add additional fields like timestamps if needed
	},
	{ timestamps: true }
)

const Follower = mongoose.model("follower", followerSchema)

const followingSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
		following_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
		// You can add additional fields like timestamps if needed
	},
	{ timestamps: true }
)

const Following = mongoose.model("Following", followingSchema)

export { Following, Follower }
