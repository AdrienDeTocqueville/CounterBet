const db = require("./db.js");

async function getUser(user) {
	user = await db.getUser(user);	

	if (user && user.bets) {
		for (let bet of user.bets)
			bet.match = await db.getMatch(bet.id);
	}

	return user;
}

module.exports = {
	getUser
};
