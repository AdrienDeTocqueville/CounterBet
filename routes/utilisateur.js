var routeur = require('express').Router();

var Utilisateur = require('./../model/Utilisateur');

routeur.get('/utilisateur', (req,res) => {
    Utilisateur.find({}).populate('paris').then(utilisateurs => {
        res.render('utilisateur.html',{utilisateurs : utilisateurs});
    });
});

module.exports = routeur;
