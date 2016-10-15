var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var db = require(libs + 'db/mongoose');

var log = require(libs + 'log')(module);
var User = require(libs + 'model/user');

var ObjectId = require('mongodb').ObjectId; 

var AccessToken = require(libs + 'model/accessToken');
var RefreshToken = require(libs + 'model/refreshToken');


///////////////////////////////////////////////////	
// получение информации о текущем юзере, чей токен
// /info
router.get('/info', passport.authenticate('bearer', { session: false }),
function(req, res) {
	// req.authInfo is set using the `info` argument supplied by
	// `BearerStrategy`.  It is typically used to indicate scope of the token,
	// and used in access control checks.  For illustrative purposes, this
	// example simply returns the scope in the response.
	//(id, email, firstName, lastName)

	prolong(req.user.userId);
	
		res.json({ 
			user_id: 		req.user.userId, 
			email: 			req.user.email, 
			firstname:	req.user.firstName, 
			lastname: 	req.user.lastName, 
			scope: 			req.authInfo.scope 
		});
	}
);

///////////////////////////////////////////////////	
// получение всех юзеров
// /all/
router.get('/all', passport.authenticate('bearer', { session: false }),
	function(req, res) {
	prolong(req.user.userId);
		User.find({}, "_id lastName firstName", function(err, users){
			if(err)
				next(err);
			else
				res.json(users);
		});
	}
);

///////////////////////////////////////////////////	
// получение всех друзей указанного юзера
// /friends/:id/
router.get('/friends/:id', passport.authenticate('bearer', { session: false }),
	function(req, res) {
	prolong(req.user.userId);
	User.findById(req.params.id, function (err, user) {
		
		if(!user) {
			res.statusCode = 404;
			
			return res.json({ 
				error: 'Not found' 
			});
		}
		
		if (!err) {
			// Выбираем друзей текущего польз
			var frs=[];	
			var frsall=[];	
			for (var i = 0; i<user.friends.length; i++){
				frs.push(user.friends[i].idUser);
			};	
			//--------------------------------------------			
			User.find({ "_id": { $in: frs } }, "_id firstName lastName ", function(err, users){
				if(err)
					next(err);
				else{
					for (var i = 0; i < users.length; i++){
						for (var j = 0; j<user.friends.length; j++){
							if(user.friends[j].idUser == users[i]['_id']){
								frsall.push({
									"id"								:users[i]['_id'],
									"firstName"					:users[i]['firstName'],
									"lastName"					:users[i]['lastName'],
									"friendshipDuration":user.friends[j].friendshipDuration,
									"friendshipType"		:user.friends[j].friendshipType
								});
							};
						};
					};				
					return res.json(frsall);
				}
			});
			//--------------------------------------------			
		}else{
			res.statusCode = 500;
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			
			return res.json({ 
				error: 'Server error' 
			});
		}
	});
});
	

///////////////////////////////////////////////////	
// /register
//router.post('/register', passport.authenticate('bearer', { session: false }), function(req, res) {
//	
router.post('/register', 
function(req, res) {
//	prolong(req.user.userId);
	
	var beginUser = new User({
		username:			req.body.login,
		password: 		req.body.pass,
		firstName: 		req.body.firstname,
		lastName: 		req.body.lastname,
		email: 				req.body.email,
		phoneNumber:	req.body.phonenumber
	});
	
	beginUser.save(function (err) {
		if (!err) {
			log.info("New user created with id: %s", beginUser.id);
			return res.json({ 
				status: 'OK', 
				beginUser:beginUser
			});
		} else {
			if(err.name === 'ValidationError') {
				res.statusCode = 400;
				res.json({ 
					error: 'Validation error' 
				});
			} else {
				res.statusCode = 500;
				res.json({ 
					error: 'Server error' 
				});
			}
			log.error('Internal error(%d): %s', res.statusCode, err.message);
		}
	});
});


///////////////////////////////////////////////////	
// /tofriends
router.post('/tofriends', passport.authenticate('bearer', { session: false }), function(req, res) {
	prolong(req.user.userId);

//	var user_id 	= req.user.userId;
	var curUserId = req.user.userId;
	var frId 			= req.body.user2fr;
	var frType 		= req.body.frtype;
	var dt 				= new Date;
	var o_id 			= new ObjectId(curUserId);
//	var curUser 	= new User();
	
	User.update({"_id":o_id},
	{
		$push : {
			friends :  {
				"idUser"							: frId,
				"friendshipType"			: frType,
				"friendshipDuration"	: dt
			}
		}
	},
	function (err) {
		if (!err) {
			log.info("New user append to friends with id: %s", frId);
			return res.json({ 
				status: 'OK', 
				curUserId:curUserId,
				o_id:o_id,
				dt:dt,
				newFriend:frId,
				typeFriend:frType
			});
		} else {
			if(err.name === 'ValidationError') {
				res.statusCode = 400;
				res.json({ 
					error: 'Validation error' 
				});
			} else {
				res.statusCode = 500;
				res.json({ 
					error: 'Server error' 
				});
			}
			log.error('Internal error(%d): %s', res.statusCode, err.message);
		}
	});
});


///////////////////////////////////////////////////	
// /outfriends
router.post('/outfriends', passport.authenticate('bearer', { session: false }), function(req, res) {
	prolong(req.user.userId);

	var curUserId = req.user.userId;
	var frId 			= req.body.user2fr;
	var o_id 			= new ObjectId(curUserId);
	
	User.update({"_id":o_id},
		{
			$pull : {
				friends :  {
					"idUser": frId
				}
			}
		},
	function (err) {
		if (!err) {
			log.info("User removed from friends with id: %s", frId);
			return res.json({ 
				status: 'OK', 
				curUserId:curUserId,
				o_id:o_id,
				removedFriend:frId
			});
		} else {
			if(err.name === 'ValidationError') {
				res.statusCode = 400;
				res.json({ 
					error: 'Validation error' 
				});
			} else {
				res.statusCode = 500;
				res.json({ 
					error: 'Server error' 
				});
			}
			log.error('Internal error(%d): %s', res.statusCode, err.message);
		}
	});
});

///////////////////////////////////////////////////	
// /delltokens
router.get('/delltokens', passport.authenticate('bearer', { session: false }), function(req, res) {

	var o_id 			= new ObjectId(req.user.userId);

	AccessToken.remove({"userId":o_id}, function (err) {
		if (err) {
			return log.error(err);
		}
	});

	RefreshToken.remove({"userId":o_id}, function (err) {
		if (err) {
			return log.error(err);
		}
	});

	return res.json({ 
		status: 'OK', 
		description:'Removed access/refresh tokens for user id: '+ req.user.userId
	});				

});

///////////////////////////////////////////////////	
// Пролонгируем действие токенов с текущего момента на значение, указанное в настройках
function prolong(userId) {
	var o_id 			= new ObjectId(userId);
	var dt 				= new Date;
	
	AccessToken.update({"userId":o_id},	{"created":dt},
	function (err) {
		if (!err) {
			log.info("Access token prolonged from: ", dt);
		} else {
			log.error('Internal error');
		}
	});

	RefreshToken.update({"userId":o_id},	{"created":dt},
	function (err) {
		if (!err) {
			log.info("Refresh token prolonged from: ", dt);
		} else {
			log.error('Internal error');
		}
	});

}
///////////////////////////////////////////////////	


module.exports = router;