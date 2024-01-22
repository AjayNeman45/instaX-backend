import mongoose from "mongoose"
const Schema = mongoose.Schema

const postSchema = new Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
		},
		text: {
			type: String,
		},
		image: {
			type: String,
		},
	},
	{ timestamps: true }
)

const post = mongoose.model("post", postSchema)

export default post
