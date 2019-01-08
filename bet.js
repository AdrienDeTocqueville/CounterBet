const db = require("./db.js");

async function register_bet(bet)
{
	db.addbet(bet);
	console.log(bet);
}

module.exports = {
	register_bet
};
