var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

// movie schema definition:
var MovieSchema = new Schema({
    title: {type: String, required: true},
    year: {type: Number, required: true},
    genre: {type: String, enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller',
            'Western'], required: true},
    actors: {type:[{actorName: String, charName: String}], required: true},
    imageUrl: {type: String},
    avgRating:{type: Number}

});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);
