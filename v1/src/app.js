const express = require("express");
const configs = require("./configs/index");
const loaders = require("./loaders/index");
const cron = require("node-cron");
const cors = require("cors");
const socketIO = require("socket.io");
const http = require("http");
const { UserRoute, LeaderBoardRoute } = require("./api-routes/index");
const scripts = require("./scripts/index");
cron.schedule("0 0 * * *", () => {
	scripts.redisClient.setDailyDiff();
});
cron.schedule("0 0 * * 1",()=>{
	scripts.redisClient.dealPrizePool();
})
configs();
loaders();
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = socketIO(server, {
	transports: [ "polling" ],
	cors: {
		cors: {
			origin: "http://localhost:3000"
		}
	}
});	
global.io=io;
const APP_PORT = process.env.APP_PORT || 3000;
server.listen(APP_PORT, () => {
	console.log(`App is running on port ${APP_PORT}`);
	app.use("/users", UserRoute);
	app.use("/leaders", LeaderBoardRoute);
});
