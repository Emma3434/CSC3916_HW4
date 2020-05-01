var express = require('express');
var bodyParser = require('body-parser');            //parse the database value with .attribute
var passport = require('passport');                 //allow us to use the JWT Authentication
var authJwtController = require('./auth_jwt');      //
var jwt = require('jsonwebtoken');                  //allow use of token on sign in method
var cors = require('cors');

var User = require('./Users');
var Movie = require('./movie');
var Review = require('./review');

var app = express();
module.exports = app; // for testing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(cors());
var router = express.Router();

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')      //search for user by user id, from the pass in parameter
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, message: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)  //11000 mean user with that user name already exist
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ success: true, message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;
    //this select allow you to get password for this function only
    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, message: 'Authentication failed.'});
            }
        });


    });
});

// /Movies Route & CRUD Function (Create, read, update, delete)
//POST - save new entry to db
//PUT - update existing entry in db
//DELETE - delete movie entry
//GET - get movie info from title


//https://stackoverflow.com/questions/35813854/how-to-join-multiple-collections-with-lookup-in-mongodb
//HW4: add so that user can look up review with movie search
//HW5: add function to return all movie if title is not specify
router.route('/movies') //OK
    .get(authJwtController.isAuthenticated, function (req, res) {

            if (req.query.movieId != null)   /*req.boyd.title doesnt exist in the HW5*/
            {
                Movie.findOne({title: req.body.title}, function (err, found) {

                    if (err) {
                        res.json({message: "Invalid query"});
                    }
                    if (found) {
                        if (req.query.review == "true") {
                            Movie.aggregate([
                                {
                                    $lookup: {
                                        from: "reviews",
                                        localField: "title",
                                        foreignField: "movie",
                                        as: "reviews"
                                    },
                                },
                                {
                                    $match: {
                                        "title": req.body.title
                                    }

                                }

                            ], function (err2, found2) {
                                if (err2) {

                                } else {
                                    res.json({message: "Here are the review", found2: found2});
                                }
                            })

                        } else {
                            res.json({message: "Here are movie info", found: found});
                        }
                    } else {
                        res.json({message: "Entry not found"});
                    }

                });


            } else {
                Movie.find({}, function (err2, x) {
                        if (x) {
                            if (req.query.reviews == "true") {
                                Movie.aggregate([
                                    {
                                        $lookup: {
                                            from: "reviews",
                                            localField: "title",
                                            foreignField: "movie",
                                            as: "reviews"
                                        },
                                    }], function (err3, movieList) {
                                    if (movieList) {
                                        res.json(movieList);
                                    }
                                })

                            } else {
                                res.json(x);
                            }

                        }
                    }
                )

            }
        }
    )


    .post(authJwtController.isAuthenticated, function (req,res) {
        //find if movie exist, if not add
        var movie = new Movie();
        movie.title = req.body.title;
        movie.year = req.body.year;
        movie.genre = req.body.genre;
        movie.actors = req.body.actors;

        Movie.findOne({title: req.body.title}, function(err, found){
            if(err){
                res.json({message: "Invalid query"});
            }
            if(found){
                res.json({message: "Movie already existed"});
            }
            else if (movie.actors.length < 3){
                res.json({message: "Invalid Entry. Please make sure you have at least 3 actors"});
            }
            else{
                movie.save(function (err) {
                    if(err){
                        res.json({message: "Invalid Entry. Please check your field(s)"});
                    }
                    else{
                        res.json({message: "Movie entry created"});
                    }
                })
            }

        });

    })

    //update entry that is found from title
    .put(authJwtController.isAuthenticated, function (req, res) {
            if (req.body.title != null && req.body.year != null && req.body.genre && req.body.actors.length >= 3) {
                Movie.findOneAndUpdate({title: req.body.Find},
                    {
                        title: req.body.title,
                        year: req.body.year,
                        genre: req.body.genre,
                        actors: req.body.actors

                    }, function (err, found) {
                        if (found) {
                            res.json({message: "Entry Updated"});
                        } else {
                            res.json({message: "Entry not found"});
                        }

                    });
            }
            else{
                res.json({message: "Please check that your fields are not null, and that you have at least 3 actors"});
            }
        }
    )


    .delete(authJwtController.isAuthenticated, function (req, res) {
            Movie.findOneAndDelete({title: req.body.title}, function(err, found){
                if(err){
                    res.json({message: "Invalid query"});
                }
                if(found){
                    res.json({message: "Entry deleted"});
                }
                else{
                    res.json({message: "Entry not found"});
                }

            });
        }
    )


router.route('/review')
    .post(authJwtController.isAuthenticated, function (req, res) {
        // get username from token
        //https://stackoverflow.com/questions/33451298/nodejs-retrieve-user-infor-from-jwt-token

        const usertoken = req.headers.authorization;
        const token = usertoken.split(' ');
        const decoded = jwt.verify(token[1], process.env.SECRET_KEY);

        Movie.findOne({title: req.body.movie}, function(err, found){
            if(err){
                res.json({message: "Invalid query"});
            }
            if(found) {
                //save review
                var entry = new Review();
                entry.reviewer = decoded.username;
                entry.review = req.body.review;
                entry.rating = req.body.rating;
                entry.movie = req.body.movie;

                entry.save(function (err) {
                    if(err){
                        res.json({message: "Invalid Entry. Please check your field(s)"});
                    }
                    else{
                        //ab=vfRating()
                        res.json({message: "Review entry created"});
                    }
                })
            }
            else
            {
                res.json({message: "Entry not found"});
            }

        });
})




app.use('/', router);
app.listen(process.env.PORT || 8080);