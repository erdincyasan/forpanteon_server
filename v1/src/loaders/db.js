const mongoose = require("mongoose");
const initDataIfrequired = require("../scripts/initData");
const db = mongoose.connection;
db.once("open", () => {
	console.log("Db connected successfully");
	initDataIfrequired();
});

const connectDB = async () => {
	mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
};

module.exports = connectDB;
