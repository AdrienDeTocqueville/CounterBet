const db = require("./db.js");

async function register_bet(bet)
{
	db.addbet(bet);
	db.checkMatches();
	console.log(bet);
}

module.exports = {
	register_bet
};
