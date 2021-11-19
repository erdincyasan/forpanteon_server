/* 
    Bu dosya kullanıcılara para eklemek için oluşturulmuştur
    para eklemenin temel sebebi redis dosyalarının
    kontrolü ve sıralama işlemlerinin sağlık kontrolüdür.

*/
const redisClient = require("./redisClient");
const { findAllUsers, updateMoney } = require("../services/User.service");
const tempAddMoneyRandomly = async () => {
	const users = await findAllUsers();

	users.forEach(async (user) => {
		console.log(user.id);
		await updateMoney({
			id: user._id,
			money: Math.floor(Math.random() * 100)
		});
	});
};
module.exports = tempAddMoneyRandomly;
