const mongo = require("mongodb").MongoClient;
const { HLTV } = require("hltv");

let db = null;

function downloadMatches() {
	return HLTV.getMatches().then(matches => {
		let updates = [];
		let collec = db.collection("matches");
		for (match of matches)
			updates.push(collec.updateOne({ id: match.id }, {$set: match}, { upsert: true }));
		return Promise.all(updates);
	});
}

async function downloadMatch(id) {
	let match = await HLTV.getMatch({id}).then(match => ({
		id: id,
		title: match.title,
		team1: match.team1,
		team2: match.team2,
		winner: match.winnerTeam,
		date: match.date,
		cote: 1,
		tournament: match.event,
		streams: match.streams,
		format: match.format
	}));
	
	db.collection("matches").insertOne(match);
	return match;
}

async function downloadTeam(id) {
	let team = await HLTV.getTeam({id}).then(team => ({
		id: id,
		name: team.name,
		rank: team.rank,
		players: team.players
	}));
	
	db.collection("teams").insertOne(team);
	return team;
}


function getUpcomingMatches(max) {
	return db.collection("matches")
		.find({date: {$gt: Date.now()}})
		.sort({date: 1})
		.limit(max || 10)
		.toArray();
}

async function getMatch(id) {
	let match = await db.collection("matches").findOne({id});
	return match || downloadMatch(id);
}

async function getTeam(id) {
	let team = await db.collection("teams").findOne({id});
	return team || downloadTeam(id);
}

function getUser(username) {
	return db.collection("utilisateur").findOne({username});
}

async function connect(url) {
	url = url || "mongodb://127.0.0.1:27017";

	try {
		let client = await mongo.connect(url, { useNewUrlParser: true });
		console.log("Connected to database");

		db = client.db("counterbet");
		return client;
	}
	catch (e) {
		console.log("Could not connect to database");
		console.log(e);
	}
}

module.exports = {
	downloadMatches,

	getUpcomingMatches,
	getMatch,
	getTeam,
	getUser,

	connect
};
