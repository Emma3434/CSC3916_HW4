// === FROM EXTERNAL FILES === //
var cors               =  require( 'cors' );
var express            =  require( 'express' );
var http               =  require( 'http' );
var bodyParser         =  require( 'body-parser' );
var passport           =  require( 'passport' );
var authController     =  require( './auth' );
var authJwtController  =  require( './auth_jwt' );
var jwt                =  require( 'jsonwebtoken' );
var User               =  require( './user' );
var Movie              =  require( './movie' );
var Review             =  require( './review' );
var userController     =  require( './usercontroller' );
var movieController    =  require( './moviecontroller' );
var reviewController   =  require( './reviewController' );
require( './mydb.js' );


// === CREATE THE APP === //
var app  =  express( );

// === SET UP BODY PARSER === //
app.use( cors() );
app.use( bodyParser.json( ) );
app.use( bodyParser.urlencoded( { extended : false } ) );

// === SET UP PASSPORT === //
app.use( passport.initialize( ) );

// === CREATE ROUTER === //
var router  =  express.Router( );

// === CUSTOM FUNCTION TO GENERATE RETURN MESSAGE FOR BAD ROUTES === //
function getBadRouteJSON( req , res , route )
{
	res.json(	{	
					success:  false, 
					msg:      req.method + " requests are not supported by " + route
				});
}

// === CUSTOM FUNCTION TO RETURN JSON OBJECT OF HEADER, KEY, AND BODY OF REQUEST === //
function getJSONObject( req ) 
{
    var json = {
					headers  :  "No Headers",
					key      :  process.env.UNIQUE_KEY,
					body     :  "No Body"
				};

    if ( req.body != null ) 
        json.body  =  req.body;
	
    if ( req.headers != null ) 
        json.headers  =  req.headers;

    return json;
}

// === CUSTOM FUNCTION TO RETURN JSON OBJECT OF STATUS, MESSAGE, HEADER, QUERY, & ENVIRONMENT KEY FOR /MOVIES === //
function getMoviesJSONObject( req , msg )
{
	var json = {
					status   :  200,
					message  :  msg,
					headers  :  "No Headers",
					query    :  "No Query String",
					env      :  process.env.UNIQUE_KEY
				};
	
	if ( req.query != null )
		json.query  =  req.query; 

	if ( req.headers != null )
		json.headers  =  req.headers;
	
	return json;
}



// === ROUTES TO /POST PERFORM A "SMART ECHO" WITH BASIC AUTH === //
router.route('/post')
    .post(
		authController.isAuthenticated, 
		function ( req , res ) 
		{
            console.log( req.body );
            res  =  res.status( 200 );
            if ( req.get( 'Content-Type' ) ) 
			{
                console.log( "Content-Type: " + req.get( 'Content-Type' ) );
                res  =  res.type( req.get( 'Content-Type' ) );
            }
            var o  =  getJSONObject( req );
            res.json( o );
        });

		
		
// === ROUTES TO /POSTJWT PERFORM AN "ECHO" WITH JWT AUTH === //
router.route( '/postjwt' )
    .post(
		authJwtController.isAuthenticated, 
		function ( req , res )
		{
            console.log( req.body );
            res  =  res.status( 200 );
            if ( req.get( 'Content-Type' ) ) 
			{
                console.log( "Content-Type: " + req.get( 'Content-Type' ) );
                res  =  res.type( req.get( 'Content-Type' ) );
            }
            res.send( req.body );
        }
    );
	
router.route( '/findallusers' )
    .post( userController.findAllUsers );

	
	
// === ROUTES TO /SIGNUP === //
router.route( '/signup' )
	// === HANDLE POST REQUESTS === //
	.post( userController.signUp )
	// === ALL OTHER ROUTES TO /SIGNUP ARE REJECTED === //
	.all(
		function( req , res )
		{ 
			getBadRouteJSON( req , res , "/signup" ); 
		});

		
		
// === ROUTES TO /SIGNIN === //
router.route( '/signin' )
	// == HANDLE POST REQUESTS === //
	.post( userController.signIn )
	// === ALL OTHER ROUTES TO /SIGNIN  ARE REJECTED
	.all(
		function( req , res )
		{ 
			getBadRouteJSON( req , res , "/signin" ); 
		});

// === ROUTES TO /MOVIES === //
router.route( '/movies' )
	// === HANDLE GET REQUESTS === //
	.get(
			authJwtController.isAuthenticated, 
			movieController.getMovies 
		)
	// === HANDLE POST REQUESTS === //
	.post(
			authJwtController.isAuthenticated,
			movieController.postMovie
		)
	// === HANDLE PUT REQUESTS === //
	.put(
			authJwtController.isAuthenticated, 
			movieController.putMovie
		)
	// === HANDLE DELETE REQUESTS === //
	.delete(
			authJwtController.isAuthenticated, 
			movieController.deleteMovie
		)
	// === REJECT ALL OTHER REQUESTS TO /MOVIES === //
	.all(
		function( req , res )
		{ 
			getBadRouteJSON( req , res , "/movies" );
		});
		
// === ROUTES TO /REVIEWS === //
router.route( '/reviews' )
	// === HANDLE GET REQUESTS === //
	.get( reviewController.getReviews )
	
	// === HANDLE POST REQUESTS === //
	.post(
			authJwtController.isAuthenticated,
			reviewController.postReview // TODO change to reviewController.postReview
		)
	// === REJECT ALL OTHER REQUESTS TO /MOVIES === //
	.all(
		function( req , res )
		{ 
			getBadRouteJSON( req , res , "/movies" );
		});
		

// === ATTEMPT TO ROUTE REQUEST === //
app.use( '/' , router );

// === IF UNEXPEDTED ROUTE IS SENT, REJECT IT HERE === //
app.use(
	function( req , res )
	{ 
		getBadRouteJSON( req , res , "this URL path" ); 
	});

// === LISTEN ON THE ENVIRONMENT PORT OR 8080 === //
app.listen( process.env.PORT || 8080 );

// === EXPORT APP FOR TESTS === //
module.exports  =  app; // for testing