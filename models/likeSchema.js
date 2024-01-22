import mongoose from "mongoose"
const Schema = mongoose.Schema

const likeSchema = new Schema(
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

const like = mongoose.model("like", likeSchema)

export default like
