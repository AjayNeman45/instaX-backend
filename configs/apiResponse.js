const handleSuccess = (req, res, next) => {
	res.success = (message, response, statusCode = 200) => {
		res.status(statusCode).json({
			success: true,
			data: {
				...(message ? { message } : null),
				...(response ? { response } : null),
			},
		})
	}
	next()
}

const handleError = (req, res, next) => {
	res.error = (error, statusCode = 500) => {
		res.status(statusCode).json({
			success: false,
			data: {
				error,
			},
		})
	}
	next()
}

export { handleSuccess, handleError }
