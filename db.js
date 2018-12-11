const mongo = require("mongodb").MongoClient;
const { HLTV } = require("hltv");

let db = null;

async function updateMatches(ids) {
	let updates = [];
	let collec = db.collection("matches");

	for (id of ids)
	{
		let newVal = await downloadMatch(id, false);
		updates.push(collec.updateOne({ id }, {$set: newVal}, { upsert: true }));
	}
	return Promise.all(updates);
}

async function downloadTournament(id, insert) {
	console.log("Downloading tournament");
	let tournament = await HLTV.getEvent({id}).then(event => ({
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
}

async function downloadMatch(id, insert) {
	console.log("Downloading match");
	let match = await HLTV.getMatch({id}).then(match => ({
		id: id,
		title: match.title,
		team1: match.team1,
		team2: match.team2,
		winner: match.winnerTeam,
		date: match.date,
		live: match.live,
		cote: 1,
		tournament: match.event,
		streams: match.streams,
		format: match.format
	}));
	
	if (insert || insert === undefined)
		db.collection("matches").insertOne(match);
	return match;
}

async function downloadTeam(id, insert) {
	console.log("Downloading team");
	let team = await HLTV.getTeam({id}).then(team => ({
		id: id,
		name: team.name,
		rank: team.rank,
		players: team.players
	}));
	
	if (insert || insert === undefined)
		db.collection("teams").insertOne(team);
	return team;
}

function getUpcomingMatches(max) {
	return db.collection("matches")
		.find({$or: [{date: {$gt: Date.now()}}, {live: true}]})
		.sort({date: 1})
		.limit(max || 10)
		.toArray();
}

async function getTournament(id) {
	let tournament = await db.collection("tournaments").findOne({id: parseInt(id)});
	return tournament || downloadTournament(id);
}

async function getMatch(id) {
	let match = await db.collection("matches").findOne({id: parseInt(id)});
	return match || downloadMatch(id);
}

async function getTeam(id) {
	let team = await db.collection("teams").findOne({id: parseInt(id)});
	return team || downloadTeam(id);
}

function getUser(username) {
	return db.collection("users").findOne({username});
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

	updateDB();
	//setInterval(updateDB, refreshTime);

	return client;
}

function updateDB() {
	console.log("\x1b[33mUpdating database\x1b[0m");

	let live = db.collection("matches").find({live: true}).toArray();
	let upcoming = HLTV.getMatches().then(matches => {
		let liveM = matches.filter(m => m.live);
		let others = matches.filter(m => !m.live);
		others = others.sort((a, b) => {
			return (a-b);
		});
		others = others.sort((a, b) => {
			return (a-b);
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

async function register(a) {
	try {
		let res = await db.collection('users').insertOne(a);
		console.log(a.username);
		if(res.result.ok == 1){
		return a.username;
		}
	}
	catch(e){
		console.log("Could not find Username");
		console.log(e);
	}
}

module.exports = {
	getUpcomingMatches,
	getTournament,
	getMatch,
	getTeam,
	getUser,

	register,

	connect
};
