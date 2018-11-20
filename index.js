var express = require('express');
var nunjucks = require('nunjucks');
var mongo = require("mongodb").MongoClient;
const {HLTV} = require("hltv");

var app = express();
app.use(express.static('public'));

nunjucks.configure("views", {
    autoescape: true,
    express: app

});

function downloadMatches(collec)
{
	HLTV.getMatches().then(matches => {
		collec.insertMany(matches);
	})
}

mongo.connect("mongodb://127.0.0.1:27017", {useNewUrlParser: true}, function(error, client) {
	if (error) return funcCallback(error);
	const db = client.db("counterbet");
	const matches = db.collection("matches");

	console.log("Connecté à la base de données !");

	//downloadMatches(matches);

	app.get('/', function(req, res) {
		matches.find().toArray().then(data => {
			res.render('index.html', {matches: data});
		});
	}).get('/teams', function(req, res) {
		res.render('teams.html', {teams: [{name: "Astralis"}, {name: "Astralis"}]});
	});
	app.listen(8080);
});
