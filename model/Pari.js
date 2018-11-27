const mongo = require('mongoose');

var pariSchema = new mongo.Schema({
    pointpari : Number,
    equipepari : Number,

});

pariSchema.virtual('utilisateurs', {
    ref : 'utilisateur',
    localField : '_id',
    foreignField : 'paris'
})

var PariModel = mongo.model('PariModel',pariSchema);

module.exports = PariModel;