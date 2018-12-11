const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require("body-parser");
const crypto = require("crypto");
const db = require("./db.js");
const time = require("./time.js");
const matchUtils = require("./match.js");

var app = express();


var path = require('path');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, 'public')));


nunjucks.configure("views", {
	autoescape: true,
	noCache: true,
	express: app
});

function try_goto(condition, res, name, ctx)
{
	if (condition)
		res.render(name, ctx);
	else
		res.render('404.html');
}

db.connect().then(() => {
	app.get('/', async function (req, res) {
		let matches = await db.getUpcomingMatches();
		try_goto(matches, res, 'index.html', { matches, date: time.toString });
	})
	.get('/team/:team', async function (req, res) {
		let team = await db.getTeam(req.params.team);
		try_goto(team, res, 'team.html', {team});
	})
	.get('/match/:match', async function (req, res) {
		let match = matchUtils.process(await db.getMatch(req.params.match));
		try_goto(match, res, 'match.html', { match, date: time.toString });
	})
	.get('/tournament/:tournament', async function (req, res) {
		let tournament = await db.getTournament(req.params.tournament);
		try_goto(tournament, res, 'tournament.html', {tournament, date: time.toString});
	})
	.get('/teams/:team', async function (req, res) {
		let team = await db.getTeam(req.params.team);
		try_goto(team, res, 'team.html', { team });
	})
	.get('/match/:match', async function (req, res) {
		let match = await db.getMatch(req.params.match);
		try_goto(match, res, 'match.html', { match });
	})
	.get('/user/:username', async function (req, res) {
		let user = await db.getUser(req.params.username);
		try_goto(user, res, 'user.html', { user });
	})
	.get('/leaderboard', async function (req, res) {
		res.render('leaderboard.html');
	})
	.get('/calendar', async function (req, res) {
		res.render('leaderboard.html');
	})
	.get('/login', async function (req, res) {
		res.render('login.html');
	})
	.post('/post-feedback', async function (req, res) {
		delete req.body._id; // for safety reasons
		let username = await db.register(req.body);
		if (username) {
			res.redirect("/user/" + username);
		}

	})


	app.get('/*', () => {res.render('404.html');});

	app.listen(8080);
	console.log("\x1b[33mListening on port 8080 !\x1b[0m");
})
.catch(error => {
	console.log(error);
});
