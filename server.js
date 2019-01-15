const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");

const nunjucks = require('nunjucks');

const db = require("./db.js");
const bet = require("./bet.js");
const time = require("./time.js");
const matchUtils = require("./match.js");


var app = express();

var path = require('path');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(session({
	saveUninitialized: false,
	cookie: {secure: false},
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
	app.get('/', async function (req, res) {
		let matches = await db.getUpcomingMatches();
		try_goto(matches, res, req, 'index.html', { matches, date: time.toString});
	})
	.get('/team/:team', async function (req, res) {
		let team = await db.getTeam(req.params.team);
		try_goto(team, res, req, 'team.html', { team });
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
	.get('/user/:username', async function (req, res) {
		let user = await db.getUser(req.params.username);
		try_goto(user, res, req, 'user.html', { user });
	})
	.get('/leaderboard', async function (req, res) {
		do_goto(res, req, 'leaderboard.html');
	})
	.get('/calendar', async function (req, res) {
		do_goto(res, req, 'calendar.html');
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
	.post('/login', async function (req, res) {
		req.session.username = await db.login(req.body);
		if (req.session.username)
			res.redirect(`/user/${req.session.username}`);
		else
			res.redirect("/login?fail=true");

	})
	.post('/register', async function (req, res) {
		if (await db.register(req.body))
			res.redirect("/");
		else
			res.redirect("/register?fail=true");
	})
	.post('/bet', async function(req,res) {
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
