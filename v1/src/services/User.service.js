const UserSchema = require("../models/User.model");

const insertUser = async (userData) => {
	const newUser = new UserSchema(userData);
	return await newUser.save();
};
const getGivenIdUsers=async (userIds)=>{
	const users=await UserSchema.find({
		_id:userIds
	});
	return users;
}
const findAllUsers = () => {
	return UserSchema.find();
};
const updateMoney = async (userData) => {
	const id = userData.id;
	const money = parseFloat(userData.money);
	const user = await UserSchema.findOne({ _id: id });
	if (user == null) {
		return {
			message: "User not found"
		};
		
	}
	const userMoney = parseFloat(user.money);
	const summary = money + userMoney;
	const summaryT = summary + "";
	try {
		UserSchema.updateOne({ _id: id }, { money: `${summaryT}` }, (error, raw) => {
		});
	} catch (e) {
	}
};
const detailById = async (id) => {
	const user= await UserSchema.findOne({ _id: id });
	if(user){
		return user;
	}else{
		return {
			message: "User not found",
		}
	}
};
module.exports = {
	insertUser,
	findAllUsers,
	updateMoney,
	detailById,
	getGivenIdUsers
};
