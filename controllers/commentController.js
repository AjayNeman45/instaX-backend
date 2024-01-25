import Comment from "../models/commentSchema.js"

class CommentClass {
	createComment = async (req, res, next) => {
		try {
			const { userId, postId, comment } = req.body
			const response = await Comment.create({
				user_id: userId,
				post_id: postId,
				comment: comment,
			})
			if (response) {
				return res.status(201).json({
					success: true,
					data: { message: "comment added", response },
				})
			}
			res.status(412).json({
				success: false,
				data: { message: "Error while adding comment" },
			})
		} catch (error) {
			next(error)
		}
	}
	deleteComment = async (req, res, next) => {
		try {
			const { commentId } = req.params
			const response = await Comment.findOneAndDelete({ _id: commentId })
			if (response) {
				return res.status(200).json({
					success: true,
					data: { message: "comment deleted" },
				})
			}

			res.status(412).json({
				success: false,
				data: { message: "error while deleting commen" },
			})
		} catch (error) {
			next(error)
		}
	}
}

export default new CommentClass()
