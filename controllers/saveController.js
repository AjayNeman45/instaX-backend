import Save from "../models/savePostSchema.js"

class SaveClass {
	saveUnsavePost = async (req, res, next) => {
		try {
			const { userId, postId } = req.body
			const existingDoc = await Save.findOne({
				user_id: userId,
				post_id: postId,
			})

			if (!existingDoc) {
				const response = await Save.create({
					user_id: userId,
					post_id: postId,
				})
				res.success(`Post(${postId}) saved by user ${userId}`, response)
			} else {
				const response = await Save.findOneAndDelete({
					user_id: userId,
					post_id: postId,
				})
				if (response) return res.success("Unsaved post.")
				return res.error("Unable to unsave post", 412)
			}
		} catch (error) {
			next(error)
		}
	}
}

const SaveObj = new SaveClass()

export default SaveObj
