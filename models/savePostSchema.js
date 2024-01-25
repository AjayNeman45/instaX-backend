import mongoose from "mongoose"
const Schema = mongoose.Schema

const savePostSchema = new Schema(
	{
		post_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "post",
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
		},
	},
	{ timestamps: true }
)

const savedPost = mongoose.model("save", savePostSchema)

export default savedPost
