import { Follower, Following } from "../models/connectionSchema.js"
import User from "../models/userSchema.js"

class FollowerClass {
	addFollowerAndFollowing = async (req, res, next) => {
		const { userId, followerId } = req.body

		try {
			// Check if the users exist
			const user = await User.findOne({ _id: userId })
			const follower = await User.findOne({ _id: followerId })

			if (!user || !follower) {
				return res.error("User or follower not found", 404)
			}

			// Check if the relationship already exists
			const existingFollower = await Follower.findOne({
				user_id: userId,
				follower_id: followerId,
			})
			const existingFollowing = await Following.findOne({
				user_id: followerId,
				following_id: userId,
			})

			if (existingFollower || existingFollowing) {
				return res.error("Relationship already exists", 400)
			}

			// Create Follower and Following relationships
			const newFollower = new Follower({
				user_id: userId,
				follower_id: followerId,
			})
			const newFollowing = new Following({
				user_id: followerId,
				following_id: userId,
			})

			await newFollower.save()
			await newFollowing.save()

			res.success(
				"Follower and Following relationships added successfully",
				201
			)
		} catch (error) {
			next(error)
		}
	}
	removeFollowerAndFollowing = async (req, res, next) => {
		const { userId, followerId } = req.body

		try {
			// Check if the users exist
			const user = await User.findById(userId)
			const follower = await User.findById(followerId)

			if (!user || !follower) {
				return res.error("User or follower not found", 404)
			}

			// Check if the relationship exists
			const existingFollower = await Follower.findOne({
				user_id: userId,
				follower_id: followerId,
			})
			const existingFollowing = await Following.findOne({
				user_id: followerId,
				following_id: userId,
			})

			if (!existingFollower || !existingFollowing) {
				return res.error("Relationship not found", 404)
			}

			// Remove Follower and Following relationships
			await Follower.findByIdAndDelete(existingFollower._id)
			await Following.findByIdAndDelete(existingFollowing._id)

			res.success(
				"Follower and Following relationships removed successfully",
				200
			)
		} catch (error) {
			next(error)
		}
	}
}

export default new FollowerClass()
