const db = require("./db.js");

async function register_bet(req)
{
	//db.checkMatches();
	let username = req.session.username;
	if (!username)
		return {error: 1, msg: 'Not connected'};

	let bet;
	try {
		bet = JSON.parse(req.body.json);
	} catch (e) {
		return {error: 4, msg: 'Invalid payload'};
	}

	let match = await db.getMatch(bet.id);
	if (match.date < Date.now())
		return {error: 2, msg: 'Match already started'};


	if (bet.cancel)
	{
		let res = await db.removeBet(username, bet.id);
		if (res.result.ok)
			return {msg: 'Success'};
	}
	else
	{
		let res = await db.addBet(username, bet);
		db.checkpoint(username);
		if (res.result.ok)
			return {msg: 'Success'};
	}

	return {error: 3, msg: 'Unknown error. Try again'};
}

module.exports = {
	register_bet
};
