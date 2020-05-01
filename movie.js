// === GRAB EXTERNAL RESOURCES === //
var mongoose  =  require( 'mongoose' );
var Schema    =  mongoose.Schema;

// === CREATE THE USER SCHEMA === //
var movieSchema  =  new Schema({
		title        :	{ 
							type     : String, 
							required : true,
							unique   : true
						},
		yearReleased :	{
							type     : String,
							required : true
						},
		genre        :	{
							type     : String,
							enum     : [ "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Thriller", "Western" ],
							required : true
						},
		actors       :	{
							type     :	Array,
							required :	true,
							items    :	{
											actorName     : String,
											characterName : String
										},
							minItems : 3
						},
		imageUrl	 :  {
							type : String
						}
	});
	
// === CREATE THE USER MODEL === //
var Movie  =  mongoose.model( 'Movie' , movieSchema );

// === EXPORT THE USER MODEL === //
module.exports  =  Movie;