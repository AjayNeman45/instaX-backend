import Like from "../models/likeSchema.js"

class LikeClass {
	createLike = async (req, res, next) => {
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
				return res.status(201).json({
					success: true,
					data: {
						message: `Like added for post ${postId} by user ${userId}`,
						response,
					},
				})
			}
			res.status(200).json({
				success: true,
				data: {
					message: "Like already present",
					response: existingDoc,
				},
			})
		} catch (error) {
			next(error)
		}
	}

	deleteLike = async (req, res, next) => {
		try {
			const { likeId } = req.params
			if (!likeId)
				return res.status(412).json({
					success: false,
					data: { error: "likeId required" },
				})
			const response = await Like.findOneAndDelete({ _id: likeId })

			res.status(200).json({
				success: true,
				data: { message: "Like removed" },
			})
		} catch (error) {
			next(error)
		}
	}
}

const LikeObj = new LikeClass()

export default LikeObj
