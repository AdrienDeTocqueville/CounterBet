const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");

const nunjucks = require('nunjucks');

const db = require("./db.js");
const bet = require("./bet.js");
const time = require("./time.js");
const matchUtils = require("./match.js");
const userUtils = require("./user.js");


var app = express();

var path = require('path');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(session({
	saveUninitialized: false,
	cookie: { secure: false },
	secret: 'keyboard cat',
	resave: false
}));


nunjucks.configure("views", {
	autoescape: true,
	noCache: true,
	express: app
});


function try_goto(condition, res, req, file, ctx) {
	if (condition)
		do_goto(res, req, file, ctx);
	else
		do_goto(res, req, '404.html');
}

function do_goto(res, req, file, ctx) {
	ctx = ctx || {};

	if (req.session.username)
		ctx._user = {
			name: req.session.username
		};
	res.render(file, ctx);
}

db.connect().then(() => {

	// PAGES
	app.get('/', async function (req, res) {
		let matches = await db.getUpcomingMatches();
		let users = await db.getLeaderboard(5);
		let teams = await db.getBestTeams(5);
		try_goto(matches, res, req, 'index.html', { matches, users, teams, date: time.toString });
	})
	.get('/match/:match', async function (req, res) {
		let match = await matchUtils.getMatch(req);
		try_goto(match, res, req, 'match.html', { match, date: time.toString });
	})
	.get('/tournament/:tournament', async function (req, res) {
		let tournament = await db.getTournament(req.params.tournament);
		try_goto(tournament, res, req, 'tournament.html', { tournament, date: time.toString });
	})
	.get('/teams/:team', async function (req, res) {
		let team = await db.getTeam(req.params.team);
		try_goto(team, res, req, 'team.html', { team });
	})
	.get('/match/:match', async function (req, res) {
		let match = await db.getMatch(req.params.match);
		try_goto(match, res, req, 'match.html', { match });
	})
	.get('/user/:name', async function (req, res) {
		let user = await userUtils.getUser(req.params.name);
		try_goto(user, res, req, 'user.html', { user, date: time.toString });
	})
	.get('/leaderboard', async function (req, res) {
		let users = await db.getLeaderboard(10);
		let teams = await db.getBestTeams(10);
		do_goto(res, req, 'leaderboard.html', { users, teams });
	})
	.get('/calendar', async function (req, res) {
		let matches = await db.getUpcomingMatches();
		do_goto(res, req, 'calendar.html', { matches, date: time.toString });
	})
	.get('/login', async function (req, res) {
		do_goto(res, req, 'login.html');
	})
	.get('/register', function (req, res) {
		do_goto(res, req, 'register.html');
	})
	.get('/logout', function (req, res) {
		req.session.username = null;
		res.redirect('/');
	})

	// ENDPOINTS
	app.post('/login', async function (req, res) {
		let response = await db.login(req);
		res.end(JSON.stringify(response));
	})
	.post('/register', async function (req, res) {
		let response = await db.register(req.body);
		res.end(JSON.stringify(response));
	})
	.post('/bet', async function (req, res) {
		let response = await bet.register_bet(req);
		res.end(JSON.stringify(response));
	})


	app.get('/*', (req, res) => { res.render('404.html'); });

	app.listen(8080);
	console.log("\x1b[33mListening on port 8080 !\x1b[0m");
})
.catch(error => {
	console.log(error);
});
