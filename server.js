const express = require('express');
const nunjucks = require('nunjucks');

const db = require("./db.js");
const time = require("./time.js");
const matchUtils = require("./match.js");

var app = express();

app.use(express.static('public'));

nunjucks.configure("views", {
	autoescape: true,
	noCache: true,
	express: app
});

db.connect().then(() => {
	app.get('/', async function (req, res) {
		let matches = await db.getUpcomingMatches();
		res.render('index.html', { matches, date: time.toString});
	})
	.get('/teams/:team', async function (req, res) {
		let team = await db.getTeam(req.params.team);
		res.render('team.html', {team});
	})
	.get('/match/:match', async function (req, res) {
		let match = await db.getMatch(req.params.match);
		res.render('match.html', {match: matchUtils.process(match), date: time.toString});
	})
	.get('/tournament/:tournament', async function (req, res) {
		let tournament = await db.getTournament(req.params.tournament);
		res.render('tournament.html', {tournament, date: time.toString});
	})
	.get('/user/:username', async function(req,res) {
		let user = await db.getUser(req.params.username);
		if (user)
			res.render('user.html', {user});
		else
			res.render('404.html');
	})
	.get('/login', function(req,res) {
            res.render('login.html');
    	});

	app.listen(8080);
	console.log("\x1b[33mListening on port 8080 !\x1b[0m");
}).catch(error => {
	console.log(error);
});


