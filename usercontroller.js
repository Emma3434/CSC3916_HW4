const User    =  require( "./user" );
var   jwt     =  require( 'jsonwebtoken' );
var   crypto  =  require( 'crypto' );

exports.findAllUsers = 
	( req , res ) => 
	{
		User.find(
			{},
			( err , user ) =>	
			{
				if( err )
				{
					res.status( 500 ).send( err );
				}
				res.status( 200 ).json( user );
			});
	};
	
exports.signUp = 
	( req , res ) => 
	{
		// ensure all credentials are entered
		if ( !req.body.name || !req.body.username || !req.body.password ) 
		{
			res.status( 500 ).json({	
									success  :  false, 
									msg      :  'Please pass name, username, and password.'
								});
			return;
		} 
		// ensure no duplicate username
		User.findOne(
			{ username : req.body.username },
			( err , user ) =>
			{
				if ( err ) 
				{
					res.status( 500 ).send( err );
				}
				if ( user != null )
				{
					res.status( 401 ).send({
											success : false,
											msg     : 'A user with that username already exists'
										});
				}
				else
				{
					let hashpass  =  crypto.createHmac('sha256', process.env.SECRET_KEY)
										.update(req.body.password)
										.digest('hex');
					let user      =  new User({
											name      :  req.body.name,
											username  :  req.body.username,
											password  :  hashpass
										});
					user.save(
						( err , user ) =>	
						{
							if( err )
							{
								res.status( 500 ).send( err );
							}
							res.status( 200 ).send({
													success : true,
													msg     : "User Successfully Created"
												});
						});
				}
			});
	};
	
exports.signIn = 
	( req , res ) =>
	{
		if ( !req.body.username || !req.body.password ) 
		{
			res.status( 500 ).json({	
									success  :  false, 
									msg      :  'Please pass username, and password.'
								});
			return;
		} 
		let hashpass  =  crypto.createHmac('sha256', process.env.SECRET_KEY)
							.update(req.body.password)
							.digest('hex');
		User.findOne(
			{ 
				username : req.body.username, 
				password : hashpass
			},
			( err , user ) =>
			{
				if( err )
				{
					res.status( 500 ).send( err );
				}
				if ( !user )
				{
					res.status( 401 ).json({
												success : false,
												msg     : 'Invalid Username or Password'
										});
					return;
				}
				let userToken =	 {  
									id       : user._id,
									username : user.username
								 };
				let token     =  jwt.sign( userToken , process.env.SECRET_KEY );
				res.status( 200 ).json({ 
											success  : true,
											name     : user.name,
											username : user.username,
											token    :  'JWT ' + token
									});
			});
	};
	
exports.findUserByLogin = 
	async function ( uname , pword )
	{
		let hashpass  =  crypto.createHmac('sha256', process.env.SECRET_KEY)
							.update(pword)
							.digest('hex');
		let user      = await User.findOne( { username : uname, password: hashpass } );
		return user;
	};
	
exports.findUserById = 
	async function ( jwt_payload )
	{
		let user = await User.findById( jwt_payload.id );
		return user;
	};
	
	
