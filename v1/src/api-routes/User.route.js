const express = require("express");
const {
	createUser,
	getAllUsers,
	updateMoneyByUserId,
	getDetailById,
	resetDailyDif,
	calculateBoard,
	getUserByIds
} = require("../controllers/User.controller");

const addMoneyToUsersRandomly=require("../scripts/addMoneyToUsers");
const { setDailyDiff } = require("../scripts/redisClient");
const router = express.Router();
router.get("/", getAllUsers);
router.post('/all/ids',getUserByIds);
router.post("/", createUser);
router.post("/updateUserMoney/:id", updateMoneyByUserId);
router.get("/:id", getDetailById);
router.get("/r/resetDailyDiff", resetDailyDif);
router.get("/c/calculate", calculateBoard);
router.get("/sd/dailydiff", async (req, res) => {
	await setDailyDiff();
	global.io.emit('changeTable');
	res.status(200).send("OK");
});
router.get('/addRandomlyMoney/random',(req,res)=>{
	addMoneyToUsersRandomly();
	res.status(200).send({
		message:"Kullanıcılara rasgele paralar eklendi!"
	})
})
module.exports = router;
