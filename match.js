const url = require('url');
const db = require("./db.js");

function getStreamUrl(match) {
	for (s of match.streams) {
		if (url.parse(s.link).host == 'player.twitch.tv')
			return s.link;
	}
	return null;
}

async function process(match) {
	if (match)
	{
		// Stream
		match.streamURL = getStreamUrl(match);
		match.streams = undefined;

		if (!match.team1 || !match.team2)
			return;

		// History
		async function get_history(team1, team2) {
			let hist = await db.getMatches(team1, team2, 5, match.date);

			hist.forEach(m => {
				if (m.team1.id != team1.id) {
					let temp = m.team2;
					m.team2 = m.team1;
					m.team1 = temp;
					m.score.reverse();
				}
			})
			return hist;
		}

		match.history = await get_history(match.team1, match.team2);
		match.team1.history = await get_history(match.team1, null);
		match.team2.history = await get_history(match.team2, null);

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
	}
	return match;
}

module.exports = {
	process
};
