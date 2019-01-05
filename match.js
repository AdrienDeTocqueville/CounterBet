const url = require('url');
const db = require("./db.js");

function getStreamUrl(match) {
	for (s of match.streams) {
		if (url.parse(s.link).host == 'player.twitch.tv')
			return s.link;
	}
	return null;
}

function process(match) {
	if (match)
	{
		match.streamURL = getStreamUrl(match);
		match.streams = undefined;

		let t1 = db.getTeam(match.team1.id);
		let t2 = db.getTeam(match.team2.id);

		return Promise.all([t1, t2]).then((teams) => {
			match.team1.rank = teams[0].rank;
			match.team1.players = teams[0].players;
			
			match.team2.rank = teams[1].rank;
			match.team2.players = teams[1].players;
			return match;
		})
		.catch(() => {return null});
	}
}

module.exports = {
	process
};
