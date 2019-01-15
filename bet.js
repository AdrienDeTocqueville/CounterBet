const db = require("./db.js");

async function register_bet(req)
{
<<<<<<< HEAD
	db.addbet(bet);
	db.checkMatches();
	console.log(bet);
=======
	let username = req.session.username;
	if (!username)
		return {error: 1, msg: 'Not connected'};
	//TODO: refuse bet if match is live
	//if (...)
		//return {error: 1, msg: 'Match already started'};


	let bet;
	try {
		bet = JSON.parse(req.body.json);
	} catch (e) {
		return {error: 3, msg: 'Invalid payload'};
	}


	if (bet.cancel)
	{
		let res = await db.removeBet(username, bet.id);
		if (res.result.ok)
			return {msg: 'Success'};
	}
	else
	{
		let res = await db.addBet(username, bet);
		if (res.result.ok)
			return {msg: 'Success'};
	}

	return {error: 2, msg: 'Unknown error. Try again'};
>>>>>>> e58283e0d37d466adf2a650ce6731f52560ebe74
}

module.exports = {
	register_bet
};
