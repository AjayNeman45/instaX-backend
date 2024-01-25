import User from "../models/userSchema.js"

const loginUser = async (req, res, next) => {
	try {
		const { username, password } = req.body

		const user = await User.findOne({
			username,
			password,
		})
		if (!user) return res.error("User not found", 404)

		const response = await User.aggregate([
			{
				$match: {
					_id: user?._id,
				},
			},
			{
				$lookup: {
					from: "followers",
					localField: "_id",
					foreignField: "user_id",
					as: "followers",
				},
			},
			{
				$lookup: {
					from: "followings",
					localField: "_id",
					foreignField: "user_id",
					as: "followings",
				},
			},
			{
				$project: {
					_id: 1,
					username: 1,
					email: 1,
					name: 1,
					description: 1,
					profilePhoto: 1,
					followers: "$followers.follower_id",
					followings: "$followings.following_id",
				},
			},
		])
		if (response) {
			return res.success(null, response, 200)
		}
		res.error("User not found", 404)
	} catch (error) {
		next(error)
	}
}

const registerUser = async (req, res, next) => {
	try {
		const response = await User.create({
			username: req.body.username,
			password: req.body.password,
			description: req.body.description,
			email: req.body.email,
			profilePhoto: req.body.profilePhoto,
			name: req.body.name,
		})
		res.send(response)
	} catch (error) {
		next(error)
	}
}

const getAllUsers = async (req, res, next) => {
	try {
		const response = await User.find()
		res.json(response)
	} catch (error) {
		next(error)
	}
}

const getUserById = async (req, res, next) => {
	try {
		const response = await User.find({ _id: req.params.id })
		res.json(response)
	} catch (error) {
		next(error)
	}
}

export { loginUser, registerUser, getAllUsers, getUserById }
