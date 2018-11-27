var express = require('express');
var nunjucks = require('nunjucks');
var mongo = require("mongodb").MongoClient;


const { HLTV } = require("hltv");

let db = null;

var app = express();
app.use(express.static('public'));

nunjucks.configure("views", {
	autoescape: true,
	express: app

});


function downloadMatches(collec) {
	HLTV.getMatches().then(matches => {
		collec.insertMany(matches);
	})
}

function dlTeam(id) {
	HLTV.getTeam({id}).then(team => {
		team = {
			id,
			name: team.name,
			rank: team.rank,
			players: team.players
		}
		db.collection("teams").insertOne(team);
	})
}

function getTeam(id) {
	db.collection("teams").findOne({id})
	.then(team => {
		if (team == null)
			return dlTeam(id);
		//resolve(
	}).catch(err => {
		console.log("err" + err);
	});
}

function date(d) {
	var d = new Date(d);
	var options = {  weekday: 'long', day: 'numeric' ,
        month: 'numeric', hour:'numeric' ,minute : 'numeric'  };
	var d= d.toLocaleDateString('en-GB', options);
	return d;
}

mongo.connect("mongodb://127.0.0.1:27017", { useNewUrlParser: true })
.then(client => {
	console.log("Connected to database");

	db = client.db("counterbet");
	const matches = db.collection("matches");

	//downloadMatches(matches);

	app.get('/', function (req, res) {
		matches.find().toArray().then(data => {
			res.render('index.html', { matches: data , date : (d) => ( date(d)) });
		});
	}).get('/teams', function (req, res) {
		res.render('teams.html', { teams: [{ name: "Astralis" }, { name: "Astralis" }] });
	});
	app.listen(8080);

	console.log("Listening on port 8080 !");
}).catch(error => {
	console.log(error);
});
