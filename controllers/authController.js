import User from "../models/userSchema.js"

const loginUser = async (req, res, next) => {
	try {
		let response = await User.findOne({
			username: req.body.username,
			password: req.body.password,
		})
		if (response) {
			const newResponse = JSON.parse(JSON.stringify(response))
			delete newResponse.password
			return res.status(200).json({
				success: true,
				data: { response: newResponse },
			})
		}
		res.status(412).json({
			success: false,
			data: { error: "Failed to login" },
		})
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
