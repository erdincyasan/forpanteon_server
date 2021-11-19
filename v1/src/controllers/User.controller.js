const { insertUser, findAllUsers, updateMoney, detailById,getGivenIdUsers } = require("../services/User.service");
const {
	setKeyAndValue,
	getValueWithKey,
	resetDailyDiffs,
	calculateLeaderBoard,
	increasePrizePool
} = require("../scripts/redisClient");
const createUser = (req, res) => {
	let x = insertUser(req.body);
	res.status(200).send(x);
};
const getAllUsers = (req, res) => {
	findAllUsers().then((response) => {
		res.status(200).send(response);
	});
};
const updateMoneyByUserId = async (req, res) => {
	const id = req.params.id;
	req.body.id = id;
	const userEarnMoneyFee = parseFloat(req.body.money).toFixed(2) * 0.02;
	const actualMoney = parseFloat(req.body.money).toFixed(2) - userEarnMoneyFee;
	let earnedMoney = await getValueWithKey(`earnedMoneyWeekly_${id}`);
	earnedMoney = parseFloat(earnedMoney);
req.body.money=actualMoney;
	updateMoney(req.body)
		.then(async (response) => {
			if (!Number.isNaN(earnedMoney)) {
				await increasePrizePool(userEarnMoneyFee);
				const sum = parseFloat(earnedMoney) + actualMoney;
				setKeyAndValue(`earnedMoneyWeekly_${id}`, sum.toFixed(2));
			} else {
				await increasePrizePool(userEarnMoneyFee);
				setKeyAndValue(`earnedMoneyWeekly_${id}`, parseFloat(actualMoney).toFixed(2));
			}
			res.status(200).send(response);
		})
		.catch((error) => {
			res.status(500).send(error);
		});
};
const getDetailById = (req, res) => {
	const id = req.params.id;
	detailById(id)
		.then((response) => {
			res.status(200).send(response);
		})
		.catch((e) => res.status(500).send(e));
};
const resetDailyDif = (req, res) => {
	resetDailyDiffs();
};
const calculateBoard = (req, res) => {
	calculateLeaderBoard();
	res.status(200).send("OK");
};
const getUserByIds=async (req,res)=>{
	const users=await getGivenIdUsers(req.body.users);
	res.status(200).send(users);
}
module.exports = {
	createUser,
	getAllUsers,
	updateMoneyByUserId,
	getDetailById,
	resetDailyDif,
	calculateBoard,
	getUserByIds
};
