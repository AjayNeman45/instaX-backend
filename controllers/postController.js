import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import mongoose from "mongoose"

import firebaseStorage from "../configs/firbase.config.js"
import Post from "../models/postSchema.js"
import Like from "../models/likeSchema.js"
import Comment from "../models/commentSchema.js"
import Saves from "../models/savePostSchema.js"

class postClass {
	createPost = async (req, res, next) => {
		try {
			const { text, userId, image } = req.body
			const response = await Post.create({
				text,
				image,
				user_id: userId,
			})
			if (response) {
				return res.status(201).json({
					success: true,
					statusCode: 201,
					data: {
						message: "New post created ",
						response,
					},
				})
			}
			res.status(412).json({
				success: false,
				data: { error: "Error while creating post" },
			})
		} catch (error) {
			next(error)
		}
	}

	uploadPostImage = async (req, res, next) => {
		try {
			if (!req.file) return res.json({ error: "file required" }, 412)
			const metaData = {
				contentType: req.file.mimetype,
			}
			const storageRef = ref(
				firebaseStorage,
				"images/" + req.file.originalname
			)

			const uploadFile = uploadBytesResumable(
				storageRef,
				req.file.buffer,
				metaData
			)

			uploadFile.on(
				"state_changed",
				snapshot => {
					const progress =
						(snapshot.bytesTransferred / snapshot.totalBytes) * 100
					switch (snapshot.state) {
						case "paused":
							console.log("Upload is paused")
							break
						case "running":
							console.log("Upload is running")
							break
					}
				},
				error => {
					let errorMsg = ""
					switch (error.code) {
						case "storage/unauthorized":
							errorMsg =
								"User doesn't have permission to access the object"
							break
						case "storage/canceled":
							errorMsg = "User canceled the upload"
							break
						case "storage/unknown":
							errorMsg =
								"Unknown error occurred, inspect error.serverResponse"
							break
					}

					res.status(412).json({
						success: false,
						data: {
							error: errorMsg,
						},
					})
				},
				() => {
					getDownloadURL(uploadFile.snapshot.ref).then(
						downloadURL => {
							console.log("File available at", downloadURL)
							res.status(200).json({
								success: true,
								data: { url: downloadURL },
							})
						}
					)
				}
			)
		} catch (error) {
			next(error)
		}
	}

	deletePost = async (req, res, next) => {
		try {
			let postId = req.params.postId
			if (!postId)
				return res.json(
					{ success: false, data: { error: "post id required" } },
					412
				)
			mongoose.startSession().then(async session => {
				// Start the transaction
				session.startTransaction()

				try {
					// Delete the post
					await Post.deleteOne({ _id: postId }).session(session)

					// Delete the likes associated with the post
					await Like.deleteMany({ post_id: postId }).session(session)

					// Delete the comments associated with the post
					await Comment.deleteMany({ post_id: postId }).session(
						session
					)

					// Commit the transaction
					await session.commitTransaction()
					return res.status(200).json({
						success: true,
						data: { message: `post deleted with id ${postId}` },
					})
				} catch (error) {
					// If an error occurs, abort the transaction
					await session.abortTransaction()

					console.error(
						"Error deleting post, comments, and likes:",
						error.message
					)
					res.status(404).json({
						success: false,
						data: { error: error.message },
					})
				} finally {
					// End the session
					session.endSession()
				}
			})
		} catch (error) {
			next(error)
		}
	}

	getAllPosts = async (req, res, next) => {
		try {
			let pageNumber = req.query.page || 0
			let limit = 10
			const response = await Post.aggregate([
				{
					$lookup: {
						from: "likes",
						localField: "_id",
						foreignField: "post_id",
						as: "likes",
					},
				},
				{
					$lookup: {
						from: "comments",
						localField: "_id",
						foreignField: "post_id",
						as: "comments",
					},
				},
				{
					$lookup: {
						from: "saves",
						localField: "_id",
						foreignField: "post_id",
						as: "saves",
					},
				},
				{
					$lookup: {
						from: "users", // Assuming there is a 'users' collection referenced in 'postSchema'
						localField: "user_id",
						foreignField: "_id",
						as: "user",
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "comments.user_id",
						foreignField: "_id",
						as: "commentUsers",
					},
				},
				{
					$project: {
						user: { $arrayElemAt: ["$user", 0] },
						text: 1,
						image: 1,
						imageHeight: 1,
						likes: {
							$map: {
								input: "$likes",
								as: "like",
								in: {
									user_id: "$$like.user_id",
									_id: "$$like._id",
									// other like fields you want to include
								},
							},
						},
						saves: {
							$map: {
								input: "$saves",
								as: "save",
								in: {
									user_id: "$$save.user_id",
									_id: "$$save._id",
									// other like fields you want to include
								},
							},
						},

						comments: {
							$map: {
								input: "$comments",
								as: "comment",
								in: {
									user: {
										$arrayElemAt: [
											{
												$filter: {
													input: "$commentUsers",
													as: "cu",
													cond: {
														$eq: [
															"$$cu._id",
															"$$comment.user_id",
														],
													},
												},
											},
											0,
										],
									},
									comment: "$$comment.comment",
									_id: "$$comment._id",
									createdAt: "$$comment.createdAt",
									updatedAt: "$$comment.updatedAt",
									// other comment fields you want to include
								},
							},
						},
						createdAt: 1,
						updatedAt: 1,
					},
				},
				{
					$sort: {
						createdAt: -1, // Sort in descending order based on the 'createdAt' field
					},
				},
				{ $skip: pageNumber * limit },
				{ $limit: limit },
			])

			if (response) {
				return res
					.status(200)
					.json({ success: true, data: { response } })
			}
			res.status(412).json({
				success: false,
				data: { error: "No post found" },
			})
		} catch (error) {
			next(error)
		}
	}

	getPostsByUserId = async (req, res, next) => {
		try {
			const { userId } = req.params
			if (!userId)
				return res.status(412).json({
					successs: false,
					data: { error: "userId required" },
				})

			const response = await Post.aggregate([
				{
					$match: {
						user_id: new mongoose.Types.ObjectId(userId),
					},
				},
				{
					$lookup: {
						from: "likes",
						localField: "_id",
						foreignField: "post_id",
						as: "likes",
					},
				},
				{
					$lookup: {
						from: "comments",
						localField: "_id",
						foreignField: "post_id",
						as: "comments",
					},
				},
				{
					$lookup: {
						from: "saves",
						localField: "_id",
						foreignField: "post_id",
						as: "saves",
					},
				},
				{
					$lookup: {
						from: "users", // Assuming there is a 'users' collection referenced in 'postSchema'
						localField: "user_id",
						foreignField: "_id",
						as: "user",
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "comments.user_id",
						foreignField: "_id",
						as: "commentUsers",
					},
				},
				{
					$project: {
						user: { $arrayElemAt: ["$user", 0] },
						text: 1,
						image: 1,
						imageHeight: 1,
						likes: {
							$map: {
								input: "$likes",
								as: "like",
								in: {
									user_id: "$$like.user_id",
									_id: "$$like._id",
									// other like fields you want to include
								},
							},
						},
						saves: {
							$map: {
								input: "$saves",
								as: "save",
								in: {
									user_id: "$$save.user_id",
									_id: "$$save._id",
									// other like fields you want to include
								},
							},
						},

						comments: {
							$map: {
								input: "$comments",
								as: "comment",
								in: {
									user: {
										$arrayElemAt: [
											{
												$filter: {
													input: "$commentUsers",
													as: "cu",
													cond: {
														$eq: [
															"$$cu._id",
															"$$comment.user_id",
														],
													},
												},
											},
											0,
										],
									},
									comment: "$$comment.comment",
									_id: "$$comment._id",
									createdAt: "$$comment.createdAt",
									updatedAt: "$$comment.updatedAt",
									// other comment fields you want to include
								},
							},
						},
						createdAt: 1,
						updatedAt: 1,
					},
				},
				{
					$sort: {
						createdAt: -1, // Sort in descending order based on the 'createdAt' field
					},
				},
			])

			if (response) {
				return res
					.status(200)
					.json({ success: true, data: { response } })
			}
			res.status(412).json({
				succss: false,
				data: { error: "No Post found" },
			})
		} catch (error) {
			next(error)
		}
	}

	getSavedPostsByUserId = async (req, res, next) => {
		try {
			const { userId } = req.params
			const response = await Saves.aggregate([
				{
					$match: {
						user_id: new mongoose.Types.ObjectId(userId), // Replace with the actual user_id
					},
				},
				{
					$lookup: {
						from: "posts", // The name of the posts collection
						localField: "post_id",
						foreignField: "_id",
						as: "saved_posts",
					},
				},
				{
					$unwind: "$saved_posts", // Unwind the array created by $lookup
				},
				{
					$lookup: {
						from: "likes",
						localField: "saved_posts._id",
						foreignField: "post_id",
						as: "likes",
					},
				},
				{
					$lookup: {
						from: "comments",
						localField: "saved_posts._id",
						foreignField: "post_id",
						as: "comments",
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "comments.user_id",
						foreignField: "_id",
						as: "commentUsers",
					},
				},
				{
					$lookup: {
						from: "saves",
						localField: "saved_posts._id",
						foreignField: "post_id",
						as: "saved_users",
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "saved_posts.user_id", // Assuming user_id is a field in the posts collection
						foreignField: "_id",
						as: "post_user",
					},
				},
				{
					$project: {
						_id: "$saved_posts._id",
						text: "$saved_posts.text", // Include other fields from the posts collection as needed
						image: "$saved_posts.image",
						imageHeight: "$saved_posts.imageHeight",
						createdAt: "$saved_posts.createdAt",
						likes: {
							$map: {
								input: "$likes",
								as: "like",
								in: {
									user_id: "$$like.user_id",
									_id: "$$like._id",
									// other like fields you want to include
								},
							},
						},
						comments: {
							$map: {
								input: "$comments",
								as: "comment",
								in: {
									user: {
										$arrayElemAt: [
											{
												$filter: {
													input: "$commentUsers",
													as: "cu",
													cond: {
														$eq: [
															"$$cu._id",
															"$$comment.user_id",
														],
													},
												},
											},
											0,
										],
									},
									comment: "$$comment.comment",
									_id: "$$comment._id",
									createdAt: "$$comment.createdAt",
									updatedAt: "$$comment.updatedAt",
									// other comment fields you want to include
								},
							},
						},
						saves: {
							$map: {
								input: "$saved_users",
								as: "su",
								in: {
									user_id: "$$su.user_id",
									_id: "$$su._id",
									// other like fields you want to include
								},
							},
						},
						user: { $arrayElemAt: ["$post_user", 0] },
						// Add more fields as needed
					},
				},
			])

			res.success("saved posts by userId", response, 200)
		} catch (error) {
			next(error)
		}
	}
}

const postObj = new postClass()

export default postObj
