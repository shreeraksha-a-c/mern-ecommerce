import User from "../models/user.model.js";

// GET /api/users  (admin) - every user with order count and total spent; password is never projected
export const getAllUsers = async (req, res) => {
	try {
		const users = await User.aggregate([
			{ $lookup: { from: "orders", localField: "_id", foreignField: "user", as: "orders" } },
			{
				$project: {
					name: 1,
					email: 1,
					role: 1,
					createdAt: 1,
					orderCount: { $size: "$orders" },
					totalSpent: { $sum: "$orders.totalAmount" },
				},
			},
			{ $sort: { createdAt: -1 } },
		]);
		res.json(users);
	} catch (error) {
		console.log("Error in getAllUsers controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};