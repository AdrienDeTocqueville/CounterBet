const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require("body-parser");
const crypto = require("crypto");
const db = require("./db.js");
const time = require("./time.js");

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

db.connect().then(() => {
	db.downloadMatches().then(values => {
		console.log("Updated match database")
	}).catch(error => {
		console.log(error)
	});

	app.get('/', async function (req, res) {
		let matches = await db.getUpcomingMatches();
		res.render('index.html', { matches, date: time.toString });
	})
		.get('/teams/:team', async function (req, res) {
			let team = await db.getTeam(req.params.team);
			res.render('team.html', { team });
		})
		.get('/match/:match', async function (req, res) {
			let match = await db.getMatch(req.params.match);
			res.render('match.html', { match });
		})
		.get('/user/:username', async function (req, res) {
			let user = await db.getUser(req.params.username);
			if (user)
				res.render('user.html', { user });
			else
				res.render('404.html');
		})
		.get('/login', function (req, res) {
			res.render('login.html');
		})
		.post('/post-feedback', async function (req, res) {
			delete req.body._id; // for safety reasons
			let username = await db.register(req.body);
			if (username) {
				res.redirect("/user/" + username);
			}

		})



	app.listen(8080);
	console.log("Listening on port 8080 !");
}).catch(error => {
	console.log(error);
});


