const { getLeaderBoard, getUserPosition, clearEveryThing, getUsersDailyDiff } = require("../scripts/redisClient");
const addRandomlyMoney = require("../scripts/addMoneyToUsers");
const getLeaders = async (req, res) => {
	const leaders = await getLeaderBoard();
	for (let index = 0; index < leaders.length; index++) {
		leaders[index].id = leaders[index].id.replace("earnedMoneyWeekly_", "");
	}
	res.status(200).send({
		message: "Başarılı!",
		leaderBoard: leaders
	});
};
const getLeadersWithIncludedUser = async (req, res) => {
	const leaders = await getLeaderBoard();
	const id = req.params.id;
	for (let index = 0; index < leaders.length; index++) {
		leaders[index].id = leaders[index].id.replace("earnedMoneyWeekly_", "");
	}
	const userPosition = await getUserPosition(id);
	if (userPosition) {
		for (let index = 0; index < userPosition.length; index++) {
			userPosition[index].id = userPosition[index].id.replace("earnedMoneyWeekly_", "");
		}
	}

	res.status(200).send({
		message: "Başarılı",
		leaderBoard: leaders,
		userPosition: userPosition ? userPosition : []
	});
};
const setRandomlyMoneyToUsers = async (req, res) => {
	await addRandomlyMoney();
	res.status(200).send({
		message: "Paralar başarılı bir şekilde eklendi!"
	});
};
const clearData = async (req, res) => {
	clearEveryThing();
	res.status(200).send({ message: "Başarılı bir şekilde temizlendi" });
};
const getDailyDifferenceUsers = async (req, res) => {
	const resp = await getUsersDailyDiff(req.body.users);
	res.status(200).send(resp);
};
module.exports = {
	getLeaders,
	getLeadersWithIncludedUser,
	setRandomlyMoneyToUsers,
	clearData,
	getDailyDifferenceUsers
};
