const faker = require("faker");
const { findAllUsers, insertUser } = require("../services/User.service");

const initDataIfRequired = async () => {
    const users = await findAllUsers();
	if (users.length  <= 0) {
		for (let index = 0; index < 1000; index++) {
			const newUser = await insertUser({
				name: faker.name.findName(),
				country: faker.company.companyName(),
				money: Math.floor(Math.random()*1000000)
			});
		}
	}
};

module.exports = () => initDataIfRequired();
