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

function listutilisateur(){
    const mongo = require('mongoose');

    var utilisateurSchema = new mongo.Schema({
        pseudo : String,
        points : Number,
        mail : String,
        paris : [
            {
                type : mongo.Schema.Types.ObjectId,
                ref : "PariModel"
            }
        ]
    });

    var UtilisateurModel = mongo.model('UtilisateurModel', utilisateurSchema);
    return UtilisateurModel;
}
var Utilisateur = listutilisateur();

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
	}).get('/utilisateur/:uti', function(req,res) {
		db.getUtilisateur(req.params.uti).then(utilisateurs => {
            res.render('utilisateur.html', {utilisateurs: utilisateurs});
    	});
	}).get('/login', function(req,res) {
            res.render('login.html');
    	});

	app.listen(8080);

	console.log("Listening on port 8080 !");
}).catch(error => {
	console.log(error);
});


