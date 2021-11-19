const { updateMoney,getGivenIdUsers } = require("../services/User.service");
const redis = require("redis");
const client = redis.createClient({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT
});
client.on("error", (error) => {
	console.log(error);
});
client.on("connect", (message) => {
	console.log("Bağlantı başarılır->Redis");
});
const setKeyAndValue = (key, value) => {
	client.set(key, value);
};
const getValueWithKey = (key) => {
	return new Promise((resv, rej) => {
		client.get(key, (err, reply) => {
			resv(reply);
		});
	});
};
const getUsersDailyDiff = async (userIds) => {
	const dailyDiff = await getValueWithKey("dailyDifference");
	if (dailyDiff) {
		const dailyDiffJson = JSON.parse(dailyDiff);
		const userList = [];
		userIds.forEach((user) => {
			const userIndex = dailyDiffJson.findIndex((x) => x.id === `earnedMoneyWeekly_${user}`);
			userList.push({
				id: user,
				dailyChange: dailyDiffJson[userIndex].change
			});
		});

		return {
			message: "Daily difference başarılı",
			dailyDiff: userList
		};
	}
	return {
		message: "Daily Diff hesaplanamadı",
		dailyDiff: []
	};
};
const calculateLeaderBoard = async () => {
	const resolvePromise = await new Promise((resv, rej) => {
		client.keys("earnedMoneyWeekly_*", async (error, keys) => {
			const sortArray = [];
			if (keys.length > 0) {
				await Promise.all(
					keys.map(async (key) => {
						let userMoney = await getValueWithKey(key);
						const userId = key.replace("earnedMoneyWeakly_", "");
						sortArray.push({ id: userId, weeklyEarnedMoney: userMoney });
					})
				);
			}
			sortArray.sort((a, b) => (a.weeklyEarnedMoney - b.weeklyEarnedMoney) * -1);
			let pos = 1;
			sortArray.forEach((x) => (x.position = pos++));
			const userIds=[];
			sortArray.map(x=>userIds.push(x.id.replace("earnedMoneyWeekly_","")));
			const userInfos=await getGivenIdUsers(userIds);
			userInfos.forEach((x,index)=>{
				let ind=sortArray.findIndex(y=>y.id===`earnedMoneyWeekly_${x._id.toString()}`)
				sortArray[ind].name=x.name;
				sortArray[ind].country=x.country;
				sortArray[ind].totalMoney=x.money;
			})
			const leaderBoardJson = JSON.stringify(sortArray);
			setKeyAndValue("leaderBoardJson", leaderBoardJson);
			resv(sortArray);
		});
	});
	return resolvePromise;
};
const setDailyDiff = async () => {
	const currentLeaderBoard = JSON.parse(await getValueWithKey("leaderBoardJson"));
	const newLeaderBoard = await calculateLeaderBoard();
	if (typeof newLeaderBoard === "undefined") {
		return;
	}
	const dailyChange = [];
	newLeaderBoard.sort((a, b) => (a.weeklyEarnedMoney - b.weeklyEarnedMoney) * -1);
	for (let index = 0; index < newLeaderBoard.length; index++) {
		const id = newLeaderBoard[index].id;
		const oldIndex = currentLeaderBoard.findIndex((a) => a.id === id) + 1;
		const newIndex = newLeaderBoard.findIndex((a) => a.id === id) + 1;

		const daily = {
			id: id,
			change: oldIndex - newIndex
		};
		
		if (newIndex === 0 || oldIndex === 0) {
			daily.change = 0;
		}
		newLeaderBoard[index].dailyDifference=daily.change;
		dailyChange.push(daily);
	}
	setKeyAndValue("leaderBoardJson",JSON.stringify(newLeaderBoard));
	setKeyAndValue("dailyDifference", JSON.stringify(dailyChange));
};
const getLeaderBoard = async () => {
	const leaderBoardJson = JSON.parse(await getValueWithKey("leaderBoardJson"));
	if (leaderBoardJson.length > 100) {
		return leaderBoardJson.splice(0, 100);
	}
	return leaderBoardJson;
};
const getUserPosition = async (userId) => {
	const leaderBoardJson = JSON.parse(await getValueWithKey("leaderBoardJson"));
	const userPosition = leaderBoardJson.findIndex((x) => x.id == `earnedMoneyWeekly_${userId}`);
	if (userPosition > 100) {
		if (userPosition + 2 < leaderBoardJson.length-1) {
			return leaderBoardJson.slice(userPosition - 3, userPosition + 3);
		}else{
			return leaderBoardJson.slice(userPosition-3,leaderBoardJson.length-1)
		}
	}else{
		return [];
	}
};
const clearEveryThing = async () => {
	client.keys("*", (error, keys) => {
		client.del(keys);
	});
};
const increasePrizePool = async (value) => {
	const getPrizePool = parseFloat(await getValueWithKey("prizePool"));

	if (!Number.isNaN(getPrizePool)) {
		const sum = getPrizePool + parseFloat(value);
		setKeyAndValue("prizePool", parseFloat(sum).toFixed(2));
	} else {
		setKeyAndValue("prizePool", parseFloat(value).toFixed(2));
	}
};
const dealPrizePool = async () => {
	const prizePool = parseFloat(await getValueWithKey("prizePool"));
	const leaderBoardJson = JSON.parse(await getValueWithKey("leaderBoardJson"));
	if (Number.isNaN(prizePool)) {
		return;
	}
	const firstRemain = prizePool * 0.2;
	const secondRemain = prizePool * 0.15;
	const thirdRemain = prizePool * 0.1;
	const remainingPrize = prizePool - firstRemain - secondRemain - thirdRemain;
	if (leaderBoardJson.length > 3) {
		if (leaderBoardJson.length > 100) {
			leaderBoardJson.slice(0, 100);
		}
		const totalUser = leaderBoardJson.length - 1;
		for (let i = 0; i < 3; i++) {
			let user = leaderBoardJson[i];
			const userId = user.id.replace("earnedMoneyWeekly_", "");
			switch (i) {
				case 0:
					await updateMoney({
						id: userId,
						money: firstRemain
					});
					break;
				case 1:
					await updateMoney({
						id: userId,
						money: secondRemain
					});
					break;
				case 2:
					await updateMoney({
						id: userId,
						money: thirdRemain
					});
					break;
			}
		}
		for (let index = totalUser, altKullaniciIndex = 1; index >= 3; index--, altKullaniciIndex++) {
			const user = leaderBoardJson[index];
			const userId = user.id.replace("earnedMoneyWeekly_", "");
			const verilecekMiktar = remainingPrize / (totalUser - 3) * (index / 100);
			const altKullanicininAlmadigiPara = remainingPrize / (totalUser - 3) * ((100 - altKullaniciIndex) / 100);
			await updateMoney({
				id: userId,
				money: verilecekMiktar + altKullanicininAlmadigiPara
			});
		}
	}
	await clearEveryThing();
};
module.exports = {
	setKeyAndValue,
	getValueWithKey,
	calculateLeaderBoard,
	setDailyDiff,
	getLeaderBoard,
	getUserPosition,
	clearEveryThing,
	increasePrizePool,
	dealPrizePool,
	getUsersDailyDiff
};
