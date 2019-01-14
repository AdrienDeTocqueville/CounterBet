const url = require('url');
const db = require("./db.js");

function getStreamUrl(match) {
	for (s of match.streams) {
		if (url.parse(s.link).host == 'player.twitch.tv')
			return s.link;
	}
	return null;
}

async function getMatch(req) {
	let user = req.session.username;
	let match = await db.getMatch(req.params.match)

	if (match)
	{
		// Stream
		match.streamURL = getStreamUrl(match);
		match.streams = undefined;

		if (!match.team1 || !match.team2)
			return;

		// Matches
		function filter(arr) {
			return arr.filter(m => m.id != match.id);
		}

		match.history = db.getMatches(match.team1, match.team2, 5).then(filter);
		match.team1.history = db.getMatches(match.team1, 5).then(filter);
		match.team2.history = db.getMatches(match.team2, 5).then(filter);

		// Teams
		let promise = [db.getTeam(match.team1.id), db.getTeam(match.team2.id)];

		try {
			match = await Promise.all(promise).then((teams) => {
				match.team1.rank = teams[0].rank;
				match.team1.players = teams[0].players;
				
				match.team2.rank = teams[1].rank;
				match.team2.players = teams[1].players;
				return match;
			});
		} catch (e) {
			return null;
		}

		// Bet
		let bet = db.getBet(user, match.id).then(bet => {
			if (bet)
				match.bet = bet.bets[0];
		});

		// Wait for requests
		await Promise.all([
			match.history,
			match.team1.history,
			match.team2.history,
			bet
		]);
	}
	return match;
}

module.exports = {
	getMatch
};
