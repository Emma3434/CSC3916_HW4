var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
//TODO: Review https://mongoosejs.com/docs/validation.html

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

// movie schema
var MovieSchema = new Schema({
    title: {type: String, required: true},
    year_released: {type: String, required: true},
    genre: {type: String, required: true},
    actors:{
        Actor1:{ActorName: {type: String, required: true}, CharacterName: {type: String, required: true}},
        Actor2:{ActorName: {type: String, required: true}, CharacterName: {type: String, required: true}},
        Actor3:{ActorName: {type: String, required: true}, CharacterName: {type: String, required: true}}
    }

});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);