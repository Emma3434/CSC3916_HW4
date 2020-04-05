var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();
module.exports = app; // for testing
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

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

router.route('/users/:userId')
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

router.route('/movies/:movieId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.movieId;
        Movie.findById(id, function(err, movie) {
            if (err) res.send(err);

            var movieJson = JSON.stringify(movie);
            // return that movie
            res.json(movie);
        });
    });

router.route('/movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find(function (err, movies) {
            if (err) res.send(err);
            // return the movies
            res.json(movies);
        });
    });

router.route('/reviews/:reviewId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.reviewId;
        Review.findById(id, function(err, review) {
            if (err) res.send(err);

            var reviewJson = JSON.stringify(review);
            // return that review
            res.json(review);
        });
    });

router.route('/reviews')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Review.find(function (err, reviews) {
            if (err) res.send(err);
            // return the reviews
            res.json(reviews);
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
                if (err.code == 11000)
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
    //userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

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

// movies routes
router.get('/movies', authJwtController.isAuthenticated, function(req,res)
{
    res.send({status: 200, msg: 'Get movies',headers: {headers: req.headers}, query: req.query})
});
router.post('/movies', authJwtController.isAuthenticated, function(req,res)
{
    if (!req.body.title||!req.body.year_released||!req.body.genre||!req.body.name1||!req.body.cname1
        ||!req.body.name2||!req.body.cname2||!req.body.name3||!req.body.cname3) {
        res.json({success: false, message: 'Please enter ALL the necessary fields: title, year released, genre, actor name 1,' +
                'character name 1, actor name 2, character name 2, actor name 3, character name 3.'});
    }
    else {
        var movie = new Movie();
        movie.title = req.body.title;
        movie.year_released = req.body.year_released;
        movie.genre = req.body.genre;
        movie.actors.Actor1.ActorName = req.body.name1;
        movie.actors.Actor1.CharacterName = req.body.cname1;
        movie.actors.Actor2.ActorName = req.body.name2;
        movie.actors.Actor2.CharacterName = req.body.cname2;
        movie.actors.Actor3.ActorName = req.body.name3;
        movie.actors.Actor3.CharacterName = req.body.cname3;

        // save the movie
        movie.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A movie with that title already exists. '});
                else
                    return res.send(err);
            }

            res.json({ success: true, message: 'Movie created!', movie: movie });
        });
    }
});
router.put('/movies', authJwtController.isAuthenticated, function(req,res)
{
    res.send({status: 200, msg: 'movie altered',headers: {headers: req.headers}, query: req.query})
});

router.delete('/movies', authJwtController.isAuthenticated, function(req,res)
{
    res.send({status: 200, msg: 'movie deleted',headers: {headers: req.headers}, query: req.query})
});

// reviews routes
router.get('/reviews', authJwtController.isAuthenticated, function(req,res)
{
    if (req.body.review === true)
    {
        res.send({status: 200, msg: 'Get movies',headers: {headers: req.headers}, query: req.query})
    }
});
router.post('/reviews', authJwtController.isAuthenticated, function(req,res)
{
    if (!req.body.comment||!req.body.rating) {
        res.json({success: false, message: 'Please enter ALL the necessary fields: comment and rating.'});
    }
    else {
        var review = new Review();

        /*
        review.reviewerID = req.body.userID;
        review.movieID = req.body.movieID;
         */

        review.reviewerID = 'req.body.userID';
        review.movieID = 'req.body.movieID';
        review.comment = req.body.comment;
        review.rating = req.body.rating;

        // save the review
        review.save(function(err) {
            if (err) {
                    return res.send(err);
            }

            res.json({ success: true, message: 'review created!', review: review });
        });
    }
});
app.use('/', router);
app.listen(process.env.PORT || 8080);
