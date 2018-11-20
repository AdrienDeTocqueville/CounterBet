var express = require('express');
var nunjucks = require('nunjucks');
var mongo = require("mongodb").MongoClient;
const {HLTV} = require("hltv");

var app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app

});

mongo.connect("mongodb://localhost/counterbet", {useNewUrlParser: true}, function(error, db) {
	    if (error) return funcCallback(error);

	    console.log("Connecté à la base de données !");

});

app.get('/', function(req, res) {
	HLTV.getMatches().then(matches => {
		res.render('index.html', {matches});
	})
}).get('/teams', function(req, res) {

	res.render('teams.html', {teams: [{name: "Astralis"}, {name: "Astralis"}]});
});
app.listen(8080);
