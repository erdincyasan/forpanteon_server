const express = require("express");
const router = express.Router();
const {
	getLeaders,
	getLeadersWithIncludedUser,
	setRandomlyMoneyToUsers,clearData,getDailyDifferenceUsers
} = require("../controllers/LeaderBoard.controller");
const {dealPrizePool}=require('../scripts/redisClient');
router.get("/", getLeaders);
router.get("/user/:id", getLeadersWithIncludedUser);
router.get("/setRandomlyMoneyToUsers", setRandomlyMoneyToUsers);
router.get('/clearData',clearData)
router.get("/dealPrizePool",(req,res)=>{
	dealPrizePool();
	res.status(200).send({
		message:"Para başarılı bir şekilde dağıtıldı!",
	})
});
router.post('/getUsersDailyDifference',getDailyDifferenceUsers)
module.exports = router;
