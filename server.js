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

	app.get('/', async function (req, res) {
		let matches = await db.getUpcomingMatches();
		res.render('index.html', { matches , date : (d) => ( date(d)) });
	})
	.get('/teams/:team', async function (req, res) {
		let team = await db.getTeam(req.params.team);
		res.render('team.html', {team});
	})
	.get('/match/:match', async function (req, res) {
		let match = await db.getMatch(req.params.match);
		res.render('match.html', {match});
	});
	app.listen(8080);

	console.log("Listening on port 8080 !");
}).catch(error => {
	console.log(error);
});
