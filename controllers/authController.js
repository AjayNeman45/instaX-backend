import User from "../models/userSchema.js"
import bcrypt from "bcrypt"

const loginUser = async (req, res, next) => {
	try {
		const { username, password } = req.body

		const user = await User.findOne({ username })
		if (!user) return res.error("User not found", 404)

		const passwordMatch = await bcrypt.compare(password, user.password)

		if (!passwordMatch) {
			return res.error("Invalid username or password", 401)
		}

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
					createdAt: 1,
				},
			},
		])
		if (response) {
			return res.success(null, response, 200)
		}
		res.error("User not found", 404)
	} catch (error) {
		res.error(error.message, 500)
	}
}

const registerUser = async (req, res, next) => {
	try {
		const { password } = req.body
		const hashPassword = await bcrypt.hash(password, 10)
		const createUserResponse = await User.create({
			username: req.body.username,
			password: hashPassword,
			description: req.body.description,
			email: req.body.email,
			profilePhoto: req.body.profilePhoto,
			name: req.body.name,
		})
		if (createUserResponse) {
			const response = await User.aggregate([
				{
					$match: {
						_id: createUserResponse?._id,
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
						createdAt: 1,
					},
				},
			])
			res.success("User register successfully", response, 201)
		} else res.error("Failed to sign up user", 500)
	} catch (error) {
		console.log("sending  ", error.message)
		res.error(error.message, 500)
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
		const { username } = req.params

		const user = await User.findOne({
			username,
		})
		if (!user) return res.error("User not found", 404)

		const response = await User.aggregate([
			{
				$match: {
					username: username,
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
					createdAt: 1,
				},
			},
		])
		if (response) res.success(null, response, 200)
	} catch (error) {
		res.error(error.message, 500)
	}
}

export { loginUser, registerUser, getAllUsers, getUserById }
