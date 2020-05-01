// === LOAD REQUIRED PACKAGES === //
var passport       =  require( 'passport' );
var BasicStrategy  =  require( 'passport-http' ).BasicStrategy;
var userController =  require( './usercontroller' );
var crypto         =  require( 'crypto' );

// === BASIC AUTHENTICATION STRATEGY === //
passport.use(
	new BasicStrategy(
		function( username , password , done ) 
		{
			// === ATTEMPT TO RETRIEVE USER FROM DATABASE === //
			userController.findUserByLogin( username , password )
				.then(
					function( user )
					{
						// === IF USER IS FOUND === //
						if ( user )
						{
							return done( null , { name: user.username } );
						}
						// === OTHERWISE FAIL === //
						else
						{
							return done( null , false );
						}
					});
		}
	));

// === SEND WHETHER AUTHENTICATION FAILS OR NOT === //
exports.isAuthenticated  =  passport.authenticate( 'basic' , { session : false } );