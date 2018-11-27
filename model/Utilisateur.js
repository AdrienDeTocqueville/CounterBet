const mongo = require('mongoose');

var utilisateurSchema = new mongo.Schema({
    pseudo : String,
    points : Number,
    mail : String,
    paris : [
        {
            pari : mongo.Schema.Types.ObjectId,
            ref : 'PariModel'
        }
    ]
});

var UtilisateurModel = mongo.model('UtilisateurModel', utilisateurSchema);

module.exports = UtilisateurModel;