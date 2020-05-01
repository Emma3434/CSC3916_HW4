// === GRAB EXTERNAL RESOURCES === //
var mongoose  =  require( 'mongoose' );
var Schema    =  mongoose.Schema;

// === CREATE THE USER SCHEMA === //
var userSchema  =  new Schema({
		name       :	{ 
							type     : String, 
							required : true 
						},
		username   :	{
							type     : String,
							required : true,
							unique   : true
						},
		password   :	{
							type     : String,
							required : true
						}
	});
	
// === CREATE THE USER MODEL === //
var User  =  mongoose.model( 'User' , userSchema );

// === EXPORT THE USER MODEL === //
module.exports  =  User;