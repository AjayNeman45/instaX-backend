import mongoose from "mongoose"
const Schema = mongoose.Schema

const commentSchema = new Schema(
	{
		post_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "post",
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
		},
		comment: {
			type: String,
		},
	},
	{ timestamps: true }
)

const comment = mongoose.model("comment", commentSchema)

export default comment
