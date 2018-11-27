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

function downloadMatch(id) {
	return HLTV.getMatch({id}).then(match => ({
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
	})).then(match => {
		db.collection("matches").insertOne(match)
		return match;
	});
}

function downloadTeam(id) {
	return HLTV.getTeam({id}).then(team => ({
		id: id,
		name: team.name,
		rank: team.rank,
		players: team.players
	})).then(team => {
		db.collection("teams").insertOne(team)
		return team;
	});
}


function getUpcomingMatches(max) {
	return db.collection("matches").find().sort({id: 1}).limit(max || 10).toArray();
}

function getMatch(id) {
	return db.collection("matches").findOne({id})
	.then(res => {
		if (res == null)
			return downloadMatch(id);
		return res;
	}).catch(err => {
		console.log(err);
	});
}

function getTeam(id) {
	return db.collection("teams").findOne({id})
	.then(res => {
		if (res == null)
			return downloadTeam(id);
		return res;
	}).catch(err => {
		console.log(err);
	});
}


function connect() {
	return mongo.connect("mongodb://127.0.0.1:27017", { useNewUrlParser: true }).then(client => {
		db = client.db("counterbet");

		console.log("Connected to database");
		return client;
	});
}


module.exports = {
	downloadMatches,

	getUpcomingMatches,
	getMatch,
	getTeam,
	
	connect
};
