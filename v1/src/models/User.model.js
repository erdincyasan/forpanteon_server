const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
	{
		name: String,
		country: String,
		money: String
	},
	{
		timestamps: true,
		versionKey: false
	}
);

module.exports = mongoose.model("user", UserSchema);
