import Like from "../models/likeSchema.js"

class LikeClass {
	likeUnlikedPost = async (req, res, next) => {
		try {
			const { userId, postId } = req.body
			const existingDoc = await Like.findOne({
				user_id: userId,
				post_id: postId,
			})

			if (!existingDoc) {
				const response = await Like.create({
					user_id: userId,
					post_id: postId,
				})
				res.success(`Post(${postId}) Liked by user ${userId}`, response)
			} else {
				const response = await Like.findOneAndDelete({
					user_id: userId,
					post_id: postId,
				})
				if (response) return res.success("UnLiked post.")
				return res.error("Unable to unlike post", 412)
			}
		} catch (error) {
			next(error)
		}
	}
}

const LikeObj = new LikeClass()

export default LikeObj
