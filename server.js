const express = require('express');
const nunjucks = require('nunjucks');

const db = require("./db.js");

var app = express();
app.use(express.static('public'));

nunjucks.configure("views", {
	autoescape: true,
	express: app

});

function date(d) {
	var d = new Date(d);
	var options = {  weekday: 'long', day: 'numeric' ,
        month: 'numeric', hour:'numeric' ,minute : 'numeric'  };
	var d= d.toLocaleDateString('en-GB', options);
	return d;
}

db.connect().then(() => {
	db.downloadMatches().then(values => {
		console.log("Updated match database")
	}).catch(error => {
		console.log(error)
	});

	app.get('/', function (req, res) {
		db.getUpcomingMatches().then(matches => {
			res.render('index.html', { matches , date : (d) => ( date(d)) });
		});
	}).get('/teams/:team', function (req, res) {
		db.getTeam(req.params.team).then(team => {
			res.render('team.html', team);
		});
	}).get('/match/:match', function (req, res) {
		db.getMatch(req.params.match).then(match => {
			res.render('match.html', match);
		});
	});
	app.listen(8080);

	console.log("Listening on port 8080 !");
}).catch(error => {
	console.log(error);
});

require('./model/Utilisateur');
require('./model/Pari');
app.use('/utilisateur', require('./routes/utilisateur'));
app.use('/pari', require('./routes/pari'));
