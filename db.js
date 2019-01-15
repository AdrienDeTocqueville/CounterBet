const mongo = require("mongodb").MongoClient;
const { HLTV } = require("hltv");
const crypto = require("crypto");

let db = null;

function parse_match(id, raw) {
	let match = {
		id,
		tournament: raw.event,
		format: raw.format,

		team1: raw.team1,
		team2: raw.team2,
		winner: raw.winnerTeam,

		date: raw.date,
		live: raw.live,
		streams: raw.streams
	};

	if (match.winner && raw.maps) {
		let wins = [0, 0];
		let score;
		for (let map of raw.maps) {
			score = map.result.substring(0, map.result.search(" "));
			score = score.split(':').map(x => parseInt(x))
			if (score.length != 2)
				break;

			if (score[0] > score[1])
				wins[0]++;
			if (score[0] < score[1])
				wins[1]++;
		}
		match.score = (raw.maps.length == 1) ? score : wins;
	}

	match.cote = 1;

	return match;
}

async function updateMatches(ids) {
	let updates = [];
	let collec = db.collection("matches");

	for (id of ids) {
		let newVal = await downloadMatch(id, false);
		updates.push(collec.updateOne({ id }, { $set: newVal }, { upsert: true }));
	}
	return Promise.all(updates);
}

async function downloadTournament(id, insert) {
	console.log("Downloading tournament #" + id);
	try {
		let tournament = await HLTV.getEvent({ id }).then(event => ({
			id: id,
			name: event.name,
			startDate: event.dateStart,
			endDate: event.dateEnd,
			prizePool: event.prizePool,
			teams: event.teams,
			location: event.location
		}));

		if (insert || insert === undefined)
			db.collection("tournaments").insertOne(tournament);
		return tournament;
	} catch (e) {
		return null;
	}
}

async function downloadMatch(id, insert) {
	console.log("Downloading match #" + id);
	try {
		let match = parse_match(id, await HLTV.getMatch({ id }));

		if (insert || insert === undefined)
			db.collection("matches").insertOne(match);
		return match;
	} catch (e) {
		return null;
	}
}

async function downloadTeam(id, insert) {
	console.log("Downloading team #" + id);
	try {
		let team = await HLTV.getTeam({ id }).then(team => ({
			id: id,
			name: team.name,
			rank: team.rank,
			players: team.players
		}));

		if (insert || insert === undefined)
			db.collection("teams").insertOne(team);
		return team;
	} catch (e) {
		return null;
	}
}

function getUpcomingMatches(max) {
	return db.collection("matches")
		.find({ $or: [{ date: { $gt: Date.now() } }, { live: true }] })
		.sort({ date: 1 })
		.limit(max || 10)
		.toArray();
}

function getMatches(team1, team2, max, before) {
	max = max || 10;
	before = before || Date.now();

	let query;
	if (team2)
		query = { $or: [{ team1, team2 }, { team1: team2, team2: team1 }] }
	else
		query = { $or: [{ team1: team1 }, { team2: team1 }] }

	return db.collection("matches")
		.find({ $and: [query, { winner: { $ne: null } }, { date: { $lt: before } }] })
		.sort({ date: 1 })
		.limit(max)
		.toArray();
}

async function getTournament(id) {
	if (isNaN(id = parseInt(id)))
		return null;
	let tournament = await db.collection("tournaments").findOne({ id });
	return tournament || downloadTournament(id);
}

async function getMatch(id) {
	if (isNaN(id = parseInt(id)))
		return null;
	let match = await db.collection("matches").findOne({ id });
	return match || downloadMatch(id);
}

async function getTeam(id) {
	if (isNaN(id = parseInt(id)))
		return null;
	let team = await db.collection("teams").findOne({ id });
	return team || downloadTeam(id);
}

function getUser(username) {
	return db.collection("users").findOne({ username });
}

function getBet(username, matchId) {
	return db.collection("users").findOne({
		username,
		bets: {
			$elemMatch: {
				id: matchId
			}
		}
	}, {
			projection: { "bets.$": 1 }
		});
}


async function connect(url, refreshTime) {
	url = url || "mongodb://127.0.0.1:27017";
	refreshTime = refreshTime || (1000 * 60 * 20); // 20 minutes default

	let client;
	try {
		let client = await mongo.connect(url, { useNewUrlParser: true });
		db = client.db("counterbet");

		console.log("Connected to database");
	}
	catch (e) {
		console.log("\x1b[31mCould not connect to database\x1b[0m");
		console.log(e);
		return null;
	}

	//updateDB();
	//setInterval(updateDB, refreshTime);

	return client;
}

function updateDB() {
	console.log("\x1b[33mUpdating database\x1b[0m");

	let live = db.collection("matches").find({ live: true }).toArray();
	let upcoming = HLTV.getMatches().then(matches => {
		let liveM = matches.filter(m => m.live);
		let others = matches.filter(m => !m.live);
		// Sort twice because otherwise it doesn't work
		others = others.sort((a, b) => {
			return (a - b);
		});
		others = others.sort((a, b) => {
			return (a - b);
		});
		return liveM.concat(others.slice(0, 10 - liveM.length));
	});

	Promise.all([live, upcoming]).then((values) => {
		values = values[0].map(x => x.id).concat(values[1].map(x => x.id));
		updateMatches(values).catch(e => {
			console.log("\x1b[31mFailed to update matches\x1b[0m");
			console.log(e);
		});
	})
}

function hashPassword(pass) {
	let algorithm = 'aes256';
	let secret = 'l5JmP+G0/1zB%;r8B8?2?2pcqGcL^3';
	let cipher = crypto.createCipher(algorithm, secret);
	return cipher.update(pass, 'utf8', 'hex') + cipher.final('hex');
}

function unhashPassword(pass) {
	let algorithm = 'aes256';
	let secret = 'l5JmP+G0/1zB%;r8B8?2?2pcqGcL^3';
	let decipher = crypto.createDecipher(algorithm, secret);
	return decipher.update(pass, 'hex', 'utf8') + decipher.final('utf8');
}

function verifyRegister(user) {
	const mailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

	if (!user.mail.match(mailRegex))
		return null;
	if (user.password != user.confirm)
		return null;

	user.password = hashPassword(user.password);
	delete user._id;
	delete user.confirm;

	return user;
}

async function register(user) {
	user = verifyRegister(user);
	if (user) {
		try {
			await db.collection('users').insertOne(user);
		}
		catch (e) {
			console.log(e);
			return null;
		}
	}
	return user;
}

async function login(user) {
	let res = await db.collection("users").findOne({ username: user.username });
	if (res != null) {
		if (user.password == unhashPassword(res.password))
			return user.username;
	}
	return null;
}

async function addBet(username, bet) {
	return db.collection("users").updateOne({ username }, {
		$push: { bets: bet }
	});
}

async function removeBet(username, matchId) {
	return db.collection("users").updateOne({ username }, {
		$pull: { bets: { id: matchId } }
	});
}

async function checkMatches() {
	let test = await db.collection("matches").find({ winner: null }).toArray();
	var date = new Date();
	var tab = [];
	for (i = 0; i < test.length; i++) {
		if (date > test[i].date) {
			tab.push(test[i].id);
		}
	}
	console.log(updateMatches(tab));

}

async function checkpoint(username) {
	let test = await db.collection("users").findOne({ username: username });
	let bet = test.bets;
	let idbet = [];
	let teambet = [];
	let point=test.point;
	for (i = 0; i < bet.length; i++) {
		idbet.push(bet[i].id);
		teambet.push(bet[i].team);
		let match = await db.collection("matches").findOne({ id: idbet[i] });
		let ggmatche = match.winner;
		if (ggmatche != null && ggmatche.name == teambet[i]) {
			let newpoint = point +  parseInt(bet[i].num) ;
			db.collection("users").updateOne({ username : username }, {$set: { point : newpoint }});
		} else {
			console.log("not gg");
			
		}
	}
}



module.exports = {
	getUpcomingMatches,
	getTournament,
	getMatches,
	getMatch,
	getTeam,
	getUser,
	getBet,

	register,
	login,
	addBet,
	removeBet,

	connect,

	checkMatches,
	checkpoint
};
