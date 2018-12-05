const url = require('url');

function getStreamUrl(match) {
	for (s of match.streams) {
		if (url.parse(s.link).host == 'player.twitch.tv')
			return s.link;
	}
	return null;
}

function process(match) {
	match.streamURL = getStreamUrl(match);
	match.stream = undefined;
	return match;
}

module.exports = {
	process
};
